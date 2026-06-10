import { EMS_MODEL, TODO_WORKFLOW, COMMON } from "../../support/selectors";
import { dateOffset } from "../../support/utils/dateUtils";

/**
 * EmsModelPage — Element Management workspace > Building Models > Model tab.
 *
 * Covers the Model node lifecycle and its Node Properties tabs:
 *   Group/Element creation, General (rename + status), Status Tracker (manual
 *   statuses), To Dos, Documents (upload), Cost (inline grid), and Tickets.
 *
 * Assumes the project is already open and the Element Management workspace is
 * selected (dashboardPage.selectWorkspaceByName("Element Management")).
 *
 * The New ToDo popup here is structurally identical to the Coordination one, so
 * its field selectors are reused from TODO_WORKFLOW.
 */
class EmsModelPage {
  // ── EMS home: create / open / delete a Building Structure ───────────────────

  /** Open the Create Building Structure popup from the EMS home list. */
  clickNewEms() {
    cy.get(EMS_MODEL.emsNewButton, { timeout: 20000 })
      .filter(":visible")
      .first()
      .click();
    cy.get(EMS_MODEL.createStructureModal, { timeout: 10000 }).should(
      "be.visible"
    );
    cy.wait(1000);
  }

  enterEmsName(name) {
    cy.get(EMS_MODEL.createStructureNameInput)
      .filter(":visible")
      .first()
      .click()
      .type("{selectall}{backspace}")
      .type(name);
    cy.wait(400);
  }

  saveEmsStructure() {
    cy.get(EMS_MODEL.createStructureModal)
      .contains("button", new RegExp(`^\\s*${EMS_MODEL.createStructureSaveText}\\s*$`, "i"))
      .click();
    cy.wait(2500);
  }

  /** Create a Building Structure and confirm the Model tree opens. */
  createBuildingStructure(name) {
    this.clickNewEms();
    this.enterEmsName(name);
    this.saveEmsStructure();
    // Save normally opens the new EMS into the Model view. A brand-new EMS has
    // no nodes, so the tree isn't rendered yet — the Model panel '+' button is
    // the reliable "inside the EMS" indicator. If it's missing, Save didn't
    // navigate, so open the EMS from the home list instead.
    cy.get("body").then(($body) => {
      if ($body.find(EMS_MODEL.newButton).length === 0) {
        this.openEmsByName(name);
      }
    });
    cy.get(EMS_MODEL.newButton, { timeout: 20000 }).should("be.visible");
    cy.wait(1000);
  }

  /** Double-click an EMS row (by name) in the home list to open it. */
  openEmsByName(name) {
    cy.get(`${EMS_MODEL.emsTable} tr`, { timeout: 15000 })
      .filter((_i, row) => row.textContent.includes(name))
      .first()
      .dblclick();
    cy.wait(3000);
  }

  /** Return to the EMS home list (Structure) via the Building Models nav tab. */
  goToEmsHome() {
    cy.get("a.main-menu-text-container:visible", { timeout: 15000 })
      .filter(
        (_i, el) =>
          el.textContent.replace(/\s+/g, " ").trim() ===
          EMS_MODEL.buildingModelsTabLabel
      )
      .first()
      .click();
    cy.wait(2500);
    cy.get(EMS_MODEL.emsNewButton, { timeout: 20000 }).should("be.visible");
  }

  /** Select an EMS row by name (checkbox if present, else click the row). */
  selectEmsRow(name) {
    cy.get(`${EMS_MODEL.emsTable} tr`, { timeout: 15000 })
      .filter((_i, row) => row.textContent.includes(name))
      .first()
      .then(($row) => {
        // Ant checkboxes hide the real <input>; click its label wrapper.
        const $cbLabel = $row.find("label.ant-checkbox-wrapper");
        if ($cbLabel.length) {
          cy.wrap($cbLabel.first()).click();
        } else {
          cy.wrap($row).click();
        }
      });
    cy.wait(800);
  }

