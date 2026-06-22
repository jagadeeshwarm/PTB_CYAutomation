import { EMS_DRAWING, EMS_SYSTEM } from "../../support/selectors";

/**
 * EmsDrawingPage — Element Management > Building Models > Drawing module.
 *
 * Covers: navigate to Drawing, add a folder, upload a drawing, view it, tag an
 * element on it (via the Model node's Tags tab), and verify Annotation History +
 * downloads.
 *
 * Module switching reuses EMS_SYSTEM.moduleTab (Model=0, System=1, Drawing=2).
 * Tree click semantics follow the EMS rules: click the per-row
 * .cmacs-context-menu-overlay, never the title span.
 */
class EmsDrawingPage {
  // ── Module navigation ───────────────────────────────────────────────────────

  switchModule(index) {
    cy.get(EMS_SYSTEM.moduleTab, { timeout: 15000 }).eq(index).click();
    cy.wait(2000);
  }

  goToDrawingModule() {
    this.switchModule(2);
    cy.get(EMS_DRAWING.addButton, { timeout: 20000 }).should("exist");
  }

  goToModelModule() {
    this.switchModule(0);
  }

  // ── Tree helpers ────────────────────────────────────────────────────────────

  getNodeByName(name) {
    return cy
      .get(`${EMS_DRAWING.tree} ${EMS_DRAWING.treeNode}`, { timeout: 15000 })
      .filter((_i, node) => {
        const own = Cypress.$(node)
          .children("li")
          .children("div")
          .find(EMS_DRAWING.treeNodeTitle)
          .first()
          .text()
          .trim();
        return own === name;
      });
  }

  clickNodeByName(name) {
    this.getNodeByName(name)
      .first()
      .find(EMS_DRAWING.nodeContextOverlay)
      .first()
      .scrollIntoView()
      .click();
    cy.wait(1500);
  }

  // ── Add folder ──────────────────────────────────────────────────────────────

  /** Click '+' then an item by text ("Add Folder" / "Add Drawing"). */
  clickAddMenuItem(itemText) {
    cy.get(EMS_DRAWING.addButton).first().click();
    cy.wait(800);
    // This menu is clipped (Cypress sees the <ul> as not visible) AND the "New"
    // tooltip overlaps the first item, so neither a real click (covered) nor a
    // force click (only hovers cmacs menu items) works. Fire a native DOM click
    // on the item — it dispatches the real click event the handler listens for,
    // bypassing visibility/coverage without being a hover.
    cy.get(EMS_DRAWING.addMenu, { timeout: 10000 })
      .filter((_i, ul) => ul.textContent.includes(itemText))
      .last()
      .find("li")
      .filter((_i, li) => li.textContent.trim() === itemText)
      .first()
      .then(($li) => {
        // The handler sits on the inner <a> (item is <li><a><span>text</span>).
        // Clicking the <li> wouldn't reach it (events bubble up, not down), so
        // fire on the deepest clickable element.
        const el = $li[0].querySelector("a") || $li[0];
        el.click();
      });
    cy.wait(2000);
  }

  addFolder() {
    this.clickAddMenuItem("Add Folder");
  }

  // ── Upload drawing (right-click folder → Upload Drawing) ─────────────────────

  uploadDrawingToFolder(folderName, fixtureRelativePath) {
    this.getNodeByName(folderName)
      .first()
      .find(EMS_DRAWING.nodeContextOverlay)
      .first()
      .scrollIntoView()
      .rightclick();
    cy.wait(800);
    cy.get(EMS_DRAWING.drawingContextMenu, { timeout: 10000 })
      .find("li")
      .filter((_i, li) => li.textContent.trim().includes("Upload Drawing"))
      .first()
      .click();
    cy.wait(800);
    // ⚠ NEEDS-VERIFICATION: feed the fixture into the upload input.
    cy.get(EMS_DRAWING.fileInput)
      .last()
      .selectFile(`cypress/fixtures/${fixtureRelativePath}`, { force: true });
    cy.wait(8000);
  }

  /**
   * Open the folder, find the drawing inside it, click it, and wait for the PDF
   * viewer to render. After upload the folder needs a click to open before its
   * child drawing is available; the viewer then shows "Loading document… 0%"
   * for a while, so allow a long timeout for canvas.upper-canvas to appear.
   */
  openFirstDrawingUnderFolder(folderName) {
    // GetAnnotations fires when a drawing opens — a viewer-agnostic "rendered"
    // signal (the canvas lives in a shadow root and may not be reliably found).
    cy.intercept("GET", "**/annotation/GetAnnotations/**").as("drawingOpened");
    // Expand the folder via its switcher (only if currently collapsed).
    this.getNodeByName(folderName)
      .first()
      .find(EMS_DRAWING.treeSwitcher)
      .first()
      .then(($sw) => {
        if ($sw.hasClass("ant-tree-switcher_close")) {
          cy.wrap($sw).click({ force: true });
          cy.wait(1500);
        }
      });
    // Find the first drawing child, then click it.
    this.getNodeByName(folderName)
      .first()
      .find(
        `ul[role='group'] ${EMS_DRAWING.treeNode} ${EMS_DRAWING.treeNodeTitle}`
      )
      .first()
      .invoke("text")
      .then((t) => {
        this.clickNodeByName(t.trim());
      });
    // Confirm the drawing opened via its annotations request, then let the
    // viewer finish rendering.
    cy.wait("@drawingOpened", { timeout: 60000 });
    cy.wait(4000);
  }

