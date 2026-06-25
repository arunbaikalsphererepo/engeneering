const { Router } = require("express");
const { pool } = require("../db/pool");
const { z } = require("zod");

const router = Router();

const BillBody = z.object({
  type:                   z.enum(["utility", "repair"]),
  category:               z.string().min(1),
  description:            z.string().min(1),
  amount:                 z.number(),
  month:                  z.string().regex(/^\d{4}-\d{2}$/),
  reference:              z.string().optional(),
  billCopyName:           z.string().optional(),
  billCopyDataUrl:        z.string().optional(),
  equipmentIdentity:      z.string().optional(),
  equipmentIdentityLabel: z.string().optional(),
  equipmentIdentityType:  z.enum(["qr", "nonqr"]).optional(),
});

// GET /api/expenditure/bills
router.get("/bills", async (req, res) => {
  const { type, month } = req.query;
  const conditions = [];
  const vals = [];
  if (type)  { conditions.push(`type = $${vals.length + 1}`);  vals.push(type); }
  if (month) { conditions.push(`month = $${vals.length + 1}`); vals.push(month); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM expenditure_bills ${where} ORDER BY created_at DESC`, vals
  );
  res.json(rows.map(billToCamel));
});

// POST /api/expenditure/bills
router.post("/bills", async (req, res) => {
  const body = BillBody.parse(req.body);
  const id = `BILL-${String(Date.now()).slice(-5)}`;
  const { rows } = await pool.query(
    `INSERT INTO expenditure_bills
       (id, type, category, description, amount, month, reference,
        bill_copy_name, bill_copy_data_url, equipment_identity,
        equipment_identity_label, equipment_identity_type, uploaded_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [
      id, body.type, body.category, body.description, body.amount, body.month,
      body.reference ?? "", body.billCopyName ?? null, body.billCopyDataUrl ?? null,
      body.equipmentIdentity ?? null, body.equipmentIdentityLabel ?? null,
      body.equipmentIdentityType ?? null, "Just now",
    ]
  );
  res.status(201).json(billToCamel(rows[0]));
});

// DELETE /api/expenditure/bills/:id
router.delete("/bills/:id", async (req, res) => {
  await pool.query("DELETE FROM expenditure_bills WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

// GET /api/expenditure/budgets
router.get("/budgets", async (_req, res) => {
  const { rows: budgetRows } = await pool.query(
    "SELECT * FROM expenditure_budgets WHERE id = 'default'"
  );
  const base = budgetRows[0] ?? { utility: 0, repair: 0 };

  const { rows: catRows } = await pool.query("SELECT * FROM category_budgets");
  const utilityCategories = catRows
    .filter((r) => r.type === "utility")
    .map((r) => ({ category: r.category, amount: Number(r.amount) }));
  const repairCategories = catRows
    .filter((r) => r.type === "repair")
    .map((r) => ({ category: r.category, amount: Number(r.amount) }));

  const { rows: overrideRows } = await pool.query("SELECT * FROM budget_overrides");
  const overrides = {};
  for (const r of overrideRows) overrides[r.override_key] = Number(r.amount);

  res.json({
    utility: Number(base.utility),
    repair:  Number(base.repair),
    utilityCategories,
    repairCategories,
    overrides,
  });
});

// PUT /api/expenditure/budgets/totals
router.put("/budgets/totals", async (req, res) => {
  const { type, amount } = z.object({ type: z.enum(["utility", "repair"]), amount: z.number() }).parse(req.body);
  await pool.query(
    `INSERT INTO expenditure_budgets (id, utility, repair) VALUES ('default', 0, 0)
     ON CONFLICT (id) DO NOTHING`
  );
  await pool.query(`UPDATE expenditure_budgets SET ${type} = $1 WHERE id = 'default'`, [amount]);
  res.json({ ok: true });
});

// PUT /api/expenditure/budgets/category
router.put("/budgets/category", async (req, res) => {
  const { type, category, amount } = z.object({
    type: z.enum(["utility", "repair"]),
    category: z.string().min(1),
    amount: z.number(),
  }).parse(req.body);
  await pool.query(
    `INSERT INTO category_budgets (type, category, amount) VALUES ($1,$2,$3)
     ON CONFLICT (type, category) DO UPDATE SET amount = EXCLUDED.amount`,
    [type, category, amount]
  );
  res.json({ ok: true });
});

// PUT /api/expenditure/budgets/override
router.put("/budgets/override", async (req, res) => {
  const { type, month, category, amount } = z.object({
    type: z.enum(["utility", "repair"]),
    month: z.string().regex(/^\d{4}-\d{2}$/),
    category: z.string().min(1),
    amount: z.number(),
  }).parse(req.body);
  const key = `${type}:${month}:${category}`;
  await pool.query(
    `INSERT INTO budget_overrides (override_key, amount) VALUES ($1,$2)
     ON CONFLICT (override_key) DO UPDATE SET amount = EXCLUDED.amount`,
    [key, amount]
  );
  res.json({ ok: true });
});

// POST /api/expenditure/budgets/copy-prev-month
router.post("/budgets/copy-prev-month", async (req, res) => {
  const { type, targetMonth } = z.object({
    type: z.enum(["utility", "repair"]),
    targetMonth: z.string().regex(/^\d{4}-\d{2}$/),
  }).parse(req.body);

  const [y, m] = targetMonth.split("-").map(Number);
  const prev = new Date(y, m - 2, 1);
  const prevMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  const { rows: catRows } = await pool.query(
    "SELECT category FROM category_budgets WHERE type = $1", [type]
  );
  for (const { category } of catRows) {
    const prevKey   = `${type}:${prevMonth}:${category}`;
    const targetKey = `${type}:${targetMonth}:${category}`;
    const { rows } = await pool.query(
      "SELECT amount FROM budget_overrides WHERE override_key = $1", [prevKey]
    );
    if (rows.length) {
      await pool.query(
        `INSERT INTO budget_overrides (override_key, amount) VALUES ($1,$2)
         ON CONFLICT (override_key) DO UPDATE SET amount = EXCLUDED.amount`,
        [targetKey, rows[0].amount]
      );
    }
  }
  res.json({ ok: true });
});

function billToCamel(row) {
  return {
    id:                     row.id,
    type:                   row.type,
    category:               row.category,
    description:            row.description,
    amount:                 Number(row.amount),
    month:                  row.month,
    reference:              row.reference,
    billCopyName:           row.bill_copy_name,
    billCopyDataUrl:        row.bill_copy_data_url,
    equipmentIdentity:      row.equipment_identity,
    equipmentIdentityLabel: row.equipment_identity_label,
    equipmentIdentityType:  row.equipment_identity_type,
    uploadedAt:             row.uploaded_at,
  };
}

module.exports = router;
