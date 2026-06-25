const { Router } = require("express");
const { pool } = require("../db/pool");
const { z } = require("zod");

const router = Router();

const StepSchema = z.object({
  name:     z.string(),
  owner:    z.string(),
  sla:      z.string(),
  approval: z.enum(["No", "Yes", "Conditional"]),
  type:     z.string(),
});

const WorkflowBody = z.object({
  name:     z.string().min(1),
  template: z.string().optional(),
  status:   z.enum(["Active", "Draft"]).optional(),
  owner:    z.string().optional(),
  usage:    z.number().optional(),
  updated:  z.string().optional(),
  steps:    z.array(StepSchema).optional(),
});

// GET /api/workflows
router.get("/", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM workflows ORDER BY created_at DESC");
  res.json(rows.map(toCamel));
});

// GET /api/workflows/:id
router.get("/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM workflows WHERE id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(toCamel(rows[0]));
});

// POST /api/workflows
router.post("/", async (req, res) => {
  const body = WorkflowBody.parse(req.body);
  const id = `WF-${String(Date.now()).slice(-5)}`;
  const { rows } = await pool.query(
    `INSERT INTO workflows (id, name, template, status, owner, usage, updated, steps)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      id, body.name, body.template ?? "", body.status ?? "Draft",
      body.owner ?? "", body.usage ?? 0, body.updated ?? "",
      JSON.stringify(body.steps ?? []),
    ]
  );
  res.status(201).json(toCamel(rows[0]));
});

// PUT /api/workflows/:id
router.put("/:id", async (req, res) => {
  const body = WorkflowBody.parse(req.body);
  const { rows } = await pool.query(
    `UPDATE workflows SET name=$1, template=$2, status=$3, owner=$4, usage=$5, updated=$6, steps=$7
     WHERE id=$8 RETURNING *`,
    [
      body.name, body.template ?? "", body.status ?? "Draft",
      body.owner ?? "", body.usage ?? 0, body.updated ?? "",
      JSON.stringify(body.steps ?? []),
      req.params.id,
    ]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(toCamel(rows[0]));
});

// DELETE /api/workflows/:id
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM workflows WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

function toCamel(row) {
  return {
    id: row.id, name: row.name, template: row.template,
    status: row.status, owner: row.owner,
    usage: Number(row.usage), updated: row.updated, steps: row.steps,
  };
}

module.exports = router;
