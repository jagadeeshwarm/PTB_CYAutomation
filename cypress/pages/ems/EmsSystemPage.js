import { EMS_SYSTEM, EMS_MODEL, COMMON } from "../../support/selectors";

/**
 * EmsSystemPage — Element Management > Building Models > System module.
 *
 * Covers: create a System, add a Sub-System, edit System Properties (General,
 * Articles incl. Edit Article wizard + Export Excel, Cost, Tracking Templates,
 * Elements, Document).
 *
 * Reuses emsModelPage for the EMS create/open/delete bookends, the Cost grid,
 * and the Documents upload (identical DOM: app-cost-content-panel /
 * app-document-content-panel), and EMS_MODEL.topTabBtn for the property tabs
 * (same bottom-pane-tab-custom tabset).
 *
 * Click semantics follow the EMS rules (see ems_module_gotchas memory):
 *  - tree rows: click the .cmacs-context-menu-overlay (covers the row).
 *  - card-meta action links / clipped table cells: force-click.
 *  - dropdown menu items: real click (force only hovers them).
 */
class EmsSystemPage {
  // ── Module tab strip (Model / System / Drawing / Batch / Ticket) ────────────

  /**
   * Switch EMS module by index (Model=0, System=1, Drawing=2, Batch=3,
   * Ticket=4). ⚠ moduleTab selector is a best guess — verify on first run.
   */
  switchModule(index) {
    cy.get(EMS_SYSTEM.moduleTab, { timeout: 15000 }).eq(index).click();
    cy.wait(2000);
  }

  goToSystemModule() {
    this.switchModule(1);
    cy.get(EMS_SYSTEM.newSystemButton, { timeout: 20000 }).should("exist");
  }

  goToModelModule() {
    this.switchModule(0);
  }

  // ── Tree helpers (system / sub-system) ──────────────────────────────────────

  /** cmacs-tree-node whose OWN header title equals `name` (excludes children). */
  getNodeByName(name) {
    return cy
      .get(`${EMS_SYSTEM.tree} ${EMS_SYSTEM.treeNode}`, { timeout: 15000 })
      .filter((_i, node) => {
        const own = Cypress.$(node)
          .children("li")
          .children("div")
          .find(EMS_SYSTEM.treeNodeTitle)
          .first()
          .text()
          .trim();
        return own === name;
      });
  }

  /** Click a node (its row overlay, which captures pointer events). */
  clickNodeByName(name) {
    this.getNodeByName(name)
      .first()
      .find(EMS_SYSTEM.nodeContextOverlay)
      .first()
      .scrollIntoView()
      .click();
    cy.wait(1500);
  }

  clickLastTreeNode() {
    cy.get(`${EMS_SYSTEM.tree} ${EMS_SYSTEM.nodeContextOverlay}`, {
      timeout: 15000,
    })
      .last()
      .scrollIntoView()
      .click();
    cy.wait(1500);
  }

  // ── Create System / Sub-System ──────────────────────────────────────────────

  addSystem() {
    cy.get(EMS_SYSTEM.newSystemButton, { timeout: 15000 }).first().click();
    cy.wait(2500);
  }

  /** Right-click a node and pick a context-menu item by text. */
  contextMenuAction(nodeName, itemText) {
    this.getNodeByName(nodeName)
      .first()
      .find(EMS_SYSTEM.nodeContextOverlay)
      .first()
      .scrollIntoView()
      .rightclick();
    cy.wait(800);
    cy.get(EMS_SYSTEM.systemContextMenu, { timeout: 10000 })
      .find("li")
      .filter((_i, li) => li.textContent.trim() === itemText)
      .first()
      .click();
    cy.wait(2500);
  }

  addSubSystem(systemName) {
    this.contextMenuAction(systemName, "Add Sub System");
  }

  /** A system node has at least one sub-system child under it. */
  verifyNodeHasChild(systemName) {
    this.getNodeByName(systemName)
      .first()
      .find(`ul[role='group'] ${EMS_SYSTEM.treeNode}`)
      .should("have.length.greaterThan", 0);
  }

  getFirstChildNodeName(systemName) {
    return this.getNodeByName(systemName)
      .first()
      .find(`ul[role='group'] ${EMS_SYSTEM.treeNode} ${EMS_SYSTEM.treeNodeTitle}`)
      .first()
      .invoke("text")
      .then((t) => t.trim());
  }

  // ── System Properties tabs (reuse Model's top-tab selector) ─────────────────

  openTab(label) {
    cy.get(EMS_MODEL.topTabBtn, { timeout: 15000 })
      .filter((_i, t) => t.textContent.trim() === label)
      .first()
      .scrollIntoView()
      .click();
    cy.wait(1500);
  }

  // ── General tab ─────────────────────────────────────────────────────────────

