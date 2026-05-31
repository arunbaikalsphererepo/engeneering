import type {
  Equipment, WorkOrder, PMPlan, RoomImpact, VendorJob,
  Approval, RoleProfile, CategoryStat, WorkflowTemplate, Workflow, NonQRItem, ExpenditureBill,
} from "./types";

export const equipmentSeed: Equipment[] = [
  { id: "EQ-AC-0118", name: "Chiller Plant 1", category: "HVAC", location: "Basement Utility", status: "Healthy", criticality: "Critical", warranty: "Active", amc: "Blue Star AMC", nextService: "2026-05-14", uptime: 98.7, health: 92 },
  { id: "EQ-GEN-0024", name: "DG Set 750 KVA", category: "Electrical", location: "Power House", status: "Attention", criticality: "Critical", warranty: "Expired", amc: "OEM Premium", nextService: "2026-05-09", uptime: 96.4, health: 76 },
  { id: "EQ-LFT-0042", name: "Guest Lift A", category: "Vertical Transport", location: "Lobby Core", status: "Healthy", criticality: "High", warranty: "Active", amc: "Kone Complete", nextService: "2026-05-18", uptime: 99.1, health: 89 },
  { id: "EQ-KTN-0091", name: "Combi Oven Line 2", category: "Kitchen", location: "Banquet Kitchen", status: "Due Soon", criticality: "Medium", warranty: "Active", amc: "In-house", nextService: "2026-05-11", uptime: 97.3, health: 83 },
  { id: "EQ-FIR-0007", name: "Fire Pump Controller", category: "Fire & Safety", location: "Pump Room", status: "Attention", criticality: "Critical", warranty: "Active", amc: "Johnson Controls", nextService: "2026-05-08", uptime: 95.8, health: 71 },
];

