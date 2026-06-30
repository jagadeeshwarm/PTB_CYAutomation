import { EMS_BATCH, EMS_MODEL, EMS_SYSTEM, COMMON } from "../../support/selectors";

/**
 * EmsBatchPage — Element Management > Building Models > Batch module, plus the
 * cross-module Tracking page (app-element-status-root / app-qc-index-grid)
 * reached from the top header navigation.
 *
 * Module switching reuses EMS_SYSTEM.moduleTab (Model=0, System=1, Drawing=2,
 * Batch=3, Ticket=4). The bottom-pane Batch Properties tabset reuses
 * EMS_MODEL.topTabBtn (same bottom-pane-tab-custom tabset as Model).
 *
 * Click semantics follow the EMS rules (see ems_module_gotchas memory):
 *  - card-meta action links (Attach Elements) are CSS-clipped → force-click.
 *  - dropdown menu items: real click (force only hovers cmacs dropdown items).
 *  - tree row checkboxes: click the .ant-tree-checkbox span wrapper directly.
 */
class EmsBatchPage {
  // ── Module navigation ───────────────────────────────────────────────────────

  switchModule(index) {
    cy.get(EMS_SYSTEM.moduleTab, { timeout: 15000 }).eq(index).click();
    cy.wait(2000);
  }

  goToBatchModule() {
    this.switchModule(3);
    cy.get(EMS_BATCH.batchNewButton, { timeout: 20000 })
      .filter(":visible")
      .should("have.length.greaterThan", 0);
  }

  // ── Header navigation (Tracking) ────────────────────────────────────────────

  /** Click the "Tracking" top-nav link (sibling of Building Models). */
  goToTrackingPage() {
    cy.get("a.main-menu-text-container:visible", { timeout: 15000 })
      .filter(
        (_i, el) =>
          el.textContent.replace(/\s+/g, " ").trim() ===
          EMS_BATCH.trackingNavLabel
      )
      .first()
      .click();
    cy.wait(2500);
    cy.get("app-element-status-root", { timeout: 20000 }).should("be.visible");
  }

  // ── Create / select a Batch ────────────────────────────────────────────────

  /** Click the '+' (New) button in the Batch panel header to create a batch. */
  createBatch() {
    cy.get(EMS_BATCH.batchNewButton, { timeout: 15000 })
      .filter(":visible")
      .first()
      .click();
    cy.wait(2500);
  }

  /**
   * Click the most recently created batch in the Batch list. The list isn't an
   * ant-table — match items by the auto-generated "Batch_N" name. The name
   * span is covered by a sibling .cmacs-context-menu-overlay div that captures
   * pointer events (same pattern as the Model tree), so click that overlay
   * from the matched row, not the span itself.
   */
  selectLastBatchRow() {
    cy.get(EMS_BATCH.batchListContainer, { timeout: 15000 })
      .contains(EMS_BATCH.batchNameRegex)
      .last()
      .parents(":has(.cmacs-context-menu-overlay)")
      .first()
      .find(".cmacs-context-menu-overlay")
      .first()
      .scrollIntoView()
      .click();
    cy.wait(1500);
  }

  /** Assert at least one batch exists in the list. */
  verifyBatchExists() {
    cy.get(EMS_BATCH.batchListContainer, { timeout: 15000 })
      .contains(EMS_BATCH.batchNameRegex)
      .should("be.visible");
  }

  // ── Batch Properties: Elements tab ─────────────────────────────────────────

  openElementsTab() {
    cy.get(EMS_MODEL.topTabBtn, { timeout: 15000 })
      .filter((_i, t) => t.textContent.trim() === EMS_BATCH.elementsTabLabel)
      .first()
      .scrollIntoView()
      .click();
    cy.wait(1500);
  }

  /** Click "Attach Elements" — clipped card-meta title, force-click. */
  clickAttachElements() {
    cy.get(EMS_BATCH.elementsCardMetaTitle, { timeout: 15000 })
      .filter((_i, el) =>
        el.textContent.trim().includes(EMS_BATCH.attachElementsText)
      )
      .first()
      .scrollIntoView()
      .click({ force: true });
    cy.get(EMS_BATCH.attachModal, { timeout: 10000 })
      .filter(":visible")
      .should("have.length.greaterThan", 0);
    cy.wait(1500);
  }

  /** Tick every visible tree-node checkbox in the Attach EMS Nodes modal. */
  selectAllAttachNodes() {
    cy.get(EMS_BATCH.attachNodeCheckbox, { timeout: 15000 })
      .filter(":visible")
      .each(($cb) => {
        // Skip already-checked rows so we don't accidentally untick them.
        if (!$cb.hasClass("ant-tree-checkbox-checked")) {
          cy.wrap($cb).click();
          cy.wait(200);
        }
      });
    cy.wait(500);
  }

