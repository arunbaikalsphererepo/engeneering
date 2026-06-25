const { Router } = require("express");
const { pool } = require("../db/pool");
const { z } = require("zod");

const router = Router();

const NonQRBody = z.object({
  name:      z.string().min(1),
  category:  z.string().min(1),
  location:  z.string().min(1),
  quantity:  z.number().int().min(1),
  condition: z.enum(["Good", "Fair", "Poor"]),
  notes:     z.string().optional(),
});

// GET /api/non-qr-items
router.get("/", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM non_qr_items ORDER BY created_at DESC");
  res.json(rows.map(toCamel));
});

// GET /api/non-qr-items/:id
router.get("/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM non_qr_items WHERE id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(toCamel(rows[0]));
});

// POST /api/non-qr-items
router.post("/", async (req, res) => {
  const body = NonQRBody.parse(req.body);
  const ts = Date.now();
  const id = `NQ-${String(ts).slice(-4)}`;
  const identity = `NQI-${String(ts).slice(-6)}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

  const { rows } = await pool.query(
    `INSERT INTO non_qr_items (id, identity, name, category, location, quantity, condition, last_checked, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [id, identity, body.name, body.category, body.location, body.quantity, body.condition, "Just now", body.notes ?? null]
  );
  res.status(201).json(toCamel(rows[0]));
});

// DELETE /api/non-qr-items/:id
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM non_qr_items WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

function toCamel(row) {
  return {
    id:          row.id,
    identity:    row.identity,
    name:        row.name,
    category:    row.category,
    location:    row.location,
    quantity:    Number(row.quantity),
    condition:   row.condition,
    lastChecked: row.last_checked,
    notes:       row.notes,
  };
}

module.exports = router;