export const workOrdersSeed: WorkOrder[] = [
  { id: "WO-1948", title: "Presidential Suite chilled water valve hunting", area: "Tower A - Suite 3801", priority: "Critical", owner: "Amina Khan", stage: "In Progress", eta: "22 min", asset: "FCU-VVIP-3801", department: "Rooms", source: "Guest Services", sla: "At risk" },
  { id: "WO-1947", title: "Main kitchen combi oven steam fault", area: "All Day Dining Kitchen", priority: "High", owner: "Imran Shaikh", stage: "Assigned", eta: "45 min", asset: "EQ-KTN-0091", department: "Culinary", source: "Chef Console", sla: "On track" },
  { id: "WO-1946", title: "Fire pump jockey pressure fluctuation", area: "Fire Pump Room", priority: "Critical", owner: "Prakash Nair", stage: "Supervisor Review", eta: "Today, 12:40 PM", asset: "EQ-FIR-0007", department: "Life Safety", source: "BMS Alarm", sla: "At risk" },
  { id: "WO-1945", title: "Guest lift A door sensor intermittent", area: "Lobby Core", priority: "High", owner: "Vendor - Kone", stage: "Vendor Scheduled", eta: "Today, 2:00 PM", asset: "EQ-LFT-0042", department: "Front Office", source: "Lift Panel", sla: "On track" },
  { id: "WO-1944", title: "Spa hydrotherapy pump vibration", area: "Royal Spa Level 4", priority: "Medium", owner: "Nisha Rao", stage: "Material Check", eta: "Today, 4:30 PM", asset: "SPA-HYD-014", department: "Spa", source: "Operator App", sla: "On track" },
  { id: "WO-1943", title: "Ballroom 2 chandelier dimmer channel fault", area: "Grand Ballroom", priority: "High", owner: "Rakesh Verma", stage: "In Progress", eta: "Today, 1:15 PM", asset: "EL-LGT-221", department: "Banquets", source: "Event Manager", sla: "On track" },
  { id: "WO-1942", title: "DG coolant leak inspection", area: "Power House", priority: "High", owner: "Rakesh Verma", stage: "Supervisor Review", eta: "Today, 4:00 PM", asset: "EQ-GEN-0024", department: "Engineering", source: "Technician", sla: "On track" },
  { id: "WO-1941", title: "Guest room FCU noise complaint", area: "Tower B - 1208", priority: "Medium", owner: "Amina Khan", stage: "In Progress", eta: "Today, 6:30 PM", asset: "FCU-B-1208", department: "Rooms", source: "Guest App", sla: "On track" },
  { id: "WO-1940", title: "Laundry tunnel washer drain sensor", area: "Laundry Plant", priority: "High", owner: "Suresh Pillai", stage: "Assigned", eta: "Today, 3:20 PM", asset: "LND-WASH-03", department: "Housekeeping", source: "Laundry Supervisor", sla: "On track" },
  { id: "WO-1939", title: "Pool heat exchanger descaling", area: "Infinity Pool Plant", priority: "Medium", owner: "Vendor - Thermax", stage: "Pending Approval", eta: "Tomorrow", asset: "POOL-HX-02", department: "Recreation", source: "PM Schedule", sla: "Waiting" },
  { id: "WO-1938", title: "Fire pump weekly test", area: "Pump Room", priority: "Critical", owner: "Prakash Nair", stage: "Pending Approval", eta: "Tomorrow", asset: "EQ-FIR-0007", department: "Life Safety", source: "Compliance Calendar", sla: "Waiting" },
  { id: "WO-1937", title: "Guest corridor pressure imbalance", area: "Tower C - Floors 22 to 26", priority: "Medium", owner: "Nisha Rao", stage: "Requested", eta: "Today, 7:00 PM", asset: "AHU-C-22", department: "Rooms", source: "BMS Trend", sla: "On track" },
  { id: "WO-1936", title: "BMS trend review for chiller sequencing", area: "Central Plant", priority: "Low", owner: "Chief Engineer", stage: "Review", eta: "Friday", asset: "EQ-AC-0118", department: "Energy", source: "Analytics", sla: "On track" },
  { id: "WO-1935", title: "VIP arrival room plumbing inspection", area: "Tower A - Suites 3601 to 3606", priority: "High", owner: "Manoj Das", stage: "Completed", eta: "Closed", asset: "PLB-VIP-36", department: "Rooms", source: "VIP Desk", sla: "Met" },
  { id: "WO-1934", title: "STP blower bearing temperature rise", area: "STP Plant", priority: "High", owner: "Vendor - Grundfos", stage: "Material Check", eta: "Tomorrow, 10:00 AM", asset: "STP-BLR-02", department: "Utilities", source: "SCADA Alarm", sla: "At risk" },
  { id: "WO-1931", title: "Server room precision AC condensate alarm", area: "IT Server Room", priority: "Critical", owner: "Amina Khan", stage: "In Progress", eta: "35 min", asset: "PAC-IT-01", department: "IT", source: "BMS Alarm", sla: "At risk" },
  { id: "WO-1927", title: "Chiller Plant 1 condenser approach high", area: "Basement Utility", priority: "High", owner: "Nisha Rao", stage: "In Progress", eta: "Today, 3:45 PM", asset: "EQ-AC-0118", department: "Energy", source: "Analytics", sla: "On track" },
  { id: "WO-1926", title: "Royal club lounge espresso machine water leak", area: "Club Lounge Level 39", priority: "Medium", owner: "Imran Shaikh", stage: "Assigned", eta: "Today, 2:45 PM", asset: "FNB-ESP-39", department: "F&B", source: "Lounge Manager", sla: "On track" },
];

export const pmPlan: PMPlan[] = [
  { day: "Mon", tasks: 74, complete: 89, focus: "Guest room FCUs, public area lighting", manpower: "42 techs" },
  { day: "Tue", tasks: 68, complete: 81, focus: "Kitchen equipment, laundry plant", manpower: "39 techs" },
  { day: "Wed", tasks: 92, complete: 76, focus: "Fire systems and statutory checks", manpower: "46 techs" },
  { day: "Thu", tasks: 86, complete: 64, focus: "Lifts, escalators, BMS calibration", manpower: "44 techs" },
  { day: "Fri", tasks: 79, complete: 58, focus: "Ballrooms and event readiness", manpower: "48 techs" },
  { day: "Sat", tasks: 51, complete: 43, focus: "Occupied-room reactive buffer", manpower: "36 techs" },
  { day: "Sun", tasks: 38, complete: 33, focus: "Quiet maintenance and compliance logs", manpower: "28 techs" },
];

