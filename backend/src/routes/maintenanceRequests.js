const { Router } = require("express");
const { pool } = require("../db/pool");
const { z } = require("zod");

const router = Router();

const RequestBody = z.object({
  title:       z.string().min(1),
  requestType: z.string().optional(),
  priority:    z.enum(["Critical", "High", "Medium", "Low"]),
  location:    z.string().min(1),
  department:  z.string().optional(),
  assetId:     z.string().optional(),
  reportedBy:  z.string().optional(),
  guestImpact: z.string().optional(),
  targetTime:  z.string().optional(),
  description: z.string().optional(),
});

// GET /api/maintenance-requests
router.get("/", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM maintenance_requests ORDER BY created_at DESC");
  res.json(rows.map(toCamel));
});

// GET /api/maintenance-requests/:id
router.get("/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM maintenance_requests WHERE id = $1", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(toCamel(rows[0]));
});

// POST /api/maintenance-requests
router.post("/", async (req, res) => {
  const body = RequestBody.parse(req.body);

  let assetName = "Not linked";
  if (body.assetId) {
    const { rows: eqRows } = await pool.query("SELECT name FROM equipment WHERE id = $1", [body.assetId]);
    if (eqRows.length) assetName = eqRows[0].name;
  }

  const id = `MR-${String(Date.now()).slice(-5)}`;
  const approver = body.priority === "Critical" ? "Chief Engineer" : "Duty Engineer";

  const { rows } = await pool.query(
    `INSERT INTO maintenance_requests
       (id, title, request_type, priority, location, department, asset_id, asset_name,
        reported_by, guest_impact, target_time, description, status, approval_status,
        approver, submitted)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
    [
      id, body.title, body.requestType ?? "", body.priority,
      body.location, body.department ?? "", body.assetId ?? "",
      assetName, body.reportedBy ?? "", body.guestImpact ?? "",
      body.targetTime ?? "", body.description ?? "",
      "Pending Approval", "Awaiting Engineering Approval",
      approver, "Just now",
    ]
  );
  res.status(201).json(toCamel(rows[0]));
});

// POST /api/maintenance-requests/:id/approve
router.post("/:id/approve", async (req, res) => {
  const { rows: mrRows } = await pool.query(
    "SELECT * FROM maintenance_requests WHERE id = $1", [req.params.id]
  );
  if (!mrRows.length) return res.status(404).json({ error: "Not found" });
  const mr = mrRows[0];

  const woId = `WO-${String(Date.now()).slice(-5)}`;
  const sla = (mr.priority === "Critical" || mr.priority === "High") ? "At risk" : "On track";

  const { rows: woRows } = await pool.query(
    `INSERT INTO work_orders (id, title, area, priority, owner, stage, eta, asset, department, source, sla)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      woId, mr.title, mr.location, mr.priority,
      mr.priority === "Critical" ? "Duty Engineer" : "Assigned Team",
      "Assigned",
      mr.target_time ? mr.target_time.replace("T", " ") : "Today",
      mr.asset_id || "Not linked",
      mr.department, "Approved Maintenance Request", sla,
    ]
  );

  await pool.query(
    `UPDATE maintenance_requests
     SET status = 'Approved', approval_status = $1, work_order_id = $2
     WHERE id = $3`,
    [`Work order ${woId} raised`, woId, req.params.id]
  );

  res.status(201).json({ workOrder: toCamelWO(woRows[0]) });
});

function toCamel(row) {
  return {
    id: row.id, title: row.title, requestType: row.request_type,
    priority: row.priority, location: row.location, department: row.department,
    assetId: row.asset_id, assetName: row.asset_name, reportedBy: row.reported_by,
    guestImpact: row.guest_impact, targetTime: row.target_time,
    description: row.description, status: row.status,
    approvalStatus: row.approval_status, approver: row.approver,
    submitted: row.submitted, workOrderId: row.work_order_id,
  };
}

function toCamelWO(row) {
  return {
    id: row.id, title: row.title, area: row.area,
    priority: row.priority, owner: row.owner, stage: row.stage,
    eta: row.eta, asset: row.asset, department: row.department,
    source: row.source, sla: row.sla,
  };
}

module.exports = router;