  /** Find the field .ant-col whose direct-child label starts with `label`. */
  _generalFieldCol(label) {
    return cy.get(EMS_SYSTEM.generalFieldCol, { timeout: 10000 }).filter(
      (_i, col) => {
        const $l = Cypress.$(col).children(".model-label-style");
        return (
          $l.length > 0 &&
          $l.first().text().trim().toLowerCase().startsWith(label.toLowerCase())
        );
      }
    );
  }

  setGeneralField(label, value) {
    this._generalFieldCol(label)
      .first()
      .find("input")
      .first()
      .scrollIntoView()
      .click()
      .type(`{selectall}{backspace}${value}`)
      .blur();
    cy.wait(600);
  }

  getGeneralFieldValue(label) {
    return this._generalFieldCol(label)
      .first()
      .find("input")
      .first()
      .invoke("val");
  }

  /** Fill the General tab and verify Area == Width * Height. */
  fillGeneral({ subtypeName, ventType, dim = 10 }) {
    this.setGeneralField("System Subtype Name", subtypeName);
    this.setGeneralField("Width", dim);
    this.setGeneralField("Height", dim);
    this.setGeneralField("Weight", dim);
    this.setGeneralField("Estimated Quantity", dim);
    this.setGeneralField("Vent Type", ventType);
    cy.wait(800);
    // Area is auto-computed from Width * Height.
    this.getGeneralFieldValue("Area").should((val) => {
      expect(Number(val)).to.eq(dim * dim);
    });
  }

  // ── Articles tab ────────────────────────────────────────────────────────────

  /** Click the "Add Article" card link (card-meta title is CSS-clipped). */
  clickAddArticle() {
    cy.get(EMS_SYSTEM.articlesPanel, { timeout: 15000 })
      .contains(EMS_SYSTEM.addArticleText)
      .scrollIntoView()
      .click({ force: true });
    cy.wait(1500);
  }

  /** Double-click the first article row's name cell to open Edit Article. */
  openFirstArticle() {
    cy.get(`${EMS_SYSTEM.articleRow} ${EMS_SYSTEM.articleNameCell}`, {
      timeout: 15000,
    })
      .first()
      .scrollIntoView()
      .dblclick({ force: true });
    // AntD leaves prior modal wrappers in the DOM with visibility:hidden, so
    // scope the visibility check to the wrapper that's actually showing.
    cy.get(EMS_SYSTEM.articleModal, { timeout: 10000 })
      .filter(":visible")
      .should("have.length.greaterThan", 0);
    cy.wait(1200);
  }

  // ── Edit Article popup ──────────────────────────────────────────────────────

  enterArticleName(name) {
    cy.get(EMS_SYSTEM.articleNameInput).click().clear().type(name);
    cy.wait(400);
  }

  /** Type into a modal field located by its .model-label-style label. */
  typeInModalField(label, value) {
    cy.get(EMS_SYSTEM.modalFieldCol, { timeout: 10000 })
      .filter((_i, col) => {
        const $l = Cypress.$(col).find(".model-label-style").first();
        return (
          $l.length > 0 &&
          $l.text().trim().toLowerCase().startsWith(label.toLowerCase())
        );
      })
      .first()
      .find("input")
      .first()
      .scrollIntoView()
      .click()
      .type(`{selectall}{backspace}${value}`, { force: true });
    cy.wait(300);
  }

  /** Open a cmacs-select and pick a random real option. */
  pickRandomFromSelect(triggerSelector) {
    cy.get(triggerSelector).scrollIntoView().click();
    cy.wait(700);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .filter(":visible")
      .then(($lis) => {
        const items = [...$lis].filter(
          (li) => li.textContent.trim().length > 0 && !li.querySelector("input")
        );
        const pick = items[Math.floor(Math.random() * items.length)] || items[0];
        cy.wrap(pick).click();
      });
    cy.wait(500);
  }

  clickArticleFooter(label) {
    cy.get(EMS_SYSTEM.articleFooterPrimary)
      .filter(":visible")
      .first()
      .should("contain.text", label)
      .click();
    cy.wait(1500);
  }

  /** Screen 2: fill every property field, digits or text decided by name. */
  fillArticleProperties(fields) {
    const numeric =
      /price|charge|length|width|height|thickness|angle|number|rod|bar|shell|glass|energy|toll/i;
    fields.forEach((label) => {
      const value = numeric.test(label)
        ? String(Math.floor(Math.random() * 90) + 10)
        : `Aut${Math.floor(Math.random() * 900) + 100}`;
      this.typeInModalField(label, value);
    });
  }

  // ── Export Excel ────────────────────────────────────────────────────────────