export const roomImpact: RoomImpact[] = [
  { tower: "Tower A", rooms: "412 rooms", blocked: 6, priority: "VVIP suites", issue: "Temperature fine tuning" },
  { tower: "Tower B", rooms: "286 rooms", blocked: 11, priority: "High occupancy", issue: "FCU noise and condensate" },
  { tower: "Tower C", rooms: "214 rooms", blocked: 8, priority: "Group arrival", issue: "Corridor pressure balance" },
  { tower: "Tower D", rooms: "88 residences", blocked: 3, priority: "Long stay", issue: "Electrical nuisance trips" },
];

export const vendorJobs: VendorJob[] = [
  { vendor: "Kone Elevators", scope: "Lift A sensor kit and safety reset", arrival: "Today 2:00 PM", permit: "Hot work: No", contact: "Rahul Mehta" },
  { vendor: "Johnson Controls", scope: "Fire panel loop diagnostics", arrival: "Today 5:00 PM", permit: "Life safety bypass", contact: "Neha Suri" },
  { vendor: "Blue Star", scope: "Cold room gasket and refrigerant leak test", arrival: "Tomorrow 9:30 AM", permit: "Food area access", contact: "Arvind Rao" },
  { vendor: "Thermax", scope: "Pool heat exchanger chemical descaling", arrival: "Tomorrow 11:00 AM", permit: "Chemical handling", contact: "Sahil Jain" },
];

export const approvalsSeed: Approval[] = [
  { id: "APR-1028", item: "Chiller condenser chemical cleaning", category: "Major Repair", value: "Rs 86,000", requester: "Chief Engineer", approver: "General Manager", risk: "Energy efficiency", status: "Awaiting GM", priority: "High", department: "Energy", asset: "EQ-AC-0118", submitted: "Today, 9:10 AM", due: "Today, 5:00 PM", justification: "Chiller approach temperature is drifting above baseline and is increasing power consumption during peak occupancy.", impact: "Estimated Rs 2.4 L avoidable energy loss if deferred for 30 days.", documents: ["Vendor quote", "BMS trend", "Energy variance note"] },
  { id: "APR-1027", item: "Lift door sensor replacement", category: "Safety / Guest Impact", value: "Rs 24,500", requester: "Duty Engineer", approver: "Finance Controller", risk: "Guest disruption", status: "Finance Review", priority: "High", department: "Front Office", asset: "EQ-LFT-0042", submitted: "Today, 8:35 AM", due: "Today, 3:00 PM", justification: "Repeat lift stoppages at lobby core affecting arrivals and group movement.", impact: "Risk of lobby congestion, repeat vendor callouts, and guest complaint compensation.", documents: ["Fault log", "Vendor estimate", "Incident photos"] },
  { id: "APR-1026", item: "Fire panel battery bank", category: "Life Safety", value: "Rs 18,200", requester: "Safety Officer", approver: "Chief Engineer", risk: "Compliance", status: "Approved", priority: "Critical", department: "Life Safety", asset: "FIRE-PNL-01", submitted: "Yesterday, 6:20 PM", due: "Today, 10:00 AM", justification: "Battery backup capacity is below statutory threshold during discharge test.", impact: "Compliance exposure and possible fire system impairment during outage.", documents: ["Test certificate", "Battery report"] },
  { id: "APR-1025", item: "Cold room compressor emergency repair", category: "Emergency Repair", value: "Rs 1,38,000", requester: "Executive Chef", approver: "Finance Controller", risk: "Food safety", status: "Awaiting Finance", priority: "Critical", department: "Culinary", asset: "REF-CR-03", submitted: "Yesterday, 11:45 PM", due: "Today, 12:00 PM", justification: "Cold room temperature excursions are threatening banquet inventory for tonight's event.", impact: "Potential food spoilage and banquet service disruption.", documents: ["Temperature log", "Vendor quote", "Chef escalation"] },
  { id: "APR-1024", item: "Guest room FCU spare kit bulk purchase", category: "Spares", value: "Rs 64,000", requester: "HVAC Supervisor", approver: "Chief Engineer", risk: "Repeat breakdown", status: "Supervisor Review", priority: "Medium", department: "Rooms", asset: "FCU-BATCH", submitted: "May 10, 2026", due: "May 12, 2026", justification: "Tower B has repeated FCU noise and condensate tickets; spare kit will reduce room downtime.", impact: "Reduces blocked room risk during high occupancy.", documents: ["Consumption report", "Open work orders"] },
];

