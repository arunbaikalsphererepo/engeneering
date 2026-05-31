"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { workflowTemplates } from "@/lib/data";
import PanelHeader from "@/components/ui/PanelHeader";
import StatusPill from "@/components/ui/StatusPill";
import clsx from "clsx";
import {
  GitBranch, Plus, ChevronRight, CheckCircle2, Clock,
  Layers, Zap, ListChecks, Play, ArrowRight, Users, TimerReset, AlertTriangle,
} from "lucide-react";

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  breakdown: AlertTriangle,
  preventive: ListChecks,
  capex: Layers,
};

type View = "list" | "template" | "builder";

export default function Workflow() {
  const { workflows, addWorkflow } = useStore();
  const [view, setView] = useState<View>("list");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [builderName, setBuilderName] = useState("");
  const [builderDesc, setBuilderDesc] = useState("");
  const [created, setCreated] = useState(false);

  // workflowTemplates is Record<string, WorkflowTemplate> — convert to array
  const templateEntries = useMemo(
    () => Object.entries(workflowTemplates),
    []
  );

  const detailWorkflow = useMemo(
    () => workflows.find((w) => w.id === selectedWorkflowId),
    [workflows, selectedWorkflowId]
  );

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

  const resetBuilder = () => {
    setCreated(false);
    setBuilderName("");
    setBuilderDesc("");
    setSelectedTemplateId(null);
    setView("list");
  };

  if (created) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card p-10 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-slate-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Workflow Created</h2>
            <p className="text-slate-500 text-sm mt-1">
              <span className="font-semibold">{builderName}</span> has been added to the workflow register.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button className="btn btn-primary" onClick={resetBuilder}>
              <GitBranch size={15} /> View Workflows
            </button>
            <button className="btn" onClick={() => { setCreated(false); setBuilderName(""); setBuilderDesc(""); }}>
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── BUILDER ── */
  if (view === "builder" && selectedTemplate && selectedTemplateId) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button className="hover:text-slate-900 transition-colors" onClick={() => setView("template")}>Templates</button>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-medium">{selectedTemplate.name}</span>
        </div>

        <div className="card p-6 space-y-5">
          <PanelHeader icon={GitBranch} title="Configure Workflow" action={selectedTemplate.name} />
          <div className="space-y-1">
            <label className="label">Workflow Name <span className="text-red-500">*</span></label>
            <input className="input" placeholder={`e.g. ${selectedTemplate.name} – Tower B`} value={builderName} onChange={(e) => setBuilderName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="label">Description</label>
            <textarea className="textarea" rows={2} placeholder={selectedTemplate.description} value={builderDesc} onChange={(e) => setBuilderDesc(e.target.value)} />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Workflow Steps ({selectedTemplate.steps.length})</h3>
          <div className="space-y-2">
            {selectedTemplate.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">{step.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{step.owner} · SLA: {step.sla}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-semibold tracking-wide text-slate-400">{step.type}</span>
                    {step.approval !== "No" && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">Approval: {step.approval}</span>
                    )}
                  </div>
                </div>
                {i < selectedTemplate.steps.length - 1 && (
                  <ArrowRight size={14} className="text-slate-300 flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={handleCreate} disabled={!builderName}>
            <Play size={15} /> Launch Workflow
          </button>
          <button className="btn" onClick={() => setView("template")}>Back</button>
        </div>
      </div>
    );
  }

  /* ── TEMPLATE PICKER ── */
  if (view === "template") {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">New workflow</p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">Choose a Template</h2>
          </div>
          <button className="btn" onClick={() => setView("list")}>Cancel</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {templateEntries.map(([id, t]) => {
            const Icon = TEMPLATE_ICONS[id] ?? Zap;
            return (
              <button
                key={id}
                className="card p-6 text-left space-y-4 hover:border-slate-300 hover:shadow-card-hover transition-all"
                onClick={() => { setSelectedTemplateId(id); setView("builder"); }}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{t.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ListChecks size={13} />
                  <span>{t.steps.length} steps</span>
                  <span className="ml-auto text-slate-600 font-semibold flex items-center gap-1">
                    Use template <ChevronRight size={13} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── WORKFLOW DETAIL ── */
  if (detailWorkflow) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button className="hover:text-slate-900 transition-colors" onClick={() => setSelectedWorkflowId(null)}>Workflows</button>
          <ChevronRight size={14} />
          <span className="text-slate-800 font-medium">{detailWorkflow.name}</span>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">{detailWorkflow.template}</p>
              <h2 className="text-xl font-bold text-slate-900">{detailWorkflow.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Users size={12} /> {detailWorkflow.owner}</span>
                <span className="flex items-center gap-1"><TimerReset size={12} /> Updated {detailWorkflow.updated}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> Used {detailWorkflow.usage}×</span>
              </div>
            </div>
            <StatusPill text={detailWorkflow.status} />
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Steps ({detailWorkflow.steps.length})</h3>
          {detailWorkflow.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{step.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{step.owner} · SLA: {step.sla}</p>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <span className="text-[10px] uppercase font-semibold tracking-wide text-slate-400 block">{step.type}</span>
                {step.approval !== "No" && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded block">Approval: {step.approval}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="btn" onClick={() => setSelectedWorkflowId(null)}>Back to Workflows</button>
      </div>
    );
  }

  /* ── LIST ── */
  const activeWorkflows = workflows.filter((w) => w.status === "Active");
  const draftWorkflows = workflows.filter((w) => w.status === "Draft");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="card p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 space-y-1">
          <p className="eyebrow">Operations management</p>
          <h2 className="text-xl font-bold text-slate-900">Workflow Manager</h2>
          <p className="text-sm text-slate-500">Track and launch structured workflows for maintenance, PM, and capital projects.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setView("template")}>
          <Plus size={15} /> New Workflow
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Workflows", value: workflows.length, icon: GitBranch, color: "text-slate-700 bg-slate-100" },
          { label: "Active", value: activeWorkflows.length, icon: Play, color: "text-slate-600 bg-slate-100" },
          { label: "Total Steps", value: workflows.reduce((s, w) => s + w.steps.length, 0), icon: ListChecks, color: "text-slate-600 bg-slate-100" },
          { label: "Templates", value: templateEntries.length, icon: Layers, color: "text-slate-600 bg-slate-100" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 space-y-2">
              <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center", s.color)}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Active Workflows */}
      {activeWorkflows.length > 0 && (
        <div className="card p-5">
          <PanelHeader icon={Play} title="Active Workflows" action={`${activeWorkflows.length} running`} />
          <div className="space-y-3">
            {activeWorkflows.map((w) => (
              <div
                key={w.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/30 transition-all cursor-pointer"
                onClick={() => setSelectedWorkflowId(w.id)}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-800 truncate">{w.name}</p>
                    <StatusPill text={w.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Users size={12} />{w.owner}</span>
                    <span className="flex items-center gap-1"><ListChecks size={12} />{w.steps.length} steps</span>
                    <span className="flex items-center gap-1"><Clock size={12} />Used {w.usage}×</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 text-xs text-slate-400">
                  Updated {w.updated}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Quick Launch */}
      <div className="card p-5">
        <PanelHeader icon={Layers} title="Quick Launch Templates" action="Standard workflows" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {templateEntries.map(([id, t]) => {
            const Icon = TEMPLATE_ICONS[id] ?? Zap;
            return (
              <button
                key={id}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/40 transition-all text-left"
                onClick={() => { setSelectedTemplateId(id); setView("builder"); }}
              >
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.steps.length} steps</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 ml-auto flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Draft Workflows */}
      {draftWorkflows.length > 0 && (
        <div className="card p-5">
          <PanelHeader icon={Clock} title="Draft Workflows" action={`${draftWorkflows.length} total`} />
          <div className="space-y-2">
            {draftWorkflows.map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer opacity-70 hover:opacity-100"
                onClick={() => setSelectedWorkflowId(w.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-700 truncate">{w.name}</p>
                  <p className="text-xs text-slate-400">{w.steps.length} steps · Owner: {w.owner}</p>
                </div>
                <StatusPill text={w.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