  /**
   * Click Export Excel (next to the Source column), wait for the download, read
   * it via the xlsxRead task and assert the expected values appear.
   */
  exportExcelAndVerify(expectedValues) {
    cy.get(EMS_SYSTEM.exportExcelBtn, { timeout: 15000 })
      .filter(":visible")
      .first()
      .click();
    cy.wait(4000);
    // Read the newest .xlsx from the Cypress downloads folder.
    const downloads = Cypress.config("downloadsFolder");
    cy.task("findLatestFile", { dir: downloads, ext: ".xlsx" }).then(
      (filePath) => {
        expect(filePath, "an .xlsx download exists").to.be.a("string");
        cy.task("xlsxRead", { path: filePath }).then(({ sheets }) => {
          const flat = sheets
            .flatMap((s) => s.rows.flat())
            .map((c) => String(c).trim());
          expectedValues.forEach((v) => {
            expect(
              flat.some((cell) => cell.includes(String(v))),
              `exported xlsx contains "${v}"`
            ).to.be.true;
          });
        });
      }
    );
  }

  // ── Tracking Templates tab ──────────────────────────────────────────────────

  clickAddTrackingTemplate() {
    cy.get(EMS_SYSTEM.trackingPanel, { timeout: 15000 })
      .contains(EMS_SYSTEM.addTrackingTemplateText)
      .scrollIntoView()
      .click({ force: true });
    cy.get(COMMON.modal, { timeout: 10000 }).should("be.visible");
    cy.wait(1200);
  }

  /** Status popup: check the first template, enable assign-to-all, Save. */
  selectTrackingTemplateAndSave() {
    cy.get(EMS_SYSTEM.statusModalCheckbox, { timeout: 10000 })
      .first()
      .scrollIntoView()
      .click();
    cy.wait(600);
    cy.get(EMS_SYSTEM.assignAllSwitch).click();
    cy.wait(500);
    cy.get(EMS_SYSTEM.statusModalSaveBtn).click();
    cy.wait(2500);
  }

  verifyTrackingTemplateInList() {
    cy.get(EMS_SYSTEM.trackingRow, { timeout: 15000 }).should(
      "have.length.greaterThan",
      0
    );
  }

  // ── Elements tab ────────────────────────────────────────────────────────────

  clickAddElements() {
    cy.get(EMS_SYSTEM.elementsPanel, { timeout: 15000 })
      .contains(EMS_SYSTEM.addElementsText)
      .scrollIntoView()
      .click({ force: true });
    // AntD leaves prior modal wrappers in the DOM with visibility:hidden, so
    // scope the visibility check to the wrapper that's actually showing.
    cy.get(EMS_SYSTEM.createElementsModal, { timeout: 10000 })
      .filter(":visible")
      .should("have.length.greaterThan", 0);
    cy.wait(1200);
  }

  /** Fill the Create New Elements popup and Save. */
  createElements({ prefix, count = 10, start = 1, length = 1 }) {
    cy.get(EMS_SYSTEM.elementPrefixInput)
      .first()
      .click()
      .type(`{selectall}{backspace}${prefix}`);
    cy.wait(300);
    this._typeElementsField("Number Of Elements", count);
    this._typeElementsField("Start Number", start);
    this._typeElementsField("Length Number", length);
    // Enable Copy Templates + Copy Documents switches.
    cy.get(EMS_SYSTEM.elementsCopySwitch)
      .filter(":visible")
      .each(($btn) => {
        cy.wrap($btn).click();
        cy.wait(300);
      });
    cy.get(EMS_SYSTEM.createElementsSaveBtn).click();
    cy.wait(4000);
  }

  _typeElementsField(label, value) {
    cy.get(EMS_SYSTEM.elementsModalFieldCol, { timeout: 10000 })
      .filter((_i, col) => {
        const $l = Cypress.$(col).find(".model-label-style").first();
        return (
          $l.length > 0 &&
          $l.text().trim().toLowerCase().startsWith(label.toLowerCase())
        );
      })
      .first()
      .find("input")
      .first()
      .click()
      .type(`{selectall}{backspace}${value}`, { force: true });
    cy.wait(300);
  }

  verifyElementCount(count) {
    cy.get(EMS_SYSTEM.elementRow, { timeout: 15000 }).should(
      "have.length.greaterThan",
      count - 1
    );
  }

  /** Capture the element name prefix that should appear in the Model tree. */
  getFirstElementName() {
    return cy
      .get(EMS_SYSTEM.elementName, { timeout: 15000 })
      .first()
      .invoke("text")
      .then((t) => t.trim());
  }

  // ── Model tab verification ──────────────────────────────────────────────────

  /** Switch to Model and assert the System's elements are present in the tree. */
  verifyElementsInModel(elementText) {
    this.goToModelModule();
    cy.get(EMS_MODEL.tree, { timeout: 20000 }).should("be.visible");
    cy.get(EMS_MODEL.tree).should("contain.text", elementText);
  }
}

export default new EmsSystemPage();