export const reportsList: string[] = [
  "Equipment Asset Register",
  "AMC & Warranty Expiry Calendar",
  "Preventive Maintenance Compliance",
  "Breakdown Cost by Department",
  "Energy Consumption Trend",
  "Critical Asset Downtime",
  "Open Work Order Ageing",
  "Vendor Performance Scorecard",
  "Statutory Inspection Tracker",
  "Spare Parts Consumption",
];

export const categoryStats: CategoryStat[] = [
  { label: "HVAC", count: 48, health: 91 },
  { label: "Electrical", count: 36, health: 82 },
  { label: "Fire & Safety", count: 29, health: 88 },
  { label: "Kitchen", count: 54, health: 85 },
  { label: "Plumbing", count: 44, health: 79 },
];

export const roleProfiles: RoleProfile[] = [
  { id: "engineering-management", label: "Engineering Management", subtitle: "Full engineering control center", defaultPage: "dashboard", nav: ["dashboard", "equipment", "maintenance", "workflow", "approvals", "insights", "reports", "settings"], canCreateRequest: true, canManageEquipment: true },
  { id: "executive", label: "Executive", subtitle: "Costs, risks, approvals, and reports", defaultPage: "dashboard", nav: ["dashboard", "approvals", "insights", "reports"], canCreateRequest: false },
  { id: "shift-operations", label: "Shift Operations", subtitle: "Live work orders and room impact", defaultPage: "maintenance", nav: ["dashboard", "equipment", "maintenance", "reports"], canCreateRequest: true, canManageEquipment: false },
  { id: "technician", label: "Technician", subtitle: "Assigned work and asset QR records", defaultPage: "maintenance", nav: ["equipment", "maintenance"], canCreateRequest: true, canManageEquipment: false },
  { id: "planning-compliance", label: "Planning & Compliance", subtitle: "PM, statutory, checklists, and reports", defaultPage: "maintenance", nav: ["dashboard", "equipment", "maintenance", "workflow", "insights", "reports", "settings"], canCreateRequest: false, canManageEquipment: true },
  { id: "finance-commercial", label: "Finance & Commercial", subtitle: "Approvals, spend, vendors, AMC risk", defaultPage: "approvals", nav: ["dashboard", "approvals", "insights", "reports", "settings"], canCreateRequest: false },
  { id: "vendor", label: "Vendor / AMC Partner", subtitle: "Assigned service visits and equipment context", defaultPage: "maintenance", nav: ["equipment", "maintenance"], canCreateRequest: false, canManageEquipment: false },
  { id: "hotel-operations", label: "Hotel Operations", subtitle: "Guest impact and department requests", defaultPage: "maintenance", nav: ["dashboard", "maintenance", "reports"], canCreateRequest: true },
  { id: "system-admin", label: "System Admin", subtitle: "Configuration, workflows, and controls", defaultPage: "settings", nav: ["dashboard", "workflow", "reports", "settings"], canCreateRequest: false },
];

export const navItems = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "equipment", label: "Equipment Registry", href: "/equipment" },
  { id: "maintenance", label: "Maintenance", href: "/maintenance" },
  { id: "workflow", label: "Workflow", href: "/workflow" },
  { id: "approvals", label: "Approvals", href: "/approvals" },
  { id: "insights", label: "Expenditure", href: "/insights" },
  { id: "reports", label: "Reports", href: "/reports" },
  { id: "settings", label: "Configuration", href: "/settings" },
];