  /** Click the modal's primary footer button ("Attach EMS Nodes"). */
  confirmAttach() {
    cy.get(EMS_BATCH.attachConfirmBtn, { timeout: 10000 })
      .filter(":visible")
      .first()
      .click();
    cy.wait(3500);
  }

  /** Assert at least `count` element rows are visible in the panel. */
  verifyAttachedElementCount(count) {
    cy.get(EMS_BATCH.batchElementsRow, { timeout: 15000 }).should(
      "have.length.greaterThan",
      count - 1
    );
  }

  // ── Status dropdown (1st element row) ──────────────────────────────────────

  /**
   * Open the BatchStatus dropdown of the Nth element row (0-indexed) and pick
   * a value by text. Per the spec note ("Single will not work, click two
   * times"), manually the cell highlights on the first click, then opens its
   * editor on the second.
   *
   * Cypress's .click({force:true}) doesn't always dispatch the full mouse
   * event sequence (mousedown → mouseup → click) that the cmacs editable cell
   * listens for, so we fire those events explicitly AND fire a native DOM
   * click on the underlying element. This matches a real mouse interaction
   * closely enough that the second click reliably opens the dropdown.
   */
  setElementStatus(index, status) {
    // Filter to rows that actually contain a BatchStatus cell (nz-table can
    // render measure / fixed-column duplicate rows that also match
    // `tbody tr.ant-table-row`), then click the cell's inner div — the
    // element the cmacs editable handler is bound to.
    //
    // Per the spec: 1st click highlights the cell, 2nd click opens the
    // dropdown. Plain Cypress .click() (no force) goes through actionability
    // and dispatches a full event sequence; that's all the cell needs.
    const getStatusCell = () =>
      cy
        .get(EMS_BATCH.batchElementsRow, { timeout: 15000 })
        .filter(`:has(${EMS_BATCH.batchStatusCell})`)
        .eq(index)
        .find(EMS_BATCH.batchStatusCellInner)
        .first();

    getStatusCell().scrollIntoView().click(); // 1st: highlight
    cy.wait(1000);
    getStatusCell().click(); // 2nd: open dropdown
    cy.wait(1000);

    cy.get(`${COMMON.overlayContainer} li:visible`, { timeout: 10000 })
      .filter((_i, li) => li.textContent.trim() === status)
      .first()
      .click();
    cy.wait(1500);
  }

  // ── Tracking page (Model tab + Batch tab) ──────────────────────────────────

  /** Switch the Tracking page top tabset by visible label (Model / Batch). */
  switchTrackingTab(label) {
    cy.get(EMS_BATCH.trackingTabBtn, { timeout: 15000 })
      .filter((_i, t) => t.textContent.trim() === label)
      .first()
      .scrollIntoView()
      .click();
    cy.wait(2000);
  }

  /** Tick the first-column checkbox of the Nth row in the active Tracking pane. */
  checkTrackingRow(index = 0) {
    cy.get(EMS_BATCH.trackingRowCheckbox, { timeout: 15000 })
      .eq(index)
      .scrollIntoView()
      .click({ force: true });
    cy.wait(600);
  }

  /**
   * Select every element row in the active Tracking pane.
   *
   * Clicking the visible Group row's checkbox selects the group node and all
   * its descendants in one shot. Click .ant-checkbox-inner (the visible
   * square) so ng-zorro's handler fires exactly once with no double-toggle.
   * Downstream steps (QR popup with "Selected: N") confirm the selection
   * stuck, so no explicit post-click assertion is needed here.
   */
  checkAllTrackingRows() {
    // Idempotent: Step 7 already selected the Group row (cascading to its
    // children), and that selection survives Step 8's template-save. Clicking
    // again here would TOGGLE IT OFF, leaving the QR button disabled in Step
    // 10. Only click when the checkbox isn't already in the checked state.
    cy.get(EMS_BATCH.trackingRowCheckbox, { timeout: 15000 })
      .first()
      .scrollIntoView()
      .parents(".ant-checkbox")
      .first()
      .then(($cb) => {
        if (!$cb.hasClass("ant-checkbox-checked")) {
          cy.wrap($cb).find(".ant-checkbox-inner").click({ force: true });
        }
      });
    cy.wait(1200);
  }

  /**
   * Expand every collapsed group row in the active Tracking pane. Class names
   * for the chevron vary (ant vs cmacs), so try a few; skip silently if none
   * are present (already expanded, or pane has no groups).
   */
  expandAllTrackingGroups() {
    const expandSelectors = [
      "app-qc-index-grid .qc-tabset .ant-tabs-tabpane-active tbody .ant-table-row-expand-icon-collapsed",
      "app-qc-index-grid .qc-tabset .ant-tabs-tabpane-active tbody .ant-tree-switcher_close",
      "app-qc-index-grid .qc-tabset .ant-tabs-tabpane-active tbody [class*='expand-icon']:not([class*='expanded'])",
    ].join(", ");
    cy.get("body").then(($body) => {
      const $icons = $body.find(expandSelectors).filter(":visible");
      if (!$icons.length) return;
      cy.wrap($icons).each(($i) => {
        cy.wrap($i).click({ force: true });
        cy.wait(400);
      });
    });
  }

