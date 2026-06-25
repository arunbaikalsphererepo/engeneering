const { Router } = require("express");
const { pool } = require("../db/pool");
const { z } = require("zod");

const router = Router();

const WorkOrderBody = z.object({
  title:      z.string().min(1),
  area:       z.string().optional(),
  priority:   z.enum(["Critical", "High", "Medium", "Low"]),
  owner:      z.string().optional(),
  stage:      z.string().optional(),
  eta:        z.string().optional(),
  asset:      z.string().optional(),
  department: z.string().optional(),
  source:     z.string().optional(),
  sla:        z.enum(["At risk", "On track", "Waiting", "Met"]).optional(),
});

// GET /api/work-orders
router.get("/", async (req, res) => {
  const stage = req.query.stage;
  if (stage) {
    const { rows } = await pool.query(
      "SELECT * FROM work_orders WHERE stage = $1 ORDER BY created_at DESC", [stage]
    );
    return res.json(rows.map(toCamel));
  }
  const { rows } = await pool.query("SELECT * FROM work_orders ORDER BY created_at DESC");
  res.json(rows.map(toCamel));
});

// GET /api/work-orders/:id
router.get("/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM work_orders WHERE id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(toCamel(rows[0]));
});

// POST /api/work-orders
router.post("/", async (req, res) => {
  const body = WorkOrderBody.parse(req.body);
  const id = `WO-${String(Date.now()).slice(-5)}`;

  const { rows } = await pool.query(
    `INSERT INTO work_orders (id, title, area, priority, owner, stage, eta, asset, department, source, sla)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      id, body.title, body.area ?? "", body.priority,
      body.owner ?? "", body.stage ?? "Requested",
      body.eta ?? "", body.asset ?? "",
      body.department ?? "", body.source ?? "",
      body.sla ?? "On track",
    ]
  );
  res.status(201).json(toCamel(rows[0]));
});

// PATCH /api/work-orders/:id
router.patch("/:id", async (req, res) => {
  const allowed = ["stage", "owner", "sla", "eta", "priority"];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      sets.push(`${key} = $${i++}`);
      vals.push(req.body[key]);
    }
  }
  if (!sets.length) return res.status(400).json({ error: "No fields to update" });
  vals.push(req.params.id);
  const { rows } = await pool.query(
    `UPDATE work_orders SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`, vals
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(toCamel(rows[0]));
});

// DELETE /api/work-orders/:id
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM work_orders WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

function toCamel(row) {
  return {
    id: row.id, title: row.title, area: row.area,
    priority: row.priority, owner: row.owner, stage: row.stage,
    eta: row.eta, asset: row.asset, department: row.department,
    source: row.source, sla: row.sla,
  };
}

module.exports = router;
