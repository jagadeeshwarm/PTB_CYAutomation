// Selectors for the Dashboard / Project listing module

export const DASHBOARD = {
  projectCards: "project-card cmacs-card .ant-card-body",
  projectListHeader: "project-bar",
  // Workspace switcher button (the colored banner at top-left showing
  // "Workspaces / <name>"). The banner element carries an extra class for
  // the *current* workspace (e.g. .project-workspace, .coordination-workspace),
  // so we anchor only on .workspace-main-nav — the switcher needs to be
  // reachable no matter which workspace we're currently viewing.
  workspaceSelector: ".workspace-main-nav > div",
  // Search controls live in the secondary top-bar. Use short class-based
  // selectors scoped to .secondary-menu-area so we don't break every time
  // the surrounding flex/grid nesting changes.
  searchIcon: ".secondary-menu-area a.nav-search-icon",
  searchInput: ".secondary-menu-area nz-input-group input",
  activeSearchIcon:
    ".secondary-menu-area i.iconUILarge-Search.active-search, .secondary-menu-area i.iconUILarge-Search.close-search-icon",
  searchedProjectCard: "project-card",
  searchedProjectCardBody: "cmacs-card .ant-card-body",
  // Project list tab strip (Recently Opened / Recently Created / Favorite / All).
  // Search results only show under the active tab, so we switch to "All".
  projectTabBtn: ".ant-tabs-tab-btn",
};

// Selectors for the Project-workspace Dashboard finance report (#printArea).
export const DASHBOARD_FINANCE = {
  // Left-nav "Dashboard" entry inside the Project workspace. This is a stable
  // module id in the app (not a per-record id).
  dashboardNavItem: "#ebcc47a3-25e1-11eb-a808-062b5ca8a154",

  printArea: "#printArea",

  // Bottom band of the report: cumulative finance cards.
  //   child(1) → Current Month Finances (Booking / Invoice cumulative)
  //   child(3) → Nalco cumulative summary (Invoice / Collection)
  currentMonthFinances: "#printArea .sdb-bottom > div > div:nth-child(1)",
  nalcoSummary: "#printArea .sdb-bottom > div > div:nth-child(3)",

  // Financial Details — per-lot summary panel. Only summary tasks that carry
  // financial values appear here (e.g. Lot 1, Lot 2); empty lots (Lot 3) do not.
  lotSummaryPanel:
    "#printArea .sdb-bookings-section.sdb-page-break-before .sdb-lot-summary-panel",
};
