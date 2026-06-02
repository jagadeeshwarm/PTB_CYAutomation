// Central registry of automation schedule names.
// A single timestamp (YYYYMMDDHHmmss) is generated once per test run,
// so every schedule created in that run gets a unique, human-readable name
// that never collides across multiple runs on the same day.
//
// Usage:
//   import { SCHEDULE_NAMES } from "../../support/utils/scheduleNames";
//   const SCHEDULE_NAME = SCHEDULE_NAMES.TASK_CREATION;

const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const runStamp = [
  now.getFullYear(),
  pad(now.getMonth() + 1),
  pad(now.getDate()),
  pad(now.getHours()),
  pad(now.getMinutes()),
  pad(now.getSeconds()),
].join("");

export const SCHEDULE_NAMES = {
  TASK_CREATION:  `Facade_TaskCreation_${runStamp}`,
  SIDE_PANEL:     `Facade_SidePanel_${runStamp}`,
  CASHFLOW:       `Facade_CashFlow_${runStamp}`,
  PREDECESSOR:    `Facade_Predecessor_${runStamp}`,
  STATUS:         `Facade_Status_${runStamp}`,
  STATUS_CHILD:   `Facade_StatusChild_${runStamp}`,
  STATUS_2CHILD:  `Facade_Status2Child_${runStamp}`,
  STATUS_3CHILD:  `Facade_Status3Child_${runStamp}`,
  STATUS_CC:      `Facade_StatusCC_${runStamp}`,
  SMART_FILTER:   `Facade_SmartFilter_${runStamp}`,
  PLANNED_ACTUAL: `Facade_PlannedActual_${runStamp}`,
  RESOURCES:      `Facade_ResourcesTimesheet_${runStamp}`,
};
