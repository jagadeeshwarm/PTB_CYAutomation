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
