const { Router } = require("express");
const { pool } = require("../db/pool");
const { z } = require("zod");

const router = Router();

const EquipmentBody = z.object({
  name:            z.string().min(1),
  category:        z.string().min(1),
  location:        z.string().min(1),
  status:          z.enum(["Healthy", "Attention", "Due Soon", "Critical"]).optional(),
  criticality:     z.enum(["Critical", "High", "Medium", "Low"]).optional(),
  warranty:        z.enum(["Active", "Expired", "Due Soon"]).optional(),
  amc:             z.string().optional(),
  next_service:    z.string().optional(),
  uptime:          z.number().optional(),
  health:          z.number().optional(),
  manufacturer:    z.string().optional(),
  model:           z.string().optional(),
  serial_number:   z.string().optional(),
  owner:           z.string().optional(),
  purchase_date:   z.string().optional(),
  warranty_expiry: z.string().optional(),
  amc_expiry:      z.string().optional(),
});

// GET /api/equipment
router.get("/", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM equipment ORDER BY created_at DESC");
  res.json(rows.map(toCamel));
});

// GET /api/equipment/:id
router.get("/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM equipment WHERE id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(toCamel(rows[0]));
});

// POST /api/equipment
router.post("/", async (req, res) => {
  const body = EquipmentBody.parse(req.body);
  const prefix = (body.category ?? "EQ").slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "EQ");
  const { rows: countRows } = await pool.query("SELECT COUNT(*) FROM equipment");
  const nextNum = Number(countRows[0].count) + 1;
  const id = `EQ-${prefix}-${String(nextNum).padStart(4, "0")}`;

  const { rows } = await pool.query(
    `INSERT INTO equipment
       (id, name, category, location, status, criticality, warranty, amc,
        next_service, uptime, health, manufacturer, model, serial_number,
        owner, purchase_date, warranty_expiry, amc_expiry)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
     RETURNING *`,
    [
      id, body.name, body.category, body.location,
      body.status ?? "Healthy",
      body.criticality ?? "High",
      body.warranty ?? "Active",
      body.amc ?? "Not assigned",
      body.next_service ?? "",
      body.uptime ?? 100,
      body.health ?? 96,
      body.manufacturer ?? null,
      body.model ?? null,
      body.serial_number ?? null,
      body.owner ?? null,
      body.purchase_date ?? null,
      body.warranty_expiry ?? null,
      body.amc_expiry ?? null,
    ]
  );
  res.status(201).json(toCamel(rows[0]));
});

// PUT /api/equipment/:id
router.put("/:id", async (req, res) => {
  const body = EquipmentBody.parse(req.body);
  const { rows } = await pool.query(
    `UPDATE equipment SET
       name=$1, category=$2, location=$3, status=$4, criticality=$5,
       warranty=$6, amc=$7, next_service=$8, uptime=$9, health=$10,
       manufacturer=$11, model=$12, serial_number=$13, owner=$14,
       purchase_date=$15, warranty_expiry=$16, amc_expiry=$17
     WHERE id=$18 RETURNING *`,
    [
      body.name, body.category, body.location,
      body.status ?? "Healthy",
      body.criticality ?? "High",
      body.warranty ?? "Active",
      body.amc ?? "Not assigned",
      body.next_service ?? "",
      body.uptime ?? 100,
      body.health ?? 96,
      body.manufacturer ?? null,
      body.model ?? null,
      body.serial_number ?? null,
      body.owner ?? null,
      body.purchase_date ?? null,
      body.warranty_expiry ?? null,
      body.amc_expiry ?? null,
      req.params.id,
    ]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(toCamel(rows[0]));
});

// DELETE /api/equipment/:id
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM equipment WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

function toCamel(row) {
  return {
    id:             row.id,
    name:           row.name,
    category:       row.category,
    location:       row.location,
    status:         row.status,
    criticality:    row.criticality,
    warranty:       row.warranty,
    amc:            row.amc,
    nextService:    row.next_service,
    uptime:         Number(row.uptime),
    health:         Number(row.health),
    manufacturer:   row.manufacturer,
    model:          row.model,
    serialNumber:   row.serial_number,
    owner:          row.owner,
    purchaseDate:   row.purchase_date,
    warrantyExpiry: row.warranty_expiry,
    amcExpiry:      row.amc_expiry,
  };
}

module.exports = router;
