import type {
  PMPlan, RoomImpact, VendorJob,
  RoleProfile, CategoryStat, WorkflowTemplate, Workflow,
} from "./types";

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

export const categoryStats: CategoryStat[] = [
  { label: "HVAC", count: 48, health: 91 },
  { label: "Electrical", count: 36, health: 82 },
  { label: "Fire & Safety", count: 29, health: 88 },
  { label: "Kitchen", count: 54, health: 85 },
  { label: "Plumbing", count: 44, health: 79 },
];

export const roleProfiles: RoleProfile[] = [
  { id: "engineering-management", label: "Engineering Management", subtitle: "Full engineering control center", defaultPage: "dashboard", nav: ["dashboard", "equipment", "maintenance", "workflow", "approvals", "insights", "settings"], canCreateRequest: true, canManageEquipment: true },
  { id: "executive", label: "Executive", subtitle: "Costs, risks, approvals, and insights", defaultPage: "dashboard", nav: ["dashboard", "approvals", "insights"], canCreateRequest: false },
  { id: "shift-operations", label: "Shift Operations", subtitle: "Live work orders and room impact", defaultPage: "maintenance", nav: ["dashboard", "equipment", "maintenance"], canCreateRequest: true, canManageEquipment: false },
  { id: "technician", label: "Technician", subtitle: "Assigned work and asset QR records", defaultPage: "maintenance", nav: ["equipment", "maintenance"], canCreateRequest: true, canManageEquipment: false },
  { id: "planning-compliance", label: "Planning & Compliance", subtitle: "PM, statutory, checklists, and compliance", defaultPage: "maintenance", nav: ["dashboard", "equipment", "maintenance", "workflow", "insights", "settings"], canCreateRequest: false, canManageEquipment: true },
  { id: "finance-commercial", label: "Finance & Commercial", subtitle: "Approvals, spend, vendors, AMC risk", defaultPage: "approvals", nav: ["dashboard", "approvals", "insights", "settings"], canCreateRequest: false },
  { id: "vendor", label: "Vendor / AMC Partner", subtitle: "Assigned service visits and equipment context", defaultPage: "maintenance", nav: ["equipment", "maintenance"], canCreateRequest: false, canManageEquipment: false },
  { id: "hotel-operations", label: "Hotel Operations", subtitle: "Guest impact and department requests", defaultPage: "maintenance", nav: ["dashboard", "maintenance"], canCreateRequest: true },
  { id: "system-admin", label: "System Admin", subtitle: "Configuration, workflows, and controls", defaultPage: "settings", nav: ["dashboard", "workflow", "settings"], canCreateRequest: false },
];

export const navItems = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "equipment", label: "Equipment Registry", href: "/equipment" },
  { id: "maintenance", label: "Maintenance", href: "/maintenance" },
  { id: "workflow", label: "Workflow", href: "/workflow" },
  { id: "approvals", label: "Approvals", href: "/approvals" },
  { id: "insights", label: "Expenditure", href: "/insights" },
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
