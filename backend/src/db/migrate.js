require("dotenv").config();
const { pool } = require("./pool");

const schema = `
CREATE TABLE IF NOT EXISTS equipment (
  id              TEXT PRIMARY KEY,
  name            TEXT        NOT NULL,
  category        TEXT        NOT NULL,
  location        TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'Healthy',
  criticality     TEXT        NOT NULL DEFAULT 'High',
  warranty        TEXT        NOT NULL DEFAULT 'Active',
  amc             TEXT        NOT NULL DEFAULT 'Not assigned',
  next_service    TEXT        NOT NULL DEFAULT '',
  uptime          NUMERIC     NOT NULL DEFAULT 100,
  health          NUMERIC     NOT NULL DEFAULT 96,
  manufacturer    TEXT,
  model           TEXT,
  serial_number   TEXT,
  owner           TEXT,
  purchase_date   TEXT,
  warranty_expiry TEXT,
  amc_expiry      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS non_qr_items (
  id           TEXT PRIMARY KEY,
  identity     TEXT        NOT NULL,
  name         TEXT        NOT NULL,
  category     TEXT        NOT NULL,
  location     TEXT        NOT NULL,
  quantity     INTEGER     NOT NULL DEFAULT 1,
  condition    TEXT        NOT NULL DEFAULT 'Good',
  last_checked TEXT        NOT NULL DEFAULT 'Just now',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  area       TEXT NOT NULL DEFAULT '',
  priority   TEXT NOT NULL DEFAULT 'Medium',
  owner      TEXT NOT NULL DEFAULT '',
  stage      TEXT NOT NULL DEFAULT 'Requested',
  eta        TEXT NOT NULL DEFAULT '',
  asset      TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  source     TEXT NOT NULL DEFAULT '',
  sla        TEXT NOT NULL DEFAULT 'On track',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  request_type     TEXT NOT NULL DEFAULT '',
  priority         TEXT NOT NULL DEFAULT 'Medium',
  location         TEXT NOT NULL DEFAULT '',
  department       TEXT NOT NULL DEFAULT '',
  asset_id         TEXT NOT NULL DEFAULT '',
  asset_name       TEXT NOT NULL DEFAULT '',
  reported_by      TEXT NOT NULL DEFAULT '',
  guest_impact     TEXT NOT NULL DEFAULT '',
  target_time      TEXT NOT NULL DEFAULT '',
  description      TEXT NOT NULL DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'Pending Approval',
  approval_status  TEXT NOT NULL DEFAULT 'Awaiting Engineering Approval',
  approver         TEXT NOT NULL DEFAULT '',
  submitted        TEXT NOT NULL DEFAULT 'Just now',
  work_order_id    TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approvals (
  id            TEXT PRIMARY KEY,
  item          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT '',
  value         TEXT NOT NULL DEFAULT '',
  requester     TEXT NOT NULL DEFAULT '',
  approver      TEXT NOT NULL DEFAULT '',
  risk          TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'Pending',
  priority      TEXT NOT NULL DEFAULT 'Medium',
  department    TEXT NOT NULL DEFAULT '',
  asset         TEXT NOT NULL DEFAULT '',
  submitted     TEXT NOT NULL DEFAULT '',
  due           TEXT NOT NULL DEFAULT '',
  justification TEXT NOT NULL DEFAULT '',
  impact        TEXT NOT NULL DEFAULT '',
  documents     JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenditure_bills (
  id                       TEXT PRIMARY KEY,
  type                     TEXT        NOT NULL,
  category                 TEXT        NOT NULL,
  description              TEXT        NOT NULL,
  amount                   NUMERIC     NOT NULL,
  month                    TEXT        NOT NULL,
  reference                TEXT        NOT NULL DEFAULT '',
  bill_copy_name           TEXT,
  bill_copy_data_url       TEXT,
  equipment_identity       TEXT,
  equipment_identity_label TEXT,
  equipment_identity_type  TEXT,
  uploaded_at              TEXT        NOT NULL DEFAULT 'Just now',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenditure_budgets (
  id      TEXT PRIMARY KEY DEFAULT 'default',
  utility NUMERIC NOT NULL DEFAULT 0,
  repair  NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS category_budgets (
  id       SERIAL PRIMARY KEY,
  type     TEXT    NOT NULL,
  category TEXT    NOT NULL,
  amount   NUMERIC NOT NULL DEFAULT 0,
  UNIQUE (type, category)
);

CREATE TABLE IF NOT EXISTS budget_overrides (
  override_key TEXT PRIMARY KEY,
  amount       NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workflows (
  id         TEXT PRIMARY KEY,
  name       TEXT    NOT NULL,
  template   TEXT    NOT NULL DEFAULT '',
  status     TEXT    NOT NULL DEFAULT 'Draft',
  owner      TEXT    NOT NULL DEFAULT '',
  usage      INTEGER NOT NULL DEFAULT 0,
  updated    TEXT    NOT NULL DEFAULT '',
  steps      JSONB   NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(schema);
    console.log("Migration complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
