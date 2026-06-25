require("dotenv").config();
const express = require("express");
const cors = require("cors");

const equipmentRouter          = require("./routes/equipment");
const nonQrItemsRouter         = require("./routes/nonQrItems");
const workOrdersRouter         = require("./routes/workOrders");
const maintenanceRequestRouter = require("./routes/maintenanceRequests");
const expenditureRouter        = require("./routes/expenditure");
const workflowsRouter          = require("./routes/workflows");
const approvalsRouter          = require("./routes/approvals");

const app  = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/equipment",            equipmentRouter);
app.use("/api/non-qr-items",         nonQrItemsRouter);
app.use("/api/work-orders",          workOrdersRouter);
app.use("/api/maintenance-requests", maintenanceRequestRouter);
app.use("/api/expenditure",          expenditureRouter);
app.use("/api/workflows",            workflowsRouter);
app.use("/api/approvals",            approvalsRouter);

app.use((err, _req, res, _next) => {
  if (err?.name === "ZodError") {
    return res.status(400).json({ error: "Validation error", details: err.errors });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Hotel Engineering API listening on http://localhost:${PORT}`);
});
