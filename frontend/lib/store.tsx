"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type {
  Equipment, WorkOrder, MaintenanceRequest, Workflow,
  RoleProfile, NonQRItem, ExpenditureBill, ExpenditureBudgets, CategoryBudget, Approval,
} from "./types";
import { roleProfiles } from "./data";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

interface StoreState {
  equipmentAssets: Equipment[];
  nonQRItems: NonQRItem[];
  bills: ExpenditureBill[];
  budgets: ExpenditureBudgets;
  maintenanceRequests: MaintenanceRequest[];
  generatedWorkOrders: WorkOrder[];
  workflows: Workflow[];
  approvals: Approval[];
  roleId: string;
  activeRole: RoleProfile;
  allWorkOrders: WorkOrder[];
  loading: boolean;
}

interface StoreActions {
  setRoleId: (id: string) => void;
  registerEquipment: (formValues: Partial<Equipment> & Record<string, string>) => Promise<Equipment>;
  updateEquipment: (id: string, formValues: Partial<Equipment> & Record<string, string>) => Promise<Equipment>;
  deleteEquipment: (id: string) => Promise<void>;
  addNonQRItem: (values: Omit<NonQRItem, "id" | "identity" | "lastChecked">) => Promise<NonQRItem>;
  deleteNonQRItem: (id: string) => Promise<void>;
  addBill: (values: Omit<ExpenditureBill, "id" | "uploadedAt">) => Promise<ExpenditureBill>;
  deleteBill: (id: string) => Promise<void>;
  setBudget: (type: "utility" | "repair", amount: number) => Promise<void>;
  setCategoryBudget: (type: "utility" | "repair", category: string, amount: number) => Promise<void>;
  setCategoryBudgetOverride: (type: "utility" | "repair", month: string, category: string, amount: number) => Promise<void>;
  copyPrevMonthBudgets: (type: "utility" | "repair", targetMonth: string) => Promise<void>;
  submitMaintenanceRequest: (values: Omit<MaintenanceRequest, "id" | "status" | "approvalStatus" | "assetName" | "submitted" | "approver">) => Promise<MaintenanceRequest>;
  approveMaintenanceRequest: (request: MaintenanceRequest) => Promise<WorkOrder>;
  addWorkflow: (workflow: Workflow) => Promise<void>;
  refreshWorkOrders: () => Promise<void>;
}

type StoreContext = StoreState & StoreActions;

const StoreCtx = createContext<StoreContext | null>(null);

