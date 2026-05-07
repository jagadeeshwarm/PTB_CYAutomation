// Date helpers for inline date inputs.
// Native <input type="date"> always accepts YYYY-MM-DD as its value,
// even when the UI displays dd-mm-yyyy (display locale only).

export const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const addDays = (days, baseDate = new Date()) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
};

export const dateOffset = (days, baseDate = new Date()) => {
  return formatDate(addDays(days, baseDate));
};

// Format a Date as "mm/dd/yyyy".
export const formatDateMMDDYYYY = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy}`;
};

export const dateOffsetMMDDYYYY = (days, baseDate = new Date()) => {
  return formatDateMMDDYYYY(addDays(days, baseDate));
};

// Returns "mm/dd/yyyy hh:mm:ss" format expected by side panel datetime inputs.
// Default time is 09:00:00 (must be below 17:00:00 to be accepted).
export const dateTimeOffset = (
  days,
  hours = 9,
  minutes = 0,
  seconds = 0,
  baseDate = new Date(),
) => {
  const d = addDays(days, baseDate);
  d.setHours(hours, minutes, seconds, 0);
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${formatDateMMDDYYYY(d)} ${hh}:${mi}:${ss}`;
};

// Convert "mm/dd/yyyy" to "yyyy/mm/dd" for tree-view assertions.
export const inputDateToTreeDate = (mmddyyyy) => {
  const [mm, dd, yyyy] = mmddyyyy.split("/");
  return `${yyyy}/${mm}/${dd}`;
};

// Parse a display date into a Date object.
// Auto-detects yyyy-mm-dd / yyyy/mm/dd vs dd-mm-yyyy / dd/mm/yyyy
// based on whether the first segment is 4 digits.
export const parseDisplayDate = (displayText) => {
  const parts = displayText.trim().split(/[-/]/);
  let yyyy, mm, dd;
  if (parts[0].length === 4) {
    [yyyy, mm, dd] = parts;
  } else {
    [dd, mm, yyyy] = parts;
  }
  return new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`);
};

// Mirrors the app's start-date weekend snap: Sat/Sun → next Monday.
export const nextWorkday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  if (day === 6) d.setDate(d.getDate() + 2); // Sat → Mon
  else if (day === 0) d.setDate(d.getDate() + 1); // Sun → Mon
  return d;
};

// Mirrors the app's end-date weekend snap: Sat/Sun → previous Friday.
export const prevWorkday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  if (day === 6) d.setDate(d.getDate() - 1); // Sat → Fri
  else if (day === 0) d.setDate(d.getDate() - 2); // Sun → Fri
  return d;
};

// Calendar-day difference between two dates (d2 − d1), time-independent.
export const diffCalendarDays = (d1, d2) => {
  const norm = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((norm(d2) - norm(d1)) / (24 * 60 * 60 * 1000));
};

// Format a Date object as "mm/dd/yyyy hh:mm:ss" for side-panel datetime inputs.
export const dateTimeFromDate = (date, hours = 9, minutes = 0, seconds = 0) => {
  const d = new Date(date);
  d.setHours(hours, minutes, seconds, 0);
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${formatDateMMDDYYYY(d)} ${hh}:${mi}:${ss}`;
};