export const workflowTemplates: Record<string, WorkflowTemplate> = {
  breakdown: {
    name: "Critical Breakdown",
    description: "For guest-impacting or plant-critical failures requiring triage, approval, repair, and QA closure.",
    steps: [
      { name: "Request Logged", owner: "Helpdesk", sla: "5 min", approval: "No", type: "Intake" },
      { name: "Duty Engineer Triage", owner: "Duty Engineer", sla: "15 min", approval: "No", type: "Assessment" },
      { name: "Chief Engineer Review", owner: "Chief Engineer", sla: "30 min", approval: "Yes", type: "Approval" },
      { name: "Technician Execution", owner: "Assigned Team", sla: "4 hr", approval: "No", type: "Execution" },
      { name: "Supervisor QA", owner: "Supervisor", sla: "30 min", approval: "Yes", type: "Verification" },
      { name: "Room / Area Release", owner: "Front Office", sla: "15 min", approval: "Yes", type: "Closure" },
    ],
  },
  preventive: {
    name: "Preventive Maintenance",
    description: "For QR-based scheduled maintenance, checklist completion, exception handling, and supervisor sign-off.",
    steps: [
      { name: "PM Auto Generated", owner: "System", sla: "Instant", approval: "No", type: "Schedule" },
      { name: "Technician Assigned", owner: "Planner", sla: "2 hr", approval: "No", type: "Assignment" },
      { name: "QR Asset Scan", owner: "Technician", sla: "Before start", approval: "No", type: "Validation" },
      { name: "Checklist Completion", owner: "Technician", sla: "Same shift", approval: "No", type: "Execution" },
      { name: "Exception Review", owner: "Supervisor", sla: "4 hr", approval: "Conditional", type: "Review" },
      { name: "PM Closure", owner: "Chief Engineer", sla: "24 hr", approval: "Yes", type: "Closure" },
    ],
  },
  capex: {
    name: "Capex / Major Repair",
    description: "For high-value engineering jobs requiring estimate, finance approval, vendor permit, execution, and handover.",
    steps: [
      { name: "Scope Prepared", owner: "Chief Engineer", sla: "1 day", approval: "No", type: "Planning" },
      { name: "Vendor Estimate", owner: "Purchase", sla: "2 days", approval: "No", type: "Commercial" },
      { name: "Finance Approval", owner: "Finance Controller", sla: "1 day", approval: "Yes", type: "Approval" },
      { name: "GM Approval", owner: "General Manager", sla: "1 day", approval: "Yes", type: "Approval" },
      { name: "Permit To Work", owner: "Safety Officer", sla: "4 hr", approval: "Yes", type: "Permit" },
      { name: "Execution & Handover", owner: "Vendor + Engineering", sla: "As planned", approval: "Yes", type: "Closure" },
    ],
  },
};

export const workflowsSeed: Workflow[] = [
  { id: "WF-001", name: "Critical Guest Room Breakdown", template: "breakdown", status: "Active", owner: "Chief Engineer", usage: 42, updated: "Today, 9:20 AM", steps: workflowTemplates.breakdown.steps },
  { id: "WF-002", name: "Preventive Maintenance Closure", template: "preventive", status: "Active", owner: "Engineering QA", usage: 311, updated: "Yesterday, 5:10 PM", steps: workflowTemplates.preventive.steps },
  { id: "WF-003", name: "Major Repair & Capex Approval", template: "capex", status: "Draft", owner: "Finance Controller", usage: 8, updated: "May 08, 2026", steps: workflowTemplates.capex.steps },
];

export const nonQRItemsSeed: NonQRItem[] = [
  { id: "NQ-001", identity: "NQI-HARD-001", name: "Door Handle – Lever Type", category: "Hardware", location: "Tower A – Guest Floors 10–20", quantity: 220, condition: "Good", lastChecked: "May 10, 2026", notes: "Anti-tarnish stainless steel. No faults reported." },
  { id: "NQ-002", identity: "NQI-HARD-002", name: "Concealed Door Hinge", category: "Hardware", location: "Tower B – Guest Rooms", quantity: 480, condition: "Fair", lastChecked: "May 03, 2026", notes: "Some units showing surface rust near floor level. Monitor." },
  { id: "NQ-003", identity: "NQI-ELEC-003", name: "Modular Light Switch (2-gang)", category: "Electrical Fittings", location: "All towers – Corridors", quantity: 340, condition: "Good", lastChecked: "Apr 28, 2026" },
  { id: "NQ-004", identity: "NQI-PLMB-004", name: "Shower Head – Rain Type", category: "Plumbing Fittings", location: "Tower A – Deluxe Rooms", quantity: 130, condition: "Good", lastChecked: "May 12, 2026", notes: "Descaled quarterly per housekeeping schedule." },
  { id: "NQ-005", identity: "NQI-FIXT-005", name: "Towel Rail – Heated", category: "Fixtures", location: "Tower C – Bathroom", quantity: 90, condition: "Fair", lastChecked: "Apr 20, 2026", notes: "3 units reported intermittent heating. Planner notified." },
  { id: "NQ-006", identity: "NQI-HARD-006", name: "Window Handle – Tilt & Turn", category: "Hardware", location: "Tower D – Residences", quantity: 176, condition: "Good", lastChecked: "May 08, 2026" },
];

