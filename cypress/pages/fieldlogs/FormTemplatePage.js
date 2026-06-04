import { FORM_TEMPLATE, COMMON } from "../../support/selectors";

/**
 * FormTemplatePage — builds a Form Template inside the Project workspace
 * "Templates" tab.
 *
 * This is intentionally a standalone page object: the "create a form template"
 * flow is reused by several Field Operations use cases (Logs, Inspections,
 * etc.), so any spec can do:
 *
 *   import formTemplatePage from "../../../pages/fieldlogs/FormTemplatePage";
 *   formTemplatePage.createLogTemplate("Automation Log 20260604_120000");
 *
 * ...before switching to the Field Operations workspace.
 */
class FormTemplatePage {
  // ── Navigation ────────────────────────────────────────────────────────────

  /**
   * Click a top-nav item by its exact, visible label (e.g. "Templates").
   *
   * Each nav item is:
   *   <li.ant-menu-item id=GUID>
   *     <span.ant-menu-title-content>
   *       <a.main-menu-text-container href="/app/project/<section>/<id>">
   *         <i .icon-*></i><span>LABEL</span>
   *
   * The navigation lives on the <a.main-menu-text-container> (it has the href);
   * clicking the wrapping <li> or <span> only hovers. The id is a project-specific
   * GUID, so we match the anchor by its visible label text instead.
   */
  clickNavByText(label) {
    cy.wait(2000);
    cy.get("a.main-menu-text-container:visible", { timeout: 15000 })
      .filter((_i, el) => el.textContent.replace(/\s+/g, " ").trim() === label)
      .first()
      .click({ force: true });
    cy.wait(2000);
  }

  openTemplatesTab() {
    this.clickNavByText(FORM_TEMPLATE.templatesTabLabel);
    // Confirm the route switched to the Templates page, then let it settle.
    cy.url({ timeout: 15000 }).should("include", "/templates");
    cy.wait(2000);
  }

  clickNew() {
    // Several views can carry an .indexnewbtn; take the visible one.
    cy.get(FORM_TEMPLATE.newTemplateButton, { timeout: 20000 })
      .filter(":visible")
      .first()
      .should("be.visible")
      .click();
    // Form Template editor (#canvas) must be ready before dragging.
    cy.get(FORM_TEMPLATE.canvas, { timeout: 15000 }).should("be.visible");
    cy.wait(1500);
  }

  // ── Drag & drop building blocks ───────────────────────────────────────────

  /**
   * Drag a draggable side-panel item onto the editor canvas.
   * Angular CDK drag-drop is pointer driven, so we emit a mousedown on the
   * source, an intermediate mousemove (required to "start" the CDK drag), then
   * move to the canvas centre and release.
   */
  dragItemToCanvas(sourceSelector) {
    // Items lower in the side panel (e.g. Image) need scrolling into view first.
    cy.get(sourceSelector, { timeout: 15000 })
      .scrollIntoView()
      .should("be.visible");

    cy.get(FORM_TEMPLATE.canvas).then(($canvas) => {
      const rect = $canvas[0].getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;

      cy.get(sourceSelector).trigger("mousedown", {
        button: 0,
        which: 1,
        force: true,
      });

      // CDK needs movement before it recognises the drag has begun.
      cy.get("body")
        .trigger("mousemove", {
          clientX: targetX - 10,
          clientY: targetY - 10,
          force: true,
        })
        .trigger("mousemove", {
          clientX: targetX,
          clientY: targetY,
          force: true,
        });

      cy.get(FORM_TEMPLATE.canvas)
        .trigger("mousemove", {
          clientX: targetX,
          clientY: targetY,
          force: true,
        })
        .trigger("mouseup", { force: true });
    });

    cy.wait(1000);
  }

  dragLayout() {
    this.dragItemToCanvas(FORM_TEMPLATE.layoutItem);
  }

  dragChecklist() {
    this.dragItemToCanvas(FORM_TEMPLATE.checklistItem);
  }

  dragImage() {
    this.dragItemToCanvas(FORM_TEMPLATE.imageItem);
  }

  // ── Document settings ─────────────────────────────────────────────────────

  openDocumentSettings() {
    cy.get(FORM_TEMPLATE.documentSettingsButton).click();
    cy.wait(1000);
    cy.get(FORM_TEMPLATE.templateNameInput, { timeout: 10000 }).should(
      "be.visible"
    );
  }

  setTemplateName(name) {
    // {selectall}{backspace} instead of .clear() — the app treats a bare Delete
    // key as a shortcut elsewhere in the suite, so we avoid it by convention.
    cy.get(FORM_TEMPLATE.templateNameInput)
      .click()
      .type("{selectall}{backspace}")
      .type(name);
    cy.wait(500);
  }

  verifyTemplateName(name) {
    cy.get(FORM_TEMPLATE.templateNameInput).should("have.value", name);
  }

  /** Open the Type Tags dropdown and tick the given option (e.g. "Logs"). */
  selectTypeTag(optionLabel = FORM_TEMPLATE.typeTagsOptionLabel) {
    cy.get(FORM_TEMPLATE.typeTagsSelect).click();
    cy.wait(500);
    cy.get(COMMON.overlayVisibleList)
      .find("li")
      .contains(optionLabel)
      .click();
    cy.wait(500);
    this.closeOverlayDropdown();
  }

  /**
   * Dismiss an open CDK/Ant dropdown by clicking its transparent backdrop
   * (i.e. clicking "outside"). Force-clicking another element does NOT close it —
   * the lingering backdrop then blocks subsequent clicks. Falls back to Escape.
   */
  closeOverlayDropdown() {
    cy.get("body").then(($body) => {
      const $backdrop = $body.find(".cdk-overlay-backdrop");
      if ($backdrop.length) {
        cy.wrap($backdrop.last()).click({ force: true });
      } else {
        cy.get("body").type("{esc}");
      }
    });
    // Ensure the overlay is fully gone before moving on.
    cy.get(".cdk-overlay-backdrop", { timeout: 10000 }).should("not.exist");
    cy.wait(300);
  }

  // ── Composite flow ────────────────────────────────────────────────────────

  /**
   * End-to-end Form Template creation used as a precondition by Field Logs
   * specs. Assumes the project is already open in the Project workspace.
   */
  createLogTemplate(name, { typeTag = FORM_TEMPLATE.typeTagsOptionLabel } = {}) {
    this.openTemplatesTab();
    this.clickNew();
    this.dragLayout();
    this.dragChecklist();
    this.dragImage();
    this.openDocumentSettings();
    this.setTemplateName(name);
    this.selectTypeTag(typeTag);
  }
}

export default new FormTemplatePage();