  clickImportTemplate() {
    cy.get(EMS_BATCH.trackingImportTemplateButton, { timeout: 15000 })
      .filter(":visible")
      .first()
      .click();
    cy.get(COMMON.modal, { timeout: 10000 }).should("be.visible");
    cy.wait(1500);
  }

  clickQrScanner() {
    cy.get(EMS_BATCH.trackingQrButton, { timeout: 15000 })
      .filter(":visible")
      .first()
      .click();
    cy.get(EMS_BATCH.qrPagesetup, { timeout: 15000 }).should("be.visible");
    cy.wait(2000);
  }

  // ── Tracking Templates picker (opened by Import Template) ──────────────────

  selectFirstTemplateAndSave() {
    cy.get(EMS_BATCH.templatePickerCheckbox, { timeout: 15000 })
      .filter(":visible")
      .first()
      .scrollIntoView()
      .click();
    cy.wait(700);
    cy.get(EMS_BATCH.templatePickerSaveBtn, { timeout: 10000 })
      .filter(":visible")
      .first()
      .click();
    cy.wait(3000);
  }

  /**
   * Assert at least one row's Tracking Templates cell is non-empty. The td
   * class name varies across releases, so resolve the column by header text
   * ("Tracking Templates") and pick the same-index cell on each data row.
   */
  verifyTrackingTemplateAttached() {
    cy.get(EMS_BATCH.trackingActivePane, { timeout: 20000 })
      .find("thead th")
      .then(($ths) => {
        const idx = [...$ths].findIndex((th) =>
          th.textContent
            .trim()
            .toLowerCase()
            .includes(EMS_BATCH.trackingTemplateColumnHeader.toLowerCase())
        );
        expect(idx, "Tracking Templates column exists").to.be.greaterThan(-1);
        cy.get(EMS_BATCH.trackingRow, { timeout: 20000 })
          .first()
          .find("td")
          .eq(idx)
          .invoke("text")
          .then((t) =>
            expect(t.trim().length, "Tracking Templates cell is non-empty").to.be
              .greaterThan(0)
          );
      });
  }

  // ── QR Code screen ─────────────────────────────────────────────────────────

  /**
   * Open the "Select Template" dropdown and pick the second option. The first
   * option in this list is iof20, which fails downstream PDF generation — pick
   * the second template instead. Falls back to the first if only one exists.
   */
  pickQrTemplate() {
    cy.get(EMS_BATCH.qrSelectTemplateTrigger, { timeout: 15000 })
      .filter(":visible")
      .first()
      .scrollIntoView()
      .click();
    cy.wait(900);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .filter(":visible")
      .then(($lis) => {
        const items = [...$lis].filter(
          (li) => li.textContent.trim().length > 0 && !li.querySelector("input")
        );
        const pick = items[1] || items[0];
        cy.wrap(pick).click();
      });
    cy.wait(700);
  }

  /**
   * Replace the Template Title field's value with a fresh name. Picking an
   * existing template prefills its name — saving without changing it would
   * overwrite that template, so the spec must call this to fork a new one.
   */
  setQrTemplateName(name) {
    cy.get(EMS_BATCH.qrTemplateNameInput, { timeout: 15000 })
      .filter(":visible")
      .first()
      .scrollIntoView()
      .clear()
      .type(name);
    cy.wait(500);
  }

  clickQrTemplateSave() {
    cy.get(EMS_BATCH.qrTemplateSaveBtn, { timeout: 10000 })
      .filter(":visible")
      .first()
      .click();
    cy.wait(2000);
  }

  /**
   * After the sidebar Save click, the app pops a "Save to Project" confirm —
   * commit it. Match by visible button text so the click survives the
   * varying nz-modal / cmacs-modal wrappers across releases.
   */
  clickSaveToProject() {
    cy.contains("button", /Save\s*(to\s*)?Project/i, { timeout: 15000 })
      .filter(":visible")
      .first()
      .click();
    cy.wait(2000);
  }

  /**
   * Click the "Print QR Codes" icon (top-right of the QR Code screen). The
   * button calls window.print(). Tests should stub window.print BEFORE
   * calling this so the native dialog never appears, then assert the stub
   * was invoked.
   */
  clickQrPrint() {
    cy.get(EMS_BATCH.qrPrintButton, { timeout: 15000 })
      .filter(":visible")
      .first()
      .scrollIntoView()
      .click();
    cy.wait(1500);
  }

  /** Close the QR Code full-size popup via the X icon in the header. */
  closeQrPopup() {
    cy.get(EMS_BATCH.qrCloseButton, { timeout: 15000 })
      .filter(":visible")
      .first()
      .click();
    cy.get(EMS_BATCH.qrPagesetup).should("not.exist");
    cy.wait(1500);
  }
}

export default new EmsBatchPage();
