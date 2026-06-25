"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { workflowTemplates } from "@/lib/data";
import {
  GitBranch, Plus, ChevronRight, ChevronLeft, CheckCircle2, Clock,
  Layers, Zap, ListChecks, Play, ArrowRight, Users, TimerReset, AlertTriangle,
} from "lucide-react";

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  breakdown: AlertTriangle,
  preventive: ListChecks,
  capex: Layers,
};

const STEP_TYPE_CFG: Record<string, { bg: string; color: string }> = {
  Intake:     { bg: "#f8fafc", color: "#64748b" },
  Assessment: { bg: "#f1f5f9", color: "#334155" },
  Approval:   { bg: "#fff7ed", color: "#c2410c" },
  Execution:  { bg: "#f0fdf4", color: "#15803d" },
  Closure:    { bg: "#f0f9ff", color: "#0369a1" },
  Review:     { bg: "#fafafa", color: "#475569" },
};

type View = "list" | "template" | "builder";

function StepRow({ step, index, total }: { step: { name: string; owner: string; sla: string; type: string; approval: string }; index: number; total: number }) {
  const cfg = STEP_TYPE_CFG[step.type] ?? { bg: "#f8fafc", color: "#64748b" };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      {/* connector line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0f172a", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{index + 1}</div>
        {index < total - 1 && <div style={{ width: 2, flex: 1, minHeight: 16, background: "#f1f5f9", margin: "4px 0" }} />}
      </div>
      <div style={{ flex: 1, padding: "12px 14px", borderRadius: 9, border: "1px solid #e2e8f0", background: "white", marginBottom: index < total - 1 ? 4 : 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{step.name}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{step.owner} · SLA: {step.sla}</div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: cfg.bg, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {step.type}
            </span>
            {step.approval !== "No" && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>
                Approval
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Workflow() {
  const { workflows, addWorkflow } = useStore();
  const [view, setView]                       = useState<View>("list");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [builderName, setBuilderName]         = useState("");
  const [builderDesc, setBuilderDesc]         = useState("");
  const [created, setCreated]                 = useState(false);

  const templateEntries = useMemo(() => Object.entries(workflowTemplates), []);
  const detailWorkflow  = useMemo(() => workflows.find(w => w.id === selectedWorkflowId), [workflows, selectedWorkflowId]);
  const selectedTemplate = selectedTemplateId ? workflowTemplates[selectedTemplateId] : null;

  const handleCreate = () => {
    if (!selectedTemplate || !selectedTemplateId || !builderName) return;
    addWorkflow({
      id: `WF-${String(Date.now()).slice(-4)}`,
      name: builderName,
      template: selectedTemplateId,
      status: "Active",
      owner: "Engineering Team",
      usage: 0,
      updated: "Just now",
      steps: selectedTemplate.steps,
    });
    setCreated(true);
  };

  const resetBuilder = () => { setCreated(false); setBuilderName(""); setBuilderDesc(""); setSelectedTemplateId(null); setView("list"); };

  // ── Created confirmation ──────────────────────────────────────────────────
  if (created) {
    return (
      <div className="max-w-lg mx-auto" style={{ paddingTop: 40 }}>
        <div style={{ padding: "48px 40px", borderRadius: 14, border: "1px solid #e2e8f0", background: "white", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={26} color="#15803d" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>Workflow Created</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
            <strong style={{ color: "#0f172a" }}>{builderName}</strong> has been added to the workflow register.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 24 }}>
            <button onClick={resetBuilder} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 8, background: "#0f172a", color: "white", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              <GitBranch size={14} /> View Workflows
            </button>
            <button onClick={() => { setCreated(false); setBuilderName(""); setBuilderDesc(""); }} style={{ padding: "10px 18px", borderRadius: 8, background: "white", color: "#334155", border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Builder ───────────────────────────────────────────────────────────────
  if (view === "builder" && selectedTemplate && selectedTemplateId) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button onClick={() => setView("template")} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <ChevronLeft size={14} /> Templates / {selectedTemplate.name}
        </button>

        <div style={{ padding: "20px 22px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8", marginBottom: 14 }}>Configure Workflow</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Workflow Name *</label>
            <input
              placeholder={`e.g. ${selectedTemplate.name} – Tower B`}
              value={builderName}
              onChange={e => setBuilderName(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 5 }}>Description</label>
            <textarea
              rows={2}
              placeholder={selectedTemplate.description}
              value={builderDesc}
              onChange={e => setBuilderDesc(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a", resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ padding: "20px 22px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8", marginBottom: 16 }}>
            Workflow Steps ({selectedTemplate.steps.length})
          </div>
          {selectedTemplate.steps.map((step, i) => (
            <StepRow key={i} step={step} index={i} total={selectedTemplate.steps.length} />
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleCreate}
            disabled={!builderName}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 8, background: builderName ? "#0f172a" : "#e2e8f0", color: builderName ? "white" : "#94a3b8", border: "none", fontSize: 13, fontWeight: 700, cursor: builderName ? "pointer" : "not-allowed" }}
          >
            <Play size={14} /> Launch Workflow
          </button>
          <button onClick={() => setView("template")} style={{ padding: "10px 18px", borderRadius: 8, background: "white", color: "#334155", border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Template picker ───────────────────────────────────────────────────────
  if (view === "template") {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#94a3b8" }}>New Workflow</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "4px 0 0", letterSpacing: "-0.03em" }}>Choose a Template</h2>
          </div>
          <button onClick={() => setView("list")} style={{ padding: "7px 14px", borderRadius: 8, background: "white", color: "#334155", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {templateEntries.map(([id, t]) => {
            const Icon = TEMPLATE_ICONS[id] ?? Zap;
            return (
              <button
                key={id}
                onClick={() => { setSelectedTemplateId(id); setView("builder"); }}
                style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white", textAlign: "left", cursor: "pointer", transition: "border-color 150ms, box-shadow 150ms" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(14,19,28,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, lineHeight: 1.5 }}>{t.description}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                    <ListChecks size={11} /> {t.steps.length} steps
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: 4 }}>
                    Use template <ChevronRight size={11} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Workflow detail ───────────────────────────────────────────────────────
  if (detailWorkflow) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button onClick={() => setSelectedWorkflowId(null)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          <ChevronLeft size={14} /> Workflows / {detailWorkflow.name}
        </button>

        <div style={{ padding: "20px 22px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8", marginBottom: 4 }}>{detailWorkflow.template}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>{detailWorkflow.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 8 }}>
                {[
                  { icon: Users,       label: detailWorkflow.owner },
                  { icon: TimerReset,  label: `Updated ${detailWorkflow.updated}` },
                  { icon: Clock,       label: `Used ${detailWorkflow.usage}×` },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#64748b" }}>
                    <Icon size={11} /> {label}
                  </span>
                ))}
              </div>
            </div>
            <span style={{ padding: "4px 12px", borderRadius: 7, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {detailWorkflow.status}
            </span>
          </div>
        </div>

        <div style={{ padding: "20px 22px", borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8", marginBottom: 16 }}>
            Steps ({detailWorkflow.steps.length})
          </div>
          {detailWorkflow.steps.map((step, i) => (
            <StepRow key={i} step={step} index={i} total={detailWorkflow.steps.length} />
          ))}
        </div>
      </div>
    );
  }

  // ── List ──────────────────────────────────────────────────────────────────
  const activeWorkflows = workflows.filter(w => w.status === "Active");
  const draftWorkflows  = workflows.filter(w => w.status === "Draft");

  return (
    <div className="space-y-5">

      {/* ── Dark hero ───────────────────────────────────────────────────────── */}
      <div style={{ borderRadius: 12, background: "#0f172a", color: "white", padding: "20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, position: "relative" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Operations Management</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>Workflow Manager</h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              Launch and manage structured workflows for maintenance, PM, and capital projects.
            </p>
          </div>
          <button onClick={() => setView("template")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, background: "white", color: "#0f172a", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
            <Plus size={14} /> New Workflow
          </button>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Workflows", value: workflows.length,                                       icon: GitBranch },
          { label: "Active",          value: activeWorkflows.length,                                  icon: Play      },
          { label: "Total Steps",     value: workflows.reduce((s, w) => s + w.steps.length, 0),      icon: ListChecks},
          { label: "Templates",       value: templateEntries.length,                                  icon: Layers    },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon size={16} color="#0f172a" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em", lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: "#334155" }}>{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Active workflows ───────────────────────────────────────────────── */}
      {activeWorkflows.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Active Workflows</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{activeWorkflows.length} running</div>
          </div>
          <div style={{ padding: "10px 14px" }} className="space-y-2">
            {activeWorkflows.map(w => (
              <div
                key={w.id}
                onClick={() => setSelectedWorkflowId(w.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 9, border: "1px solid #e2e8f0",
                  cursor: "pointer", transition: "border-color 150ms, box-shadow 150ms",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,19,28,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {(() => { const Icon = TEMPLATE_ICONS[w.template] ?? GitBranch; return <Icon size={15} color="#0f172a" />; })()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
                    {[
                      { icon: Users,    label: w.owner },
                      { icon: ListChecks,label: `${w.steps.length} steps` },
                      { icon: Clock,    label: `Used ${w.usage}×` },
                    ].map(({ icon: Icon, label }) => (
                      <span key={label} style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                        <Icon size={10} /> {label}
                      </span>
                    ))}
                  </div>
                </div>
                <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", fontWeight: 700, flexShrink: 0 }}>Active</span>
                <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>Updated {w.updated}</span>
                <ChevronRight size={14} color="#94a3b8" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Template quick launch ──────────────────────────────────────────── */}
      <div style={{ borderRadius: 10, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Quick Launch Templates</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>Standard workflows</div>
        </div>
        <div style={{ padding: "14px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {templateEntries.map(([id, t]) => {
            const Icon = TEMPLATE_ICONS[id] ?? Zap;
            return (
              <button
                key={id}
                onClick={() => { setSelectedTemplateId(id); setView("builder"); }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 9, border: "1px solid #e2e8f0", background: "white", textAlign: "left", cursor: "pointer", transition: "border-color 150ms, box-shadow 150ms" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(14,19,28,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                  <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 1 }}>{t.steps.length} steps</div>
                </div>
                <ChevronRight size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Draft workflows ────────────────────────────────────────────────── */}
      {draftWorkflows.length > 0 && (
        <div style={{ borderRadius: 10, border: "1px solid #e2e8f0", background: "white", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#94a3b8" }}>Draft Workflows</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{draftWorkflows.length} total</div>
          </div>
          <div style={{ padding: "10px 14px" }} className="space-y-2">
            {draftWorkflows.map(w => (
              <div
                key={w.id}
                onClick={() => setSelectedWorkflowId(w.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 9, border: "1px solid #f1f5f9", cursor: "pointer", opacity: 0.75, transition: "opacity 150ms" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.75"}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{w.steps.length} steps · {w.owner}</div>
                </div>
                <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", fontWeight: 700 }}>Draft</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