export const repairCategories: string[] = [
  "Building",
  "Complimentary Services and Gift",
  "Contract Services",
  "Decorations",
  "Dues and Subscriptions",
  "Electrical and Mechanical Equipment",
  "Elevators and Escalators",
  "Equipment Rental",
  "Engineering Supplies",
  "Furniture and Equipment",
  "Grounds Maintenance and Landscaping",
  "Heating, Ventilation & Air Cond Equipment",
  "Kitchen Equipment",
  "Laundry and Dry Cleaning",
  "Laundry Equipment",
  "Licenses and Permits",
  "Life and Safety",
  "Light Bulbs",
  "Miscellaneous",
  "Operating Supplies",
  "Painting and Decorating",
  "Plumbing",
  "Printing and Stationery",
  "Swimming Pool",
  "Training",
  "Travel - Meal and Entertainment",
  "Travel - Others",
  "Uniform Laundry",
  "Uniforms",
  "Vehicle Repair",
  "Waste Removal",
];

export const utilityCategories: string[] = [
  "Electricity",
  "Water",
  "Diesel",
  "Other Fuels",
];

export const expenditureBudgetsSeed: { utility: number; repair: number } = {
  utility: 450000,
  repair: 200000,
};

export const expenditureBillsSeed: ExpenditureBill[] = [
  // Utility bills
  { id: "UB-001", type: "utility", category: "Electricity", description: "Electricity – BESCOM Dec 2025", amount: 420000, month: "2025-12", reference: "BESCOM-2025-1892", uploadedAt: "Jan 3, 2026" },
  { id: "UB-002", type: "utility", category: "Electricity", description: "Electricity – BESCOM Jan 2026", amount: 395000, month: "2026-01", reference: "BESCOM-2026-0122", uploadedAt: "Feb 2, 2026" },
  { id: "UB-003", type: "utility", category: "Water", description: "Water charges – Jan 2026", amount: 100000, month: "2026-01", reference: "BWSSB-2026-0045", uploadedAt: "Feb 5, 2026" },
  { id: "UB-004", type: "utility", category: "Electricity", description: "Electricity – BESCOM Feb 2026", amount: 430000, month: "2026-02", reference: "BESCOM-2026-0244", uploadedAt: "Mar 4, 2026" },
  { id: "UB-005", type: "utility", category: "Electricity", description: "Electricity – BESCOM Mar 2026", amount: 415000, month: "2026-03", reference: "BESCOM-2026-0368", uploadedAt: "Apr 2, 2026" },
  { id: "UB-006", type: "utility", category: "Diesel", description: "Diesel – DG Sets Mar 2026", amount: 60000, month: "2026-03", reference: "FUEL-2026-0312", uploadedAt: "Apr 3, 2026" },
  { id: "UB-007", type: "utility", category: "Electricity", description: "Electricity – BESCOM Apr 2026", amount: 410000, month: "2026-04", reference: "BESCOM-2026-0491", uploadedAt: "May 3, 2026" },
  { id: "UB-008", type: "utility", category: "Electricity", description: "Electricity – BESCOM May 2026 (interim)", amount: 180000, month: "2026-05", reference: "BESCOM-2026-0551", uploadedAt: "May 15, 2026" },
  // Repair bills
  { id: "RB-001", type: "repair", category: "Elevators and Escalators", description: "Kone Elevators – Lift A overhaul", amount: 185000, month: "2025-12", reference: "KONE-INV-4821", uploadedAt: "Jan 6, 2026" },
  { id: "RB-002", type: "repair", category: "Life and Safety", description: "Johnson Controls – Fire panel service", amount: 120000, month: "2026-01", reference: "JCI-INV-2026-011", uploadedAt: "Feb 4, 2026" },
  { id: "RB-003", type: "repair", category: "Heating, Ventilation & Air Cond Equipment", description: "Blue Star – HVAC coil replacement", amount: 120000, month: "2026-01", reference: "BSL-INV-2026-034", uploadedAt: "Feb 7, 2026" },
  { id: "RB-004", type: "repair", category: "Plumbing", description: "Plumbing – PRV replacement Towers B & C", amount: 160000, month: "2026-02", reference: "PLMB-2026-088", uploadedAt: "Mar 3, 2026" },
  { id: "RB-005", type: "repair", category: "Swimming Pool", description: "Thermax – Pool heat exchanger descaling", amount: 95000, month: "2026-03", reference: "TMX-INV-2026-042", uploadedAt: "Apr 5, 2026" },
  { id: "RB-006", type: "repair", category: "Electrical and Mechanical Equipment", description: "Electrical – Ballroom dimmer replacement", amount: 120000, month: "2026-03", reference: "EL-INV-2026-091", uploadedAt: "Apr 8, 2026" },
  { id: "RB-007", type: "repair", category: "Building", description: "Civil – Basement waterproofing patch", amount: 190000, month: "2026-04", reference: "CIV-INV-2026-014", uploadedAt: "May 2, 2026" },
  { id: "RB-008", type: "repair", category: "Kitchen Equipment", description: "Kitchen – Combi oven parts & labour", amount: 90000, month: "2026-05", reference: "KTN-INV-2026-022", uploadedAt: "May 16, 2026" },
];