const DEFAULT_BUDGETS: ExpenditureBudgets = {
  utility: 0, repair: 0,
  utilityCategories: [], repairCategories: [], overrides: {},
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [equipmentAssets,     setEquipmentAssets]     = useState<Equipment[]>([]);
  const [nonQRItems,          setNonQRItems]           = useState<NonQRItem[]>([]);
  const [bills,               setBills]               = useState<ExpenditureBill[]>([]);
  const [budgets,             setBudgets]             = useState<ExpenditureBudgets>(DEFAULT_BUDGETS);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [generatedWorkOrders, setGeneratedWorkOrders] = useState<WorkOrder[]>([]);
  const [workflows,           setWorkflows]           = useState<Workflow[]>([]);
  const [approvals,           setApprovals]           = useState<Approval[]>([]);
  const [roleId,              setRoleId]              = useState("engineering-management");
  const [loading,             setLoading]             = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [eq, nq, wo, mr, wf, bl, bg, apr] = await Promise.all([
          apiFetch<Equipment[]>("/api/equipment"),
          apiFetch<NonQRItem[]>("/api/non-qr-items"),
          apiFetch<WorkOrder[]>("/api/work-orders"),
          apiFetch<MaintenanceRequest[]>("/api/maintenance-requests"),
          apiFetch<Workflow[]>("/api/workflows"),
          apiFetch<ExpenditureBill[]>("/api/expenditure/bills"),
          apiFetch<ExpenditureBudgets>("/api/expenditure/budgets"),
          apiFetch<Approval[]>("/api/approvals"),
        ]);
        setEquipmentAssets(eq);
        setNonQRItems(nq);
        setGeneratedWorkOrders(wo);
        setMaintenanceRequests(mr);
        setWorkflows(wf);
        setBills(bl);
        setBudgets(bg);
        setApprovals(apr);
      } catch (err) {
        console.error("Failed to load data from API:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeRole = useMemo(
    () => roleProfiles.find(r => r.id === roleId) ?? roleProfiles[0],
    [roleId]
  );

  const allWorkOrders = useMemo(() => generatedWorkOrders, [generatedWorkOrders]);

  const refreshWorkOrders = useCallback(async () => {
    const wo = await apiFetch<WorkOrder[]>("/api/work-orders");
    setGeneratedWorkOrders(wo);
  }, []);

  const registerEquipment = useCallback(async (
    formValues: Partial<Equipment> & Record<string, string>
  ): Promise<Equipment> => {
    const asset = await apiFetch<Equipment>("/api/equipment", {
      method: "POST",
      body: JSON.stringify({
        name:            formValues.name ?? "",
        category:        formValues.category ?? "HVAC",
        location:        formValues.location ?? "",
        criticality:     formValues.criticality ?? "High",
        warranty:        formValues.warrantyStatus ?? "Active",
        amc:             formValues.amcVendor || "Not assigned",
        next_service:    formValues.nextService ?? "",
        serial_number:   formValues.serialNumber,
        manufacturer:    formValues.manufacturer,
        model:           formValues.model,
        purchase_date:   formValues.purchaseDate,
        warranty_expiry: formValues.warrantyExpiry,
        amc_expiry:      formValues.amcExpiry,
        owner:           formValues.owner,
      }),
    });
    setEquipmentAssets(prev => [asset, ...prev]);
    return asset;
  }, []);

  const updateEquipment = useCallback(async (
    id: string,
    formValues: Partial<Equipment> & Record<string, string>
  ): Promise<Equipment> => {
    const asset = await apiFetch<Equipment>(`/api/equipment/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name:            formValues.name ?? "",
        category:        formValues.category ?? "HVAC",
        location:        formValues.location ?? "",
        criticality:     formValues.criticality ?? "High",
        warranty:        formValues.warrantyStatus ?? "Active",
        amc:             formValues.amcVendor || "Not assigned",
        next_service:    formValues.nextService ?? "",
        serial_number:   formValues.serialNumber,
        manufacturer:    formValues.manufacturer,
        model:           formValues.model,
        purchase_date:   formValues.purchaseDate,
        warranty_expiry: formValues.warrantyExpiry,
        amc_expiry:      formValues.amcExpiry,
        owner:           formValues.owner,
      }),
    });
    setEquipmentAssets(prev => prev.map(a => a.id === id ? asset : a));
    return asset;
  }, []);

  const deleteEquipment = useCallback(async (id: string) => {
    await apiFetch(`/api/equipment/${id}`, { method: "DELETE" });
    setEquipmentAssets(prev => prev.filter(a => a.id !== id));
  }, []);

  const addNonQRItem = useCallback(async (
    values: Omit<NonQRItem, "id" | "identity" | "lastChecked">
  ): Promise<NonQRItem> => {
    const item = await apiFetch<NonQRItem>("/api/non-qr-items", {
      method: "POST",
      body: JSON.stringify(values),
    });
    setNonQRItems(prev => [item, ...prev]);
    return item;
  }, []);

  const deleteNonQRItem = useCallback(async (id: string) => {
    await apiFetch(`/api/non-qr-items/${id}`, { method: "DELETE" });
    setNonQRItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const addBill = useCallback(async (
    values: Omit<ExpenditureBill, "id" | "uploadedAt">
  ): Promise<ExpenditureBill> => {
    const bill = await apiFetch<ExpenditureBill>("/api/expenditure/bills", {
      method: "POST",
      body: JSON.stringify(values),
    });
    setBills(prev => [bill, ...prev]);
    return bill;
  }, []);

  const deleteBill = useCallback(async (id: string) => {
    await apiFetch(`/api/expenditure/bills/${id}`, { method: "DELETE" });
    setBills(prev => prev.filter(b => b.id !== id));
  }, []);

  const setBudget = useCallback(async (type: "utility" | "repair", amount: number) => {
    await apiFetch("/api/expenditure/budgets/totals", {
      method: "PUT",
      body: JSON.stringify({ type, amount }),
    });
    setBudgets(prev => ({ ...prev, [type]: amount }));
  }, []);

  const setCategoryBudget = useCallback(async (
    type: "utility" | "repair", category: string, amount: number
  ) => {
    await apiFetch("/api/expenditure/budgets/category", {
      method: "PUT",
      body: JSON.stringify({ type, category, amount }),
    });
    const key = type === "utility" ? "utilityCategories" : "repairCategories";
    setBudgets(prev => {
      const list: CategoryBudget[] = prev[key] ?? [];
      const exists = list.find(c => c.category === category);
      return {
        ...prev,
        [key]: exists
          ? list.map(c => c.category === category ? { ...c, amount } : c)
          : [...list, { category, amount }],
      };
    });
  }, []);

  const setCategoryBudgetOverride = useCallback(async (
    type: "utility" | "repair", month: string, category: string, amount: number
  ) => {
    await apiFetch("/api/expenditure/budgets/override", {
      method: "PUT",
      body: JSON.stringify({ type, month, category, amount }),
    });
    const overrideKey = `${type}:${month}:${category}`;
    setBudgets(prev => ({ ...prev, overrides: { ...prev.overrides, [overrideKey]: amount } }));
  }, []);

  const copyPrevMonthBudgets = useCallback(async (
    type: "utility" | "repair", targetMonth: string
  ) => {
    await apiFetch("/api/expenditure/budgets/copy-prev-month", {
      method: "POST",
      body: JSON.stringify({ type, targetMonth }),
    });
    const bg = await apiFetch<ExpenditureBudgets>("/api/expenditure/budgets");
    setBudgets(bg);
  }, []);

  const submitMaintenanceRequest = useCallback(async (
    values: Omit<MaintenanceRequest, "id" | "status" | "approvalStatus" | "assetName" | "submitted" | "approver">
  ): Promise<MaintenanceRequest> => {
    const request = await apiFetch<MaintenanceRequest>("/api/maintenance-requests", {
      method: "POST",
      body: JSON.stringify(values),
    });
    setMaintenanceRequests(prev => [request, ...prev]);
    return request;
  }, []);

  const approveMaintenanceRequest = useCallback(async (
    request: MaintenanceRequest
  ): Promise<WorkOrder> => {
    const { workOrder } = await apiFetch<{ workOrder: WorkOrder }>(
      `/api/maintenance-requests/${request.id}/approve`,
      { method: "POST" }
    );
    setGeneratedWorkOrders(prev => [workOrder, ...prev]);
    setMaintenanceRequests(prev =>
      prev.map(r =>
        r.id === request.id
          ? { ...r, status: "Approved", approvalStatus: `Work order ${workOrder.id} raised`, workOrderId: workOrder.id }
          : r
      )
    );
    return workOrder;
  }, []);

  const addWorkflow = useCallback(async (workflow: Workflow) => {
    const saved = await apiFetch<Workflow>("/api/workflows", {
      method: "POST",
      body: JSON.stringify(workflow),
    });
    setWorkflows(prev => [saved, ...prev]);
  }, []);

  const value = useMemo<StoreContext>(() => ({
    equipmentAssets, nonQRItems, bills, budgets,
    maintenanceRequests, generatedWorkOrders, workflows, approvals,
    roleId, activeRole, allWorkOrders, loading,
    setRoleId, registerEquipment, updateEquipment, deleteEquipment,
    addNonQRItem, deleteNonQRItem, addBill, deleteBill,
    setBudget, setCategoryBudget, setCategoryBudgetOverride, copyPrevMonthBudgets,
    submitMaintenanceRequest, approveMaintenanceRequest, addWorkflow, refreshWorkOrders,
  }), [
    equipmentAssets, nonQRItems, bills, budgets,
    maintenanceRequests, generatedWorkOrders, workflows, approvals,
    roleId, activeRole, allWorkOrders, loading,
    setRoleId, registerEquipment, updateEquipment, deleteEquipment,
    addNonQRItem, deleteNonQRItem, addBill, deleteBill,
    setBudget, setCategoryBudget, setCategoryBudgetOverride, copyPrevMonthBudgets,
    submitMaintenanceRequest, approveMaintenanceRequest, addWorkflow, refreshWorkOrders,
  ]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreContext {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
