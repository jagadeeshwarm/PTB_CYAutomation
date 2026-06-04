import { FIELD_LOGS, COMMON } from "../../support/selectors";

/**
 * FieldLogsPage — Field Operations workspace > Logs tab.
 * Creates a log from a Form Template, distributes it, sends it, reopens,
 * exports to PDF and deletes it.
 *
 * Workspace switching is handled by dashboardPage.selectWorkspaceByName; this
 * page object only owns the Logs tab + log editor interactions.
 */
class FieldLogsPage {
  // ── Navigation ────────────────────────────────────────────────────────────

  openLogsTab() {
    // Nav anchor <a.main-menu-text-container> carries the href/navigation.
    cy.get("a.main-menu-text-container:visible", { timeout: 15000 })
      .filter(
        (_i, el) =>
          el.textContent.replace(/\s+/g, " ").trim() === FIELD_LOGS.logsTabLabel
      )
      .first()
      .click({ force: true });
    cy.wait(2000);
    cy.get(FIELD_LOGS.newLogButton, { timeout: 20000 }).should("be.visible");
  }

  clickNew() {
    cy.get(FIELD_LOGS.newLogButton, { timeout: 20000 })
      .filter(":visible")
      .first()
      .should("be.visible")
      .click();
    cy.get(COMMON.modal, { timeout: 10000 }).should("be.visible");
    cy.wait(1000);
  }

  // ── "Use Template" popup ──────────────────────────────────────────────────

  openTemplateDropdown() {
    cy.get(FIELD_LOGS.useTemplateSelect).click();
    cy.wait(800);
  }

  /** Assert the freshly-created template shows up in the dropdown list. */
  verifyTemplateListed(templateName) {
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 }).should(
      "contain.text",
      templateName
    );
  }

  selectTemplate(templateName) {
    cy.get(COMMON.overlayVisibleList)
      .find("li")
      .contains(templateName)
      .click();
    cy.wait(500);
  }

  confirmUseTemplate() {
    cy.get(FIELD_LOGS.useTemplateOkButton).click();
    cy.wait(2500);
  }

  /** Open the popup, verify our template is present, pick it and confirm. */
  createLogFromTemplate(templateName) {
    this.clickNew();
    this.openTemplateDropdown();
    this.verifyTemplateListed(templateName);
    this.selectTemplate(templateName);
    this.confirmUseTemplate();
  }

  // ── Distribution list ─────────────────────────────────────────────────────

  /** Open the Add Users/Teams dropdown and pick a (random-ish) user. */
  addRandomUser() {
    cy.get(FIELD_LOGS.addUsersSelect).click();
    cy.wait(800);
    cy.get(COMMON.overlayVisibleList, { timeout: 10000 })
      .find("li")
      .eq(1) // second entry — any valid user from the list
      .click();
    cy.wait(500);
    // Collapse the dropdown.
    cy.get("body").click(0, 0);
    cy.wait(300);
  }

  // ── Send ──────────────────────────────────────────────────────────────────

  clickSend() {
    cy.get(FIELD_LOGS.sendButton).should("not.be.disabled").click();
    cy.wait(800);
  }

  confirmSend() {
    cy.get(COMMON.modal, { timeout: 10000 }).should("be.visible");
    cy.get(FIELD_LOGS.confirmPrimaryButton).click();
    cy.wait(1000);
  }

  /** Wait for the success toast: "The email was successfully sent." */
  verifyEmailSent() {
    cy.get(FIELD_LOGS.messageContainer, { timeout: 20000 }).should(
      "contain.text",
      FIELD_LOGS.emailSentText
    );
  }

  send() {
    this.clickSend();
    this.confirmSend();
    this.verifyEmailSent();
  }

  // ── 3-dots menu ───────────────────────────────────────────────────────────

  openThreeDotsMenu() {
    cy.get(FIELD_LOGS.threeDotsTrigger).click();
    cy.wait(600);
  }

  clickMenuOption(label) {
    cy.get(COMMON.overlayVisibleList).find("li").contains(label).click();
    cy.wait(800);
  }

  /** Reopen the (sent, locked) log and confirm the prompt. */
  reopen() {
    this.openThreeDotsMenu();
    this.clickMenuOption(FIELD_LOGS.menuReopenLabel);
    cy.get(COMMON.modal, { timeout: 10000 }).should("be.visible");
    cy.get(FIELD_LOGS.confirmPrimaryButton).click();
    cy.wait(2000);
  }

  verifySendEnabled() {
    cy.get(FIELD_LOGS.sendButton, { timeout: 10000 }).should(
      "not.be.disabled"
    );
  }

  /**
   * Trigger Export PDF and verify the download succeeded.
   *
   * The export hits the log PDF endpoint (`/logforms/<id>/pdf/v2`); a 200 there
   * means the server generated the file and the browser download was served.
   * We assert on that response rather than the on-disk filename, because the
   * download is named after the log title (e.g. "Log - 2026-06-04" →
   * "Log---2026-06-04.pdf"), not the template name.
   */
  exportPdf() {
    cy.intercept("GET", "**/logforms/**/pdf/**").as("exportPdf");
    this.openThreeDotsMenu();
    this.clickMenuOption(FIELD_LOGS.menuExportPdfLabel);
    cy.wait("@exportPdf", { timeout: 25000 })
      .its("response.statusCode")
      .should("eq", 200);
    cy.wait(1500);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  deleteLog() {
    cy.get(FIELD_LOGS.deleteButton).click();
    cy.wait(800);
    // Confirm if a deletion prompt appears.
    cy.get("body").then(($body) => {
      if ($body.find(`${COMMON.modal}:visible`).length > 0) {
        cy.get(COMMON.modalDangerButton)
          .filter(":visible")
          .first()
          .click({ force: true });
        cy.wait(1500);
      }
    });
    cy.wait(1500);
  }
}

export default new FieldLogsPage();