  /** Select the EMS, click Delete, confirm, and verify it's gone from the list. */
  deleteEms(name) {
    this.selectEmsRow(name);
    cy.get(EMS_MODEL.emsHomeDeleteBtn).click();
    cy.wait(1000);
    // Confirm the danger dialog (cmacs-modal > .trans-model-footer > Delete).
    cy.get(`${COMMON.modalDangerButton}:visible`, { timeout: 10000 })
      .first()
      .click();
    cy.wait(2500);
    cy.get(EMS_MODEL.emsTable).should("not.contain.text", name);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /** Ensure the Building Models > Model tree is visible. */
  openBuildingModels() {
    cy.get("body").then(($body) => {
      const $nav = $body
        .find("a.main-menu-text-container:visible")
        .filter(
          (_i, el) =>
            el.textContent.replace(/\s+/g, " ").trim() ===
            EMS_MODEL.buildingModelsTabLabel
        );
      if ($nav.length) {
        cy.wrap($nav.first()).click();
        cy.wait(1500);
      }
    });
    cy.get(EMS_MODEL.newButton, { timeout: 20000 }).should("be.visible");
    cy.wait(1000);
  }

  // ── Tree helpers ───────────────────────────────────────────────────────────

  /**
   * The cmacs-tree-node whose OWN title equals `name`. A node's own title is
   * the one in its direct li > div header — matching any descendant title
   * would wrongly return the parent group for a child element's name (parent
   * nodes contain their children's DOM).
   */
  getNodeByName(name) {
    return cy
      .get(`${EMS_MODEL.tree} ${EMS_MODEL.treeNode}`, { timeout: 15000 })
      .filter((_i, node) => {
        const ownTitle = Cypress.$(node)
          .children("li")
          .children("div")
          .find(EMS_MODEL.treeNodeTitle)
          .first()
          .text()
          .trim();
        return ownTitle === name;
      });
  }

  /**
   * Click the most recently added tree node (last in the tree) to select it.
   * Every node row is covered by a .cmacs-context-menu-overlay div that
   * intercepts all pointer events — clicks must go to IT, not the title span.
   */
  clickLastTreeNode() {
    cy.get(`${EMS_MODEL.tree} ${EMS_MODEL.nodeContextOverlay}`, {
      timeout: 15000,
    })
      .last()
      .scrollIntoView()
      .click();
    cy.wait(1500);
  }

  clickNodeByName(name) {
    this.getNodeByName(name)
      .first()
      .find(EMS_MODEL.nodeContextOverlay)
      .first()
      .scrollIntoView()
      .click();
    cy.wait(1500);
  }

  // ── Add Group / Add Element ─────────────────────────────────────────────────

  /**
   * Open the '+' (New) dropdown and click an item by its visible text.
   * Uses a REAL click (no force) on the overlay menu item — a forced click only
   * hovers these cmacs dropdown items and never fires their (click) handler, so
   * the action (e.g. create group) never runs.
   */
  clickPlusMenuItem(itemText) {
    cy.get(EMS_MODEL.newButton).click();
    cy.wait(800);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .contains("li", itemText)
      .should("be.visible")
      .click();
    // The menu closes once the action fires.
    cy.get(COMMON.overlayVisibleList).should("not.exist");
    cy.wait(2000);
  }

  /** Add a top-level Group. Returns the tree node count BEFORE creation. */
  addGroup() {
    this.clickPlusMenuItem("Add Group");
  }

  /**
   * Right-click a node and pick a context-menu item by text (e.g. Add Element).
   * The right-click goes to the node's .cmacs-context-menu-overlay div — that's
   * the element wired to open the menu, not the title span.
   */
  contextMenuAction(nodeName, itemText) {
    this.getNodeByName(nodeName)
      .first()
      .find(EMS_MODEL.nodeContextOverlay)
      .first()
      .scrollIntoView()
      .rightclick();
    cy.wait(800);
    cy.get(EMS_MODEL.contextMenu, { timeout: 10000 })
      .contains("li", itemText)
      .should("be.visible")
      .click();
    cy.wait(2000);
  }

  /** Assert the named group has at least one child node (an element) under it. */
  verifyNodeHasChild(groupName) {
    this.getNodeByName(groupName)
      .first()
      .find(`ul[role='group'] ${EMS_MODEL.treeNode}`)
      .should("have.length.greaterThan", 0);
  }

  /** The first child node's title text under a group (the just-added element). */
  getFirstChildNodeName(groupName) {
    return this.getNodeByName(groupName)
      .first()
      .find(`ul[role='group'] ${EMS_MODEL.treeNode} ${EMS_MODEL.treeNodeTitle}`)
      .first()
      .invoke("text")
      .then((t) => t.trim());
  }

  // ── Node Properties tabs ─────────────────────────────────────────────────────

  /** Click a top-level Node Properties tab by its label. */
  openTab(label) {
    cy.get(EMS_MODEL.topTabBtn, { timeout: 15000 })
      .filter((_i, t) => t.textContent.trim() === label)
      .first()
      .scrollIntoView()
      .click();
    cy.wait(1500);
  }

  // ── General tab ──────────────────────────────────────────────────────────────

  /**
   * Rename the currently-selected node via the Node Name input.
   * Uses {selectall}{backspace} rather than .clear() to avoid the app's global
   * Delete shortcut (see coding conventions).
   */
  renameNode(newName) {
    cy.get(EMS_MODEL.nodeNameInput, { timeout: 15000 })
      .filter(":visible")
      .first()
      .click()
      .type("{selectall}{backspace}")
      .type(newName)
      .blur();
    cy.wait(1500);
  }

  verifyNodeStatus(expected) {
    cy.get(EMS_MODEL.nodeStatusTag, { timeout: 10000 })
      .filter(":visible")
      .first()
      .invoke("text")
      .then((t) => expect(t.trim()).to.eq(expected));
  }

  verifyDerivedStatusEnabled() {
    cy.get(EMS_MODEL.derivedStatusSwitch, { timeout: 10000 })
      .filter(":visible")
      .first()
      .should("have.class", "ant-switch-checked");
  }

  /**
   * Click an action link inside a Node Properties panel by its text.
   * These links are .ant-card-meta-title divs that are CSS-clipped (overflow),
   * which Cypress's visibility check rejects even though they're on screen and
   * nothing covers them. Force is correct here: the event is dispatched on the
   * exact element a manual click targets. (The no-force rule still applies to
   * dropdown items / tree nodes, where another element captures the events.)
   */
  clickPanelLink(panelSelector, linkText) {
    cy.get(panelSelector, { timeout: 15000 })
      .contains(linkText)
      .scrollIntoView()
      .click({ force: true });
    cy.wait(1500);
  }

  // ── Status Tracker tab ───────────────────────────────────────────────────────

  clickAddManualStatus() {
    cy.get(EMS_MODEL.addManualStatusLink, { timeout: 15000 })
      .filter((_i, el) =>
        el.textContent.trim().includes(EMS_MODEL.addManualStatusText)
      )
      .first()
      .scrollIntoView()
      .click({ force: true }); // clipped card title — see clickPanelLink note
    cy.wait(1500);
  }

  verifyManualStatusCount(count) {
    cy.get(EMS_MODEL.manualStatusRow, { timeout: 10000 }).should(
      "have.length",
      count
    );
  }

  /** The manual-status row whose Name cell text contains `name`. */
  getManualStatusRowByName(name) {
    return cy
      .get(EMS_MODEL.manualStatusRow, { timeout: 10000 })
      .filter((_i, row) =>
        Cypress.$(row)
          .find(EMS_MODEL.manualStatusNameCell)
          .text()
          .trim()
          .includes(name)
      );
  }

  /**
   * Set the Status of a manual-status row. The dropdown opens on double-click
   * of the inline cell div inside the Status td. The td lives in the table's
   * horizontal-scroll overflow, so Cypress flags it as clipped — force the
   * dblclick after scrolling it into view (nothing covers it).
   */
  setManualStatus(rowName, status) {
    this.getManualStatusRowByName(rowName)
      .first()
      .find(`${EMS_MODEL.manualStatusStatusCell} ${EMS_MODEL.inlineCell}`)
      .first()
      .scrollIntoView()
      .dblclick({ force: true });
    cy.wait(900);
    // The dblclick switches the cell into edit mode (renders a select) but the
    // synthetic double-click fires before the editor mounts, so the list may
    // not open — click the rendered select/editor in the cell to open it.
    cy.get("body").then(($body) => {
      if (!$body.find(`${COMMON.overlayContainer} li:visible`).length) {
        this.getManualStatusRowByName(rowName)
          .first()
          .find(EMS_MODEL.manualStatusStatusCell)
          .find("cmacs-select, .ant-select, .cmacs-compact-table-inline-cell")
          .first()
          .scrollIntoView()
          .click({ force: true });
        cy.wait(900);
      }
    });
    cy.get(`${COMMON.overlayContainer} li:visible`, { timeout: 10000 })
      .filter((_i, li) => li.textContent.trim() === status)
      .first()
      .click();
    cy.wait(1200);
  }

  /** Check a manual-status row's checkbox, then delete it via the header button. */
  deleteManualStatus(rowName) {
    // Ant checkboxes hide the real <input>; click the label wrapper instead.
    this.getManualStatusRowByName(rowName)
      .first()
      .find("td.cmacs-compact-table-fst-td label.ant-checkbox-wrapper")
      .first()
      .click();
    cy.wait(700);
    cy.get(EMS_MODEL.manualStatusDeleteBtn).click();
    cy.wait(1500);
  }

  verifyManualStatusGone(rowName) {
    cy.get(EMS_MODEL.statusPanel).should("not.contain.text", rowName);
  }

  // ── To Dos tab ────────────────────────────────────────────────────────────────

  clickAddToDo() {
    this.clickPanelLink(EMS_MODEL.activeTabPane, EMS_MODEL.addToDoText);
    cy.get(TODO_WORKFLOW.modal, { timeout: 10000 }).should("be.visible");
    cy.wait(1000);
  }

  enterTodoTitle(title) {
    cy.get(TODO_WORKFLOW.titleInput).clear().type(title);
    cy.wait(300);
  }

  selectTodoUser(index = 1) {
    cy.get(TODO_WORKFLOW.assignedToSelect).click();
    cy.wait(800);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .eq(index)
      .click();
    this.closeOpenOverlayIfPresent();
    cy.wait(500);
  }

  /** Pick today's date in the Planned Start Date picker of the ToDo popup. */
  selectTodoPlannedToday() {
    cy.get(TODO_WORKFLOW.plannedStartDatePicker).click();
    cy.wait(600);
    cy.get("body").then(($body) => {
      if ($body.find(`${TODO_WORKFLOW.datePopupTodayCell}:visible`).length) {
        cy.get(TODO_WORKFLOW.datePopupTodayCell)
          .filter(":visible")
          .first()
          .click();
      } else {
        const day = String(Number(dateOffset(0).split("-")[2]));
        cy.get(TODO_WORKFLOW.datePopupTable, { timeout: 10000 })
          .filter(":visible")
          .first()
          .within(() => {
            cy.get("td")
              .filter(":visible")
              .filter((_i, cell) => cell.textContent.trim() === day)
              .first()
              .click();
          });
      }
    });
    cy.wait(500);
  }

  clickTodoCreate() {
    this.closeOpenOverlayIfPresent();
    cy.get(TODO_WORKFLOW.createButton).click();
    cy.get(TODO_WORKFLOW.titleInput, { timeout: 10000 }).should("not.exist");
    cy.wait(2000);
  }

  verifyTodoInList(title) {
    cy.get(EMS_MODEL.activeTabPane, { timeout: 10000 }).should(
      "contain.text",
      title
    );
  }

  // ── Documents tab ─────────────────────────────────────────────────────────────

  uploadDocumentFile(fixtureRelativePath) {
    // Feed the fixture straight into the Documents panel's own nz-upload input
    // (hidden by design, hence force). No link click needed — the "Upload
    // File" anchor merely proxies a click to this input.
    cy.get(EMS_MODEL.docUploadFileLink, { timeout: 15000 }).should("exist");
    cy.get(EMS_MODEL.docFileInput).selectFile(
      `cypress/fixtures/${fixtureRelativePath}`,
      { force: true }
    );
    cy.wait(5000);
  }

  verifyDocumentExists(name) {
    cy.get(EMS_MODEL.docPanel).should("contain.text", name);
  }

  /**
   * Click "Project Files / Folders": a small File/Folder menu opens; choosing
   * "Folder" opens the "Select Files" modal with the project folder tree.
   * Check the first folder (Root Folder) and Save to attach it.
   */
  addProjectFilesFolder(kind = "Folder") {
    cy.get(EMS_MODEL.docProjectFilesBtn, { timeout: 15000 })
      .filter((_i, el) =>
        el.textContent.trim().includes(EMS_MODEL.projectFilesText)
      )
      .first()
      .scrollIntoView()
      .click({ force: true }); // clipped card content — same as panel links
    cy.wait(800);
    // File / Folder chooser menu.
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .contains("li", kind)
      .should("be.visible")
      .click();
    cy.wait(1200);
    // "Select folders" modal: tick the first ENABLED folder checkbox. If only
    // disabled ones are visible (file-picker variant disables Root Folder),
    // expand the root node and tick a child instead.
    cy.get(`${EMS_MODEL.selectFilesTreeCheckbox}:visible`, {
      timeout: 10000,
    }).then(($cbs) => {
      const enabled = $cbs
        .toArray()
        .filter((el) => !el.classList.contains("ant-tree-checkbox-disabled"));
      if (enabled.length) {
        cy.wrap(enabled[0]).click();
      } else {
        cy.get(`${EMS_MODEL.selectFilesTreeSwitcher}:visible`).first().click();
        cy.wait(1000);
        cy.get(`${EMS_MODEL.selectFilesTreeCheckbox}:visible`)
          .filter(
            (_i, el) => !el.classList.contains("ant-tree-checkbox-disabled")
          )
          .first()
          .click();
      }
    });
    cy.wait(800);
    // Save (the modal's primary button).
    cy.get(".ant-btn-primary")
      .filter(":visible")
      .first()
      .click();
    cy.wait(5000);
  }

  verifyProjectFolderDisplayed() {
    cy.get(EMS_MODEL.docFolderIcon, { timeout: 10000 }).should("exist");
  }

  // ── Cost tab ────────────────────────────────────────────────────────────────

  clickAddCost() {
    cy.get(EMS_MODEL.addCostLink, { timeout: 15000 })
      .filter((_i, el) => el.textContent.trim().includes(EMS_MODEL.addCostText))
      .first()
      .scrollIntoView()
      .click({ force: true }); // clipped card title — see clickPanelLink note
    cy.wait(1500);
  }

  /**
   * Edit a numeric cell of the first cost row. Clicking the inline cell turns it
   * into an <input>; we type the value with {selectall}{backspace} (no .clear()).
   */
  editCostCell(cellSelector, value) {
    const cellSel = `${EMS_MODEL.costRow} ${cellSelector} ${EMS_MODEL.inlineCell}`;
    // Saving the previous cell PUTs and re-renders the row — wait for it to
    // settle, then query fresh per command (a held subject goes stale when the
    // row re-renders mid-click).
    cy.wait(1500);
    cy.get(cellSel).first().scrollIntoView();
    cy.get(cellSel).first().click({ force: true }); // clipped table overflow
    cy.wait(600);
    cy.get(`${EMS_MODEL.costRow} ${cellSelector} input`)
      .first()
      .type(`{selectall}{backspace}${value}{enter}`, { force: true });
    cy.wait(1000);
  }

  setCostQuantity(value) {
    this.editCostCell(EMS_MODEL.costQuantityCell, value);
  }

  setCostPerUnit(value) {
    this.editCostCell(EMS_MODEL.costPerUnitCell, value);
  }

  /** Assert Cost(USD) == quantity * costPerUnit (retries until it updates). */
  verifyCostTotal(quantity, costPerUnit) {
    const expected = quantity * costPerUnit;
    cy.get(
      `${EMS_MODEL.costRow} ${EMS_MODEL.costTotalCell} ${EMS_MODEL.inlineCell}`,
      { timeout: 15000 }
    )
      .first()
      .should(($el) => {
        const actual = Number($el.text().replace(/[^0-9.-]/g, ""));
        expect(actual, "Cost(USD) = Quantity * Cost/Unit").to.eq(expected);
      });
  }

  // ── Tickets tab ───────────────────────────────────────────────────────────────

  clickCreateNewTicket() {
    this.clickPanelLink(EMS_MODEL.ticketPanel, EMS_MODEL.createTicketText);
    cy.get(EMS_MODEL.ticketModal, { timeout: 10000 }).should("be.visible");
    cy.wait(1500);
  }

  enterTicketTitle(title) {
    cy.get(EMS_MODEL.ticketTitleInput).click().clear().type(title);
    cy.wait(400);
  }

  /** Open a cmacs-select and pick a random real option (skips search rows). */
  pickRandomOption(triggerSelector) {
    this.closeOpenOverlayIfPresent();
    cy.get(triggerSelector).scrollIntoView().click();
    cy.wait(800);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .filter(":visible")
      .then(($lis) => {
        const items = [...$lis].filter(
          (li) => li.textContent.trim().length > 0 && !li.querySelector("input")
        );
        const pick = items.length > 1 ? items[1] : items[0];
        cy.wrap(pick).click();
      });
    this.closeOpenOverlayIfPresent();
    cy.wait(600);
  }

  selectTicketAssignee() {
    this.pickRandomOption(EMS_MODEL.ticketAssigneeSelect);
  }

  selectTicketCategory() {
    this.pickRandomOption(EMS_MODEL.ticketCategorySelect);
  }

  selectTicketType() {
    this.pickRandomOption(EMS_MODEL.ticketTypeSelect);
  }

  /** Click a creation-footer primary button by its label (Next / Create). */
  clickTicketFooter(label) {
    cy.get(EMS_MODEL.ticketFooterPrimary)
      .filter((_i, b) => b.textContent.trim() === label)
      .first()
      .click();
    cy.wait(1500);
  }

  uploadTicketFile(fixtureRelativePath) {
    cy.get(EMS_MODEL.ticketUploadButton, { timeout: 10000 }).click();
    cy.wait(800);
    // nz-upload file inputs are hidden by design — no :visible filter.
    cy.get(EMS_MODEL.fileInput)
      .last()
      .selectFile(`cypress/fixtures/${fixtureRelativePath}`, { force: true });
    cy.wait(3000);
  }

  verifyTicketInList(title) {
    cy.get(EMS_MODEL.ticketPanel, { timeout: 15000 }).should(
      "contain.text",
      title
    );
  }

  /** Double-click a ticket row by title to navigate to the Tickets module. */
  openTicket(title) {
    cy.get(EMS_MODEL.ticketRow, { timeout: 15000 })
      .filter((_i, row) =>
        Cypress.$(row)
          .find(EMS_MODEL.ticketTitleCell)
          .text()
          .trim()
          .includes(title)
      )
      .first()
      .find(EMS_MODEL.ticketTitleCell)
      .first()
      .dblclick();
    cy.wait(3000);
  }

  verifyOnTicketsModule() {
    cy.contains(EMS_MODEL.ticketsModuleHeader, { timeout: 15000 }).should(
      "be.visible"
    );
  }

  // ── Shared helper ──────────────────────────────────────────────────────────--

  /**
   * Dismiss an open cmacs-select / picker dropdown by clicking its transparent
   * CDK backdrop, leaving any underlying modal intact.
   */
  closeOpenOverlayIfPresent() {
    cy.get("body").then(($body) => {
      const $backdrop = $body.find(
        ".cdk-overlay-backdrop.nz-overlay-transparent-backdrop:visible"
      );
      if ($backdrop.length > 0) {
        cy.wrap($backdrop.last()).click({ force: true });
        cy.wait(300);
      }
    });
  }
}

export default new EmsModelPage();