export const configurationSections = [
  {
    id: "asset-categories",
    title: "Asset categories",
    owner: "Chief Engineer",
    updated: "Today, 10:15 AM",
    description: "Define hotel engineering asset families, criticality, PM frequency, QR tagging rules, and default ownership.",
    fields: ["Category code", "Category name", "Criticality", "Default owner", "PM frequency", "QR required", "Statutory flag"],
    records: [
      ["HVAC", "Chillers, AHUs, FCUs", "Critical", "HVAC Supervisor", "Monthly", "Yes", "No"],
      ["FIRE", "Fire panels, pumps, hydrants", "Critical", "Safety Officer", "Weekly", "Yes", "Yes"],
      ["LIFT", "Lifts and escalators", "High", "Vertical Transport Lead", "Monthly", "Yes", "Yes"],
      ["KTN", "Kitchen equipment", "High", "Kitchen Engineering", "Fortnightly", "Yes", "No"],
    ],
    rules: ["Every critical asset must have QR tagging enabled.", "Statutory categories require certificate expiry tracking.", "PM frequency drives automatic work order generation."],
  },
  {
    id: "location-hierarchy",
    title: "Location hierarchy",
    owner: "Engineering Planner",
    updated: "Yesterday, 6:30 PM",
    description: "Maintain property, tower, floor, room, public area, plant room, and back-of-house location structure.",
    fields: ["Property", "Zone", "Tower / Block", "Floor", "Room / Area", "Cost center", "Front office visibility"],
    records: [
      ["Grand Palace Hotel", "Guest Rooms", "Tower A", "38", "Presidential Suite 3801", "Rooms", "Yes"],
      ["Grand Palace Hotel", "Public Area", "Lobby Core", "G", "Guest Lift A", "Front Office", "Yes"],
      ["Grand Palace Hotel", "Plant", "Basement", "B2", "Central Chiller Plant", "Engineering", "No"],
      ["Grand Palace Hotel", "F&B", "Podium", "P2", "Banquet Kitchen", "Culinary", "No"],
    ],
    rules: ["Blocked room impact is calculated from tower and room mapping.", "Public-area locations trigger duty manager notifications.", "Plant rooms require permit validation for vendor entry."],
  },
  {
    id: "vendor-masters",
    title: "Vendor masters",
    owner: "Purchase + Engineering",
    updated: "May 07, 2026",
    description: "Control vendor contacts, AMC scope, permit requirements, response SLAs, insurance, and escalation contacts.",
    fields: ["Vendor", "Scope", "Primary contact", "Response SLA", "Permit type", "Insurance expiry", "AMC status"],
    records: [
      ["Kone Elevators", "Lifts and escalators", "Rahul Mehta", "2 hr", "Lift access", "2026-11-30", "Active"],
      ["Johnson Controls", "Fire systems", "Neha Suri", "1 hr", "Life safety bypass", "2026-10-15", "Active"],
      ["Blue Star", "Cold rooms and HVAC", "Arvind Rao", "4 hr", "Food area access", "2026-09-20", "Active"],
      ["Thermax", "Boilers and heat exchangers", "Sahil Jain", "6 hr", "Chemical handling", "2026-12-31", "Active"],
    ],
    rules: ["Expired insurance blocks permit approval.", "Critical vendors need 24/7 escalation contacts.", "Vendor performance is scored from response and closure time."],
  },
  {
    id: "sla-matrix",
    title: "SLA matrix",
    owner: "Duty Manager + Chief Engineer",
    updated: "Today, 8:00 AM",
    description: "Set acknowledgement, assignment, restoration, escalation, and closure rules by priority and guest impact.",
    fields: ["Priority", "Acknowledge", "Assign", "Restore", "Escalate to", "Guest update", "Breach action"],
    records: [
      ["Critical", "5 min", "10 min", "4 hr", "Chief Engineer + GM", "Every 30 min", "Auto escalation"],
      ["High", "15 min", "30 min", "8 hr", "Chief Engineer", "Every 60 min", "Supervisor review"],
      ["Medium", "30 min", "2 hr", "48 hr", "Supervisor", "On request", "Daily ageing"],
      ["Low", "4 hr", "1 day", "5 days", "Planner", "No", "Weekly ageing"],
    ],
    rules: ["Occupied-room requests inherit at least High priority.", "Life-safety alarms cannot be downgraded.", "SLA breach creates an approval note and audit log."],
  },
  {
    id: "approval-limits",
    title: "Approval limits",
    owner: "Finance Controller",
    updated: "May 06, 2026",
    description: "Configure purchase, repair, capex, shutdown, safety bypass, and emergency work approval thresholds.",
    fields: ["Request type", "Value / risk", "Approver 1", "Approver 2", "Finance", "GM required", "Emergency override"],
    records: [
      ["Minor repair", "Up to Rs 25,000", "Supervisor", "Chief Engineer", "No", "No", "No"],
      ["Major repair", "Rs 25,001 to Rs 200,000", "Chief Engineer", "Finance Controller", "Yes", "Conditional", "Yes"],
      ["Capex", "Above Rs 200,000", "Chief Engineer", "GM", "Yes", "Yes", "No"],
      ["Life safety bypass", "Any value", "Safety Officer", "Chief Engineer", "No", "Yes", "Yes"],
    ],
    rules: ["Emergency override requires post-facto approval within 24 hours.", "GM approval is mandatory for guest-impacting shutdowns.", "Finance approval is mandatory for external purchase orders."],
  },
  {
    id: "checklist-templates",
    title: "Checklist templates",
    owner: "Engineering QA",
    updated: "Today, 9:40 AM",
    description: "Build reusable PM, safety, handover, room release, and vendor work checklist templates.",
    fields: ["Template", "Asset type", "Frequency", "Photo required", "Reading required", "Supervisor sign-off", "Auto fail trigger"],
    records: [
      ["Chiller PM", "HVAC", "Monthly", "Yes", "Yes", "Yes", "Approach temp high"],
      ["Fire pump test", "Fire & Safety", "Weekly", "Yes", "Yes", "Yes", "Pressure drop"],
      ["Room release", "Guest Rooms", "On demand", "Yes", "No", "Yes", "Guest impact open"],
      ["Vendor handover", "All vendor jobs", "Per visit", "Yes", "Conditional", "Yes", "Permit not closed"],
    ],
    rules: ["Failed checklist items create corrective work orders.", "Critical checklist completion needs QR scan validation.", "Room release checklists notify Front Office automatically."],
  },
];
