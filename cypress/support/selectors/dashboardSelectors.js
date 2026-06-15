// Selectors for the Dashboard / Project listing module

export const DASHBOARD = {
  projectCards: "project-card cmacs-card .ant-card-body",
  projectListHeader: "project-bar",
  workspaceSelector: ".workspace-main-nav.project-workspace > div",
  // Search controls live in the secondary top-bar. Use short class-based
  // selectors scoped to .secondary-menu-area so we don't break every time
  // the surrounding flex/grid nesting changes.
  searchIcon: ".secondary-menu-area a.nav-search-icon",
  searchInput: ".secondary-menu-area nz-input-group input",
  activeSearchIcon:
    ".secondary-menu-area i.iconUILarge-Search.active-search, .secondary-menu-area i.iconUILarge-Search.close-search-icon",
  searchedProjectCard: "project-card",
  searchedProjectCardBody: "cmacs-card .ant-card-body",
};
