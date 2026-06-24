import { TODO_WORKFLOW, TODO_STATUS_KEY, COMMON } from "../../support/selectors";
import { dateOffset } from "../../support/utils/dateUtils";

/**
 * TodoWorkflowPage — Coordination workspace > Workflows tab > To Dos (Kanban).
 *
 * Covers: create a ToDo via the New popup, verify board placement, drag between
 * columns, change status via the side panel and the full detail page, reassign,
 * and verify the card moves accordingly.
 *
 * Assumes the project is already open and the Coordination workspace selected
 * (dashboardPage.selectWorkspaceByName("Coordination")).
 */
class TodoWorkflowPage {
  // ── Navigation ──────────────────────────────────────────────────────────--

  openWorkflowsTab() {
    // Top-nav Ant menu: <a.main-menu-text-container> carries the navigation.
    cy.get("a.main-menu-text-container:visible", { timeout: 15000 })
      .filter(
        (_i, el) =>
          el.textContent.replace(/\s+/g, " ").trim() ===
          TODO_WORKFLOW.workflowsTabLabel
      )
      .first()
      .click({ force: true });
    cy.wait(2000);
    // Default landing is the To Dos board.
    cy.get(TODO_WORKFLOW.board, { timeout: 20000 }).should("be.visible");
  }

  // ── New ToDo popup ────────────────────────────────────────────────────────

  clickNewTodo() {
    cy.get(TODO_WORKFLOW.newTodoButton, { timeout: 20000 })
      .filter(":visible")
      .first()
      .click({ force: true });
    // AntD leaves prior modal wrappers in the DOM with visibility:hidden, so
    // scope the visibility check to the wrapper that's actually showing.
    cy.get(TODO_WORKFLOW.modal, { timeout: 10000 })
      .filter(":visible")
      .should("have.length.greaterThan", 0);
    cy.wait(1000);
  }

  enterTitle(title) {
    cy.get(TODO_WORKFLOW.titleInput).clear().type(title);
    cy.wait(300);
  }

  /** Open the Assigned-To dropdown and pick a user (default: second list entry). */
  selectAssignedUser(index = 1) {
    cy.get(TODO_WORKFLOW.assignedToSelect).click();
    cy.wait(800);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .eq(index)
      .click({ force: true });
    this.closeOpenOverlayIfPresent();
    cy.wait(500);
  }

  /** Open a cmacs-date-picker in the popup and pick a date (offset days from today). */
  pickPopupDate(pickerSelector, offsetDays) {
    cy.get(pickerSelector).click();
    cy.wait(600);
    if (offsetDays === 0) {
      cy.get("body").then(($body) => {
        if ($body.find(`${TODO_WORKFLOW.datePopupTodayCell}:visible`).length) {
          cy.get(TODO_WORKFLOW.datePopupTodayCell).filter(":visible").first().click();
        } else {
          this.clickVisibleDateCell(0);
        }
      });
    } else {
      this.clickVisibleDateCell(offsetDays);
    }
    cy.wait(500);
  }

