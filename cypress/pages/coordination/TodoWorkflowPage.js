import { TODO_WORKFLOW, TODO_STATUS_KEY, COMMON } from "../../support/selectors";
import { addDays } from "../../support/utils/dateUtils";

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
    // AntD cells carry title="M/D/YYYY" (non-padded), which uniquely identifies
    // the day. Matching on bare day-number text is ambiguous: adjacent-month
    // overflow cells (e.g. a disabled "30" from the previous month) share the
    // same number and, being first in DOM order, get clicked — but they're
    // ant-picker-cell-disabled (pointer-events:none) and the click fails.
    const d = addDays(offsetDays);
    const title = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

    cy.get(TODO_WORKFLOW.datePopupTable, { timeout: 10000 })
      .filter(":visible")
      .first()
      .within(() => {
        cy.get(`td[title="${title}"]`)
          .not(".ant-picker-cell-disabled")
          .filter(":visible")
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

  /**
   * Minimal create flow per the side-panel/filter/export use case: only Title +
   * Assigned-To, then Create. (The richer createTodo() fills every field.)
   */
  createTodoMinimal(title) {
    this.clickNewTodo();
    this.enterTitle(title);
    this.selectAssignedUser();
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

  // ── Side panel tab navigation ─────────────────────────────────────────────

  /** Click a top-level side-panel tab by its label ("Overview" / "Essentials"). */
  clickTopTab(tabText) {
    cy.get(`${TODO_WORKFLOW.sidePanel} .ant-tabs-tab`, { timeout: 10000 })
      .filter((_i, t) => t.textContent.trim() === tabText)
      .first()
      .click({ force: true });
    cy.wait(800);
  }

  /** Activate the top-level "Essentials" tab in the open side panel. */
  ensureEssentialsTab() {
    cy.get(TODO_WORKFLOW.sidePanel, { timeout: 10000 }).should("be.visible");
    this.clickTopTab(TODO_WORKFLOW.essentialsTabText);
  }

  /**
   * Click an icon-only sub-tab under Essentials by index:
   * 0 = Summary, 1 = Comments, 2 = Attachment, 3 = History.
   */
  clickEssentialsIconTab(index) {
    cy.get(TODO_WORKFLOW.essentialsIconTabs, { timeout: 10000 })
      .eq(index)
      .click({ force: true });
    cy.wait(1000);
  }

  // ── Side-panel Title rename ───────────────────────────────────────────────

  /**
   * On the Essentials > Summary sub-tab, locate the Title field by its CURRENT
   * value (robust against structural churn), clear it, and type a new value.
   * Uses {selectall}{backspace} rather than .clear() — per coding-conventions
   * the Delete key triggers a global delete shortcut in this app.
   */
  renameTitleInSidePanel(oldTitle, newTitle) {
    this.ensureEssentialsTab();
    this.clickEssentialsIconTab(0); // Summary holds the Title field
    cy.get(TODO_WORKFLOW.sidePanelEditableFields, { timeout: 10000 })
      .filter((_i, el) => (el.value || "").trim() === oldTitle)
      .first()
      .scrollIntoView()
      .click()
      .type("{selectall}{backspace}")
      .type(newTitle)
      .blur();
    cy.wait(1500);
  }

  /** Assert the side panel reflects the new title (input value or text). */
  verifyTitleInSidePanel(newTitle) {
    cy.get(TODO_WORKFLOW.sidePanel, { timeout: 10000 }).should(($panel) => {
      const hasInputValue = $panel
        .find("input, textarea")
        .toArray()
        .some((el) => (el.value || "").trim() === newTitle);
      const hasText = $panel.text().includes(newTitle);
      expect(hasInputValue || hasText, "title updated to new value").to.be.true;
    });
  }

  // ── Comments ──────────────────────────────────────────────────────────────

  /**
   * On the Essentials > Comments sub-tab: reveal the editor with "Add Comment"
   * (if collapsed), type into the TinyMCE iframe body, and submit with "Add".
   */
  addComment(text) {
    this.ensureEssentialsTab();
    this.clickEssentialsIconTab(1); // Comments

    // The form may start collapsed behind an "Add Comment" button; click it if
    // present, otherwise the TinyMCE editor is already shown.
    cy.get("body").then(($body) => {
      const $addCommentBtn = Cypress.$(TODO_WORKFLOW.commentForm)
        .find("button")
        .toArray()
        .find((b) =>
          b.textContent
            .trim()
            .toLowerCase()
            .includes(TODO_WORKFLOW.addCommentButtonText.toLowerCase())
        );
      if ($addCommentBtn) {
        cy.wrap($addCommentBtn).click({ force: true });
        cy.wait(800);
      }
    });

    // Type into the TinyMCE editor — its contenteditable <body> lives in an
    // iframe, so reach the iframe document and wrap its body.
    cy.get(TODO_WORKFLOW.commentEditorIframe, { timeout: 10000 })
      .should("exist")
      .then(($iframe) => {
        const doc = $iframe[0].contentDocument;
        const body = doc.body;
        cy.wrap(body).click().type(text, { force: true });
      });
    cy.wait(500);

    // Submit with the primary "Add" button in the comment form.
    cy.get(TODO_WORKFLOW.commentAddButton, { timeout: 10000 })
      .filter(":visible")
      .first()
      .click({ force: true });
    cy.wait(2000);
  }

  /** Assert the just-added comment text is rendered in the comments list. */
  verifyCommentAdded(text) {
    cy.get(TODO_WORKFLOW.commentsContainer, { timeout: 10000 }).should(
      "contain.text",
      text
    );
  }

  // ── Attachments ───────────────────────────────────────────────────────────

  /**
   * On the Essentials > Attachment sub-tab: click "Upload Files" and feed the
   * fixture into the hidden file input (file inputs are always hidden → force,
   * never filter :visible).
   */
  uploadAttachment(fixturePath) {
    this.ensureEssentialsTab();
    this.clickEssentialsIconTab(2); // Attachment

    cy.get(TODO_WORKFLOW.sidePanel)
      .contains("button, a", TODO_WORKFLOW.uploadFilesButtonText)
      .filter(":visible")
      .first()
      .click({ force: true });
    cy.wait(800);

    cy.get(TODO_WORKFLOW.attachmentFileInput)
      .last()
      .selectFile(`cypress/fixtures/${fixturePath}`, { force: true });
    cy.wait(5000);
  }

  /** Assert the uploaded file's name appears in the side panel. */
  verifyAttachmentUploaded(fileName) {
    cy.get(TODO_WORKFLOW.sidePanel, { timeout: 15000 }).should(
      "contain.text",
      fileName
    );
  }

  // ── Smart filter — "Created by me" ────────────────────────────────────────

  /**
   * Open the board's "Smart" filter dropdown and tick the "Created by me" item.
   *
   * The dropdown opens via the "Smart" label trigger (the provided `ul` is not
   * the trigger). Its menu items live in a cdk overlay and are COVERED, so they
   * need REAL clicks — a forced click only registers as hover (see the dropdown
   * rule in ems-module-gotchas).
   */
  filterByCreatedByMe() {
    // Open the menu by clicking the "Smart" trigger button in the toolbar.
    cy.get(TODO_WORKFLOW.smartFilterControl, { timeout: 15000 })
      .filter(":visible")
      .first()
      .click()
      // The "Smart" cmacs-tooltip lingers over the first menu item; move the
      // mouse off the trigger so the tooltip disappears and the item is clickable.
      .trigger("mouseout")
      .trigger("mouseleave");
    cy.get("body").trigger("mousemove", { clientX: 5, clientY: 5 });
    cy.wait(1000);

    // Real click on the "Created by me" row. The menu renders INLINE (not in a
    // cdk overlay), so target .smart-dropdown-content. cy.contains finds the
    // deepest node holding the text (the checkbox label's <span>); "Created by
    // me" is unique to this item.
    cy.get(TODO_WORKFLOW.smartFilterMenu, { timeout: 10000 })
      .contains(TODO_WORKFLOW.smartFilterCreatedByMeText)
      .click();
    cy.wait(2000);

    // Close the inline dropdown by toggling its own trigger (do NOT click a
    // blind corner like 0,0 — that opens the workspace nav, which then covers
    // the board cards).
    cy.get(TODO_WORKFLOW.smartFilterControl)
      .filter(":visible")
      .first()
      .click()
      .trigger("mouseout")
      .trigger("mouseleave");
    cy.wait(1000);
  }

  /** Open the side panel of the first card shown after filtering. */
  openFirstCard() {
    // Click the card's title <p> (a stable inner target) rather than the card
    // div, whose centre can be occupied by a child span.
    cy.get(TODO_WORKFLOW.card, { timeout: 15000 })
      .filter(":visible")
      .first()
      .find("p")
      .first()
      .click();
    cy.get(TODO_WORKFLOW.sidePanel, { timeout: 10000 }).should("be.visible");
    cy.wait(1000);
  }

  /**
   * Verify the "Created By" field shows a human NAME (not a user id or email).
   * The field is searched on the Overview tab first, then the Essentials >
   * Summary sub-tab, since its exact location can vary.
   */
  verifyCreatedByIsName(expectedName) {
    cy.get(TODO_WORKFLOW.sidePanel, { timeout: 10000 }).should("be.visible");

    // Look on Overview first.
    this.clickTopTab(TODO_WORKFLOW.overviewTabText);
    cy.get(TODO_WORKFLOW.sidePanel).then(($panel) => {
      if (/created\s*by/i.test($panel.text())) {
        this._assertCreatedBy($panel, expectedName);
      } else {
        // Fall back to Essentials > Summary.
        this.ensureEssentialsTab();
        this.clickEssentialsIconTab(0);
        cy.get(TODO_WORKFLOW.sidePanel).then(($panel2) =>
          this._assertCreatedBy($panel2, expectedName)
        );
      }
    });
  }

  /** Locate the "Created By" label leaf, read its value, assert it is a name. */
  _assertCreatedBy($panel, expectedName) {
    const leaf = $panel
      .find("*")
      .toArray()
      .find(
        (el) => el.childElementCount === 0 && /created\s*by/i.test(el.textContent)
      );
    expect(leaf, "Created By label present in side panel").to.exist;

    const labelText = leaf.textContent.trim();
    // Climb until the container carries text beyond the label itself (the value).
    let container = leaf.parentElement;
    let value = "";
    let guard = 0;
    while (container && guard < 5) {
      value = container.textContent.replace(labelText, "").replace(/\s+/g, " ").trim();
      if (value) break;
      container = container.parentElement;
      guard += 1;
    }

    expect(value, "Created By is not empty").to.not.be.empty;
    expect(value, "Created By is a name, not an email").to.not.contain("@");
    expect(value, "Created By contains letters (a name)").to.match(/[A-Za-z]/);
    if (expectedName) {
      expect(value.toLowerCase()).to.contain(expectedName.toLowerCase());
    }
    cy.log(`Created By = "${value}"`);
  }

  // ── Export (Excel / PDF) ──────────────────────────────────────────────────

  /**
   * Click the board's 3-dots menu, choose "Export Excel" (REAL click — overlay
   * items are covered and ignore forced clicks), then poll the downloads folder
   * until a NEW .xlsx appears.
   */
  exportExcelAndVerify() {
    this._exportAndVerify(TODO_WORKFLOW.exportExcelText, ".xlsx");
  }

  exportPdfAndVerify() {
    this._exportAndVerify(TODO_WORKFLOW.exportPdfText, ".pdf");
  }

  /**
   * Open the board's 3-dots menu, click the given export option (REAL click —
   * overlay items are covered and ignore forced clicks), then poll the downloads
   * folder until a fresher file of `ext` appears. The export overwrites a fixed
   * filename, so freshness is detected by mtime, not by a new path.
   */
  _exportAndVerify(optionText, ext) {
    const downloads = Cypress.config("downloadsFolder");

    cy.task("latestFileMtime", { dir: downloads, ext }).then((beforeMtime) => {
      cy.get(TODO_WORKFLOW.moreOptionsButton, { timeout: 15000 })
        .filter(":visible")
        .first()
        .click();
      cy.wait(800);

      cy.get(`${COMMON.overlayContainer} ul:visible`, { timeout: 10000 })
        .contains("li", optionText)
        .click();

      // Downloads can take a moment — poll a few times for a fresher file.
      this._waitForNewDownload(downloads, ext, beforeMtime, 8);
    });
  }

  /** Recursively poll until the newest file of `ext` is fresher than before. */
  _waitForNewDownload(downloads, ext, beforeMtime, attemptsLeft) {
    cy.wait(1500);
    cy.task("latestFileMtime", { dir: downloads, ext }).then((afterMtime) => {
      const isNew =
        afterMtime !== null &&
        (beforeMtime === null || afterMtime > beforeMtime);
      if (isNew || attemptsLeft <= 0) {
        expect(isNew, `a new ${ext} was downloaded`).to.be.true;
      } else {
        this._waitForNewDownload(downloads, ext, beforeMtime, attemptsLeft - 1);
      }
    });
  }
}

export default new TodoWorkflowPage();
