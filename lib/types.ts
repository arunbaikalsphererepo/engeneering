export interface Equipment {
  id: string;
  name: string;
  category: string;
  location: string;
  status: "Healthy" | "Attention" | "Due Soon" | "Critical";
  criticality: "Critical" | "High" | "Medium" | "Low";
  warranty: "Active" | "Expired" | "Due Soon";
  amc: string;
  nextService: string;
  uptime: number;
  health: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  owner?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  amcExpiry?: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  area: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  owner: string;
  stage: string;
  eta: string;
  asset: string;
  department: string;
  source: string;
  sla: "At risk" | "On track" | "Waiting" | "Met";
}

export interface PMPlan {
  day: string;
  tasks: number;
  complete: number;
  focus: string;
  manpower: string;
}

export interface RoomImpact {
  tower: string;
  rooms: string;
  blocked: number;
  priority: string;
  issue: string;
}

export interface VendorJob {
  vendor: string;
  scope: string;
  arrival: string;
  permit: string;
  contact: string;
}

export interface Approval {
  id: string;
  item: string;
  category: string;
  value: string;
  requester: string;
  approver: string;
  risk: string;
  status: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  department: string;
  asset: string;
  submitted: string;
  due: string;
  justification: string;
  impact: string;
  documents: string[];
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  requestType: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  location: string;
  department: string;
  assetId: string;
  assetName: string;
  reportedBy: string;
  guestImpact: string;
  targetTime: string;
  description: string;
  status: string;
  approvalStatus: string;
  approver: string;
  submitted: string;
  workOrderId?: string;
}

export interface WorkflowStep {
  name: string;
  owner: string;
  sla: string;
  approval: "No" | "Yes" | "Conditional";
  type: string;
}

export interface WorkflowTemplate {
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface Workflow {
  id: string;
  name: string;
  template: string;
  status: "Active" | "Draft";
  owner: string;
  usage: number;
  updated: string;
  steps: WorkflowStep[];
}

export interface RoleProfile {
  id: string;
  label: string;
  subtitle: string;
  defaultPage: string;
  nav: string[];
  canCreateRequest?: boolean;
  canManageEquipment?: boolean;
}

export interface CategoryStat {
  label: string;
  count: number;
  health: number;
}

export interface NonQRItem {
  id: string;
  identity: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  condition: "Good" | "Fair" | "Poor";
  lastChecked: string;
  notes?: string;
}

export interface ExpenditureBill {
  id: string;
  type: "utility" | "repair";
  category: string;           // MIS R&M or Utility header
  description: string;
  amount: number;
  month: string; // "YYYY-MM"
  reference: string;
  billCopyName?: string;
  billCopyDataUrl?: string;
  equipmentIdentity?: string;
  equipmentIdentityLabel?: string;
  equipmentIdentityType?: "qr" | "nonqr";
  uploadedAt: string;
}

export interface MaintenanceDetailPayload {
  type:
    | "work-order"
    | "pm-day"
    | "room-impact"
    | "vendor"
    | "shift"
    | "history-event"
    | "metric"
    | "stage";
  payload: Record<string, unknown>;
}
