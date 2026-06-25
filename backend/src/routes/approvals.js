const { Router } = require("express");
const { pool } = require("../db/pool");
const { z } = require("zod");

const router = Router();

const ApprovalBody = z.object({
  item:          z.string().min(1),
  category:      z.string().optional(),
  value:         z.string().optional(),
  requester:     z.string().optional(),
  approver:      z.string().optional(),
  risk:          z.string().optional(),
  status:        z.string().optional(),
  priority:      z.enum(["Critical", "High", "Medium", "Low"]).optional(),
  department:    z.string().optional(),
  asset:         z.string().optional(),
  submitted:     z.string().optional(),
  due:           z.string().optional(),
  justification: z.string().optional(),
  impact:        z.string().optional(),
  documents:     z.array(z.string()).optional(),
});

// GET /api/approvals
router.get("/", async (req, res) => {
  const status = req.query.status;
  if (status) {
    const { rows } = await pool.query(
      "SELECT * FROM approvals WHERE status = $1 ORDER BY created_at DESC", [status]
    );
    return res.json(rows.map(toCamel));
  }
  const { rows } = await pool.query("SELECT * FROM approvals ORDER BY created_at DESC");
  res.json(rows.map(toCamel));
});

// GET /api/approvals/:id
router.get("/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM approvals WHERE id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(toCamel(rows[0]));
});

// POST /api/approvals
router.post("/", async (req, res) => {
  const body = ApprovalBody.parse(req.body);
  const id = `APR-${String(Date.now()).slice(-5)}`;
  const { rows } = await pool.query(
    `INSERT INTO approvals
       (id, item, category, value, requester, approver, risk, status, priority,
        department, asset, submitted, due, justification, impact, documents)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
    [
      id, body.item, body.category ?? "", body.value ?? "",
      body.requester ?? "", body.approver ?? "", body.risk ?? "",
      body.status ?? "Pending", body.priority ?? "Medium",
      body.department ?? "", body.asset ?? "",
      body.submitted ?? "", body.due ?? "",
      body.justification ?? "", body.impact ?? "",
      JSON.stringify(body.documents ?? []),
    ]
  );
  res.status(201).json(toCamel(rows[0]));
});

// PATCH /api/approvals/:id/status
router.patch("/:id/status", async (req, res) => {
  const { status } = z.object({ status: z.string().min(1) }).parse(req.body);
  const { rows } = await pool.query(
    "UPDATE approvals SET status = $1 WHERE id = $2 RETURNING *",
    [status, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(toCamel(rows[0]));
});

// DELETE /api/approvals/:id
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM approvals WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

function toCamel(row) {
  return {
    id: row.id, item: row.item, category: row.category, value: row.value,
    requester: row.requester, approver: row.approver, risk: row.risk,
    status: row.status, priority: row.priority, department: row.department,
    asset: row.asset, submitted: row.submitted, due: row.due,
    justification: row.justification, impact: row.impact, documents: row.documents,
  };
}

module.exports = router;