  clickVisibleDateCell(offsetDays) {
    const day = String(Number(dateOffset(offsetDays).split("-")[2]));

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

  selectPlannedStartToday() {
    this.pickPopupDate(TODO_WORKFLOW.plannedStartDatePicker, 0);
  }

  selectDueDatePlus(offsetDays = 2) {
    this.pickPopupDate(TODO_WORKFLOW.dueDatePicker, offsetDays);
  }

  /** Open Watchlist, click the "+" invite icon, then pick a user from the list. */
  addWatchlistUser(index = 1) {
    cy.get(TODO_WORKFLOW.watchlistField).click();
    cy.wait(800);
    cy.get(TODO_WORKFLOW.watchlistAddIcon, { timeout: 10000 })
      .filter(":visible")
      .first()
      .click({ force: true });
    cy.wait(800);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .eq(index)
      .click({ force: true });
    this.closeOpenOverlayIfPresent();
    cy.wait(500);
  }

  enterOriginalEstimate(hours) {
    this.closeOpenOverlayIfPresent();
    cy.get(TODO_WORKFLOW.originalEstimateInput)
      .scrollIntoView()
      .clear({ force: true })
      .type(String(hours), { force: true });
    cy.wait(300);
  }

  /**
   * Dismiss an open cmacs-select / watchlist dropdown by clicking its TRANSPARENT
   * CDK backdrop. The dropdown backdrop is `cdk-overlay-backdrop nz-overlay-
   * transparent-backdrop` — distinct from the modal's own (non-transparent)
   * backdrop, so clicking it closes only the dropdown, never the popup.
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

  /**
   * Pick an option from a cmacs-select dropdown, skipping the first list item
   * (which is the inline search box per the use case).
   */
  selectFromDropdown(triggerSelector, optionIndex = 1) {
    this.closeOpenOverlayIfPresent();
    cy.get(triggerSelector).scrollIntoView().click({ force: true });
    cy.wait(700);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .eq(optionIndex) // index 0 is the search row — start from 1
      .click();
    cy.wait(500);
  }

  selectRequiredFromDropdown(triggerSelector, optionIndex = 1) {
    this.closeOpenOverlayIfPresent();
    cy.get(triggerSelector).scrollIntoView().click({ force: true });
    cy.wait(700);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .eq(optionIndex)
      .click({ force: true });
    this.closeOpenOverlayIfPresent();
    cy.wait(500);
  }

  selectCategory(optionIndex = 1) {
    this.selectRequiredFromDropdown(TODO_WORKFLOW.categorySelect, optionIndex);
  }

  selectSubCategory(optionIndex = 1) {
    this.selectOptionalFromDropdown(TODO_WORKFLOW.subCategorySelect, optionIndex);
  }

  selectOptionalFromDropdown(triggerSelector, optionIndex = 1) {
    this.closeOpenOverlayIfPresent();
    cy.get(triggerSelector).scrollIntoView().click({ force: true });
    cy.wait(700);
    cy.get("body").then(($body) => {
      const $items = $body.find(`${COMMON.overlayVisibleList} li:visible`);
      if ($items.length > optionIndex) {
        cy.wrap($items.eq(optionIndex)).click({ force: true });
      } else {
        this.closeOpenOverlayIfPresent();
      }
    });
    this.closeOpenOverlayIfPresent();
    cy.wait(500);
  }

  clickCreate() {
    // Make sure no dropdown backdrop is covering the footer button.
    this.closeOpenOverlayIfPresent();
    cy.get(".cdk-overlay-backdrop.nz-overlay-transparent-backdrop").should(
      "not.exist"
    );
    cy.get(TODO_WORKFLOW.createButton).click();
    // The popup wrapper stays in the DOM (one empty wrapper per lazy modal), so
    // confirm closure via the create form's own title input being removed.
    cy.get(TODO_WORKFLOW.titleInput, { timeout: 10000 }).should("not.exist");
    cy.wait(2000);
  }

  /** Composite: fill the whole New ToDo popup and create. */
  createTodo(title, { estimate = 16, dueOffset = 2 } = {}) {
    this.clickNewTodo();
    this.enterTitle(title);
    this.selectAssignedUser();
    this.selectPlannedStartToday();
    this.selectDueDatePlus(dueOffset);
    this.addWatchlistUser();
    this.enterOriginalEstimate(estimate);
    this.selectCategory();
    this.selectSubCategory();
    this.clickCreate();
  }

  // ── Kanban helpers ────────────────────────────────────────────────────────

  /** A .wx-card that contains a <p> whose exact text is the ToDo title. */
  getCardByTitle(title) {
    return cy
      .get(TODO_WORKFLOW.card, { timeout: 15000 })
      .filter((_i, card) =>
        Cypress.$(card)
          .find("p")
          .toArray()
          .some((p) => p.textContent.trim() === title)
      );
  }

  /** Assert a card with `title` sits in the given status column (any row). */
  verifyCardInStatus(title, statusLabel) {
    const key = TODO_STATUS_KEY[statusLabel];
    cy.get(TODO_WORKFLOW.statusColumn(key), { timeout: 15000 })
      .filter((_i, col) =>
        Cypress.$(col)
          .find(`${TODO_WORKFLOW.card} p`)
          .toArray()
          .some((p) => p.textContent.trim() === title)
      )
      .should("have.length.greaterThan", 0);
  }

  /**
   * The assignee id of a card = the id on its avatar element, which equals the
   * data-row-header of the row it sits under. Robust, name-parsing-free.
   */
  getCardAssigneeId(title) {
    return this.getCardByTitle(title)
      .first()
      .find("[id]")
      .first()
      .invoke("attr", "id");
  }

  /** Assert the card is on a real user's list (i.e. not Unassigned). */
  verifyCardAssigned(title) {
    this.getCardByTitle(title)
      .first()
      .closest(".wx-row")
      .find(".wx-label[data-row-header]")
      .invoke("attr", "data-row-header")
      .should("not.eq", "UnAssignedToDo");
  }

  /** Drag a ToDo card from one status column to another (same user row). */
  dragCardToStatus(title, fromStatus, toStatus) {
    const fromKey = TODO_STATUS_KEY[fromStatus];
    const toKey = TODO_STATUS_KEY[toStatus];

    // Card currently living in the "from" status column.
    this.getCardByTitle(title)
      .filter(
        (_i, card) =>
          Cypress.$(card).parents(`[data-drop-area^="${fromKey}:"]`).length > 0
      )
      .first()
      .then(($card) => {
        const cardRect = $card[0].getBoundingClientRect();
        const startX = cardRect.left + cardRect.width / 2;
        const startY = cardRect.top + cardRect.height / 2;

        // Target column in the same row as the card.
        const $targetCol = Cypress.$($card)
          .closest(".wx-row")
          .find(`[data-drop-area^="${toKey}:"]`);
        const targetRect = $targetCol[0].getBoundingClientRect();
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height / 2;

        cy.wrap($card)
          .trigger("mousedown", { button: 0, clientX: startX, clientY: startY, force: true })
          .trigger("mousemove", { clientX: startX + 5, clientY: startY + 5, force: true });
        cy.get("body")
          .trigger("mousemove", { clientX: endX, clientY: endY, force: true })
          .trigger("mousemove", { clientX: endX, clientY: endY, force: true });
        cy.wrap($targetCol)
          .trigger("mousemove", { clientX: endX, clientY: endY, force: true })
          .trigger("mouseup", { clientX: endX, clientY: endY, force: true });
      });
    cy.wait(2000);
  }

  /** Click a ToDo card (its title text) to open the right side panel. */
  openCardSidePanel(title) {
    this.getCardByTitle(title)
      .first()
      .find("p")
      .filter((_i, p) => p.textContent.trim() === title)
      .first()
      .click();
    cy.get(TODO_WORKFLOW.detailsPanel, { timeout: 10000 }).should("be.visible");
    cy.wait(1000);
  }

  /** Read the card's external ToDo link (href) into the `todoHref` alias. */
  captureCardHref(title) {
    this.getCardByTitle(title)
      .first()
      .find("a[href*='/todos/']")
      .first()
      .invoke("attr", "href")
      .as("todoHref");
  }

  // ── Board toolbar actions ──────────────────────────────────────────────────

  /** Click the 3-dots menu and enable the Completed column on the board. */
  enableCompletedColumn() {
    cy.get(TODO_WORKFLOW.moreOptionsButton).click();
    cy.wait(500);
    cy.get(TODO_WORKFLOW.completedColumnCheckbox).click();
    cy.wait(1000);
    // Close the dropdown by clicking elsewhere
    cy.get("body").click(0, 0);
    cy.wait(500);
  }

  // ── Status change (side panel / detail page) ──────────────────────────────

  /**
   * Change status via the "Status" cmacs-select. Parent-agnostic: it targets the
   * visible `.section-content` whose label is "Status", so it works on both the
   * board side panel (todo-details) and the standalone ToDo detail page (which
   * reuses the same fields under a different wrapper).
   */
  changeStatus(newStatus) {
    cy.get(".section-content:visible", { timeout: 10000 })
      .filter((_i, sec) =>
        Cypress.$(sec)
          .find(".sidepanel-label-input")
          .toArray()
          .some((l) => l.textContent.trim() === "Status")
      )
      .first()
      .find("cmacs-select")
      .first()
      .click();
    cy.wait(700);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .contains(newStatus)
      .click();
    cy.wait(2000);
  }

  // ── Reassign ──────────────────────────────────────────────────────────────

  /**
   * Scroll to and click the "Reassign" link in the side panel, choose a user
   * from the second dropdown, and confirm with Update.
   *
   * `index` defaults to 2 to reduce the chance of re-picking the current
   * assignee; assignment change is verified separately by id.
   */
  reassignTo(index = 2) {
    // Open the inline reassign editor.
    cy.get(TODO_WORKFLOW.reassignLink)
      .filter((_i, a) => a.textContent.trim() === "Reassign")
      .first()
      .scrollIntoView()
      .click({ force: true });
    cy.wait(1500);

    // The editor is a "Reassign To" block (header + Update/Cancel) holding two
    // cmacs-selects: [0] = "Users" type, [1] = the new-assignee picker.
    cy.contains("Reassign To", { timeout: 10000 }).should("be.visible");
    cy.contains("Reassign To")
      .parents()
      .filter(
        (_i, el) => Cypress.$(el).find("cmacs-select").length >= 2
      )
      .first()
      .as("reassignBox");

    // Open the 2nd dropdown and pick a user (index 2 ⇒ different from the
    // current assignee, which sits at index 1).
    cy.get("@reassignBox").find("cmacs-select").eq(1).click();
    cy.wait(800);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .eq(index)
      .click();
    cy.wait(500);
    this.closeOpenOverlayIfPresent();

    // Confirm — "Update" is a text link in the editor header.
    cy.get("@reassignBox")
      .contains(/^\s*Update\s*$/)
      .click({ force: true });
    cy.wait(2500);
  }
}

export default new TodoWorkflowPage();