  /** The name of the first drawing-file child under a folder. */
  getFirstDrawingFileName(folderName) {
    return this.getNodeByName(folderName)
      .first()
      .find(`ul[role='group'] ${EMS_DRAWING.treeNode} ${EMS_DRAWING.treeNodeTitle}`)
      .first()
      .invoke("text")
      .then((t) => t.trim());
  }

  verifyDrawingVisible() {
    cy.get(EMS_DRAWING.canvas, { timeout: 60000 }).should(
      "have.length.greaterThan",
      0
    );
  }

  // ── Tags (on the Model node) ────────────────────────────────────────────────

  /** Click "Add Tag" (clipped card-meta title → force), then click the drawing. */
  addTagOnDrawing() {
    // The tag is persisted via Annotation/Create — the reliable "tag added"
    // signal (the Tags grid in this view doesn't populate).
    cy.intercept("POST", "**/Annotation/Create*").as("tagCreated");
    cy.get(EMS_DRAWING.addTagLink, { timeout: 15000 })
      .filter((_i, el) => el.textContent.trim().includes(EMS_DRAWING.addTagText))
      .first()
      .scrollIntoView()
      .click({ force: true });
    cy.wait(1500);
    // Click the centre of the visible drawing canvas to drop the tag on an
    // object (the top/last visible canvas is the annotation layer).
    cy.get(EMS_DRAWING.canvas, { timeout: 20000 })
      .filter(":visible")
      .last()
      .then(($c) => {
        const r = $c[0].getBoundingClientRect();
        cy.wrap($c).click(r.width / 2, r.height / 2, { force: true });
      });
    cy.wait(2500);
  }

  /** Confirm the tag persisted via the Annotation/Create request. */
  verifyTagCreated() {
    cy.wait("@tagCreated", { timeout: 20000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 201]);
  }

  // ── Annotation History (Drawing side menu) ──────────────────────────────────

  openAnnotationHistory() {
    // The side menu may need expanding via the down chevron to reveal History.
    cy.get("body").then(($b) => {
      if ($b.find(`${EMS_DRAWING.sideMenuChevronDown}:visible`).length) {
        cy.get(EMS_DRAWING.sideMenuChevronDown).first().click();
        cy.wait(800);
      }
    });
    cy.get(EMS_DRAWING.historyIcon, { timeout: 15000 })
      .first()
      .parents("li")
      .first()
      .click();
    cy.get(EMS_DRAWING.annotationModal, { timeout: 10000 }).should(
      "be.visible"
    );
    cy.wait(1500);
  }

  /**
   * Assert the Annotation History table lists the tag(s) added. The tag's Text
   * column holds the element's internal id ("Element_1"), NOT the Node Name, so
   * we verify the row count rather than the Schuco name. This EMS is fresh, so
   * any rows here are the tags created in this run.
   */
  verifyAnnotationHistoryHasRows() {
    cy.get(EMS_DRAWING.annotationRow, { timeout: 15000 }).should(
      "have.length.greaterThan",
      0
    );
  }

  saveAnnotationHistory() {
    cy.get(EMS_DRAWING.annotationSaveBtn).filter(":visible").first().click();
    // Many empty <cmacs-modal> wrappers persist in the DOM, so assert the modal
    // CONTENT (the "Annotation History" title) is gone, not the wrapper.
    cy.contains(".ant-modal-title", "Annotation History", {
      timeout: 15000,
    }).should("not.exist");
    cy.wait(1000);
  }

  // ── Downloads ───────────────────────────────────────────────────────────────

  /** Open the Downloads panel — idempotent (clicking the icon again would
   *  toggle it closed, so only click when the panel isn't already open). */
  openDownloadsPanel() {
    cy.get("body").then(($b) => {
      if (!$b.find(`${EMS_DRAWING.downloadLink}:visible`).length) {
        cy.get(EMS_DRAWING.downloadIcon, { timeout: 15000 })
          .first()
          .parents("li")
          .first()
          .click();
        cy.wait(1200);
      }
    });
    cy.get(EMS_DRAWING.downloadLink, { timeout: 10000 }).should(
      "have.length.greaterThan",
      0
    );
  }

  clickDownloadLink(text) {
    cy.get(EMS_DRAWING.downloadLink, { timeout: 10000 })
      .filter((_i, a) => a.textContent.trim().includes(text))
      .first()
      .click();
    cy.wait(2000);
  }

  /** Confirm the "Download With Annotations" modal (Download button). */
  confirmDownloadModal() {
    cy.get(EMS_DRAWING.downloadModalConfirmBtn, { timeout: 10000 })
      .filter(":visible")
      .first()
      .click();
    cy.wait(1500);
  }
}

export default new EmsDrawingPage();
