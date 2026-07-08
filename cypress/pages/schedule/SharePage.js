import { TASK, SHARE, SMART_FILTER } from "../../support/selectors";
import smartFilterPage from "./SmartFilterPage";

class SharePage {
  // --- Share modal ---

  // Open the top-toolbar "More" (3-dots) menu and click "Share".
  openShareModal() {
    cy.get(TASK.topToolbarMoreButton).click();
    cy.wait(500);
    cy.get(SHARE.moreMenuList)
      .first()
      .contains("li", /share/i)
      .click();
    cy.wait(1000);
    cy.get(SHARE.shareModal, { timeout: 10000 }).should("be.visible");
  }

  // Switch the share scope from the default "All" to "Public".
  selectPublicScope() {
    cy.get(SHARE.scopePublicInput).click({ force: true });
    cy.wait(500);
  }

  // Open the "Link Settings" dropdown and configure the advanced options for
  // the shareable link: a password, an expiration date (mm/dd/yyyy) and the
  // resource-view toggle. The dropdown-arrow button reveals the #dvPwd panel.
  configureLinkSettings({ password, expirationDate, enableResourceView = true }) {
    cy.get(SHARE.linkSettingsToggle).click();
    cy.wait(800);

    if (password) {
      cy.get(SHARE.linkPasswordInput).clear().type(password);
    }

    if (expirationDate) {
      // cmacs-date-picker takes a typed mm/dd/yyyy value; {enter} commits it and
      // closes the calendar popup.
      cy.get(SHARE.linkExpirationInput)
        .click()
        .type(`${expirationDate}{enter}`);
      cy.wait(500);
    }

    if (enableResourceView) {
      cy.get(SHARE.resourceViewSwitch).click();
      cy.wait(300);
    }
  }

  // Stub the two copy mechanisms an Angular app may use (navigator.clipboard
  // and the CDK's document.execCommand('copy')) so we can capture the URL the
  // "Get shareable link" button writes to the clipboard — no OS clipboard read
  // (and its focus/permission pitfalls) required.
  _prepareClipboardCapture() {
    cy.window().then((win) => {
      win.__copiedLink = null;

      const clip = win.navigator.clipboard;
      if (clip && clip.writeText) {
        cy.stub(clip, "writeText").callsFake((text) => {
          win.__copiedLink = text;
          return Promise.resolve();
        });
      }

      const doc = win.document;
      const realExec = doc.execCommand.bind(doc);
      cy.stub(doc, "execCommand").callsFake((command, ...args) => {
        const result = realExec(command, ...args);
        if (String(command).toLowerCase() === "copy") {
          const active = doc.activeElement;
          const fromField = active && "value" in active ? active.value : "";
          const fromSelection = win.getSelection
            ? win.getSelection().toString()
            : "";
          win.__copiedLink = fromField || fromSelection || win.__copiedLink;
        }
        return result;
      });
    });
  }

  // Click "Get shareable link" and yield the captured URL down the chain.
  getShareableLink() {
    this._prepareClipboardCapture();
    // `.shared-link-box` holds several spans (link text + "Link Settings"
    // dropdown), so match the "Get shareable link" span by text to keep the
    // click subject to a single element.
    cy.contains(SHARE.getShareableLink, /get shareable link/i).click();
    cy.wait(1500);
    return cy
      .window()
      .its("__copiedLink")
      .should("be.a", "string")
      .and("not.be.empty");
  }

  // --- Shared link navigation ---

  // Cypress can't drive a real second tab, so save the current URL, visit the
  // shared link in the same tab, run the assertions, then return to the schedule.
  // Pass { password } for a password-protected link to answer the prompt that
  // appears before the read-only gantt renders.
  visitSharedLinkAndVerify(link, verifyFn, options = {}) {
    cy.url().then((originalUrl) => {
      const fullLink = link.startsWith("http") ? link : `https://${link}`;
      cy.visit(fullLink);
      cy.wait(5000);

      if (options.password) {
        this.enterSharedLinkPassword(options.password);
      }

      cy.get(SHARE.readOnlyGantt, { timeout: 20000 }).should("exist");

      verifyFn();

      cy.visit(originalUrl);
      cy.wait(5000);
    });
  }

  // Answer the "Enter password" prompt shown when opening a protected link.
  enterSharedLinkPassword(password) {
    cy.get(SHARE.sharedLinkPasswordInput, { timeout: 15000 })
      .should("be.visible")
      .clear()
      .type(password);
    cy.get(SHARE.sharedLinkPasswordSubmit).click();
    cy.wait(3000);
  }

  // --- Read-only shared gantt assertions ---

  _readRowNames($rows) {
    return [...$rows].map((row) => {
      const label = row.querySelector(SHARE.readOnlyTitleCell);
      return label ? label.textContent.trim() : "";
    });
  }

  // Assert the shared gantt shows exactly the expected task names (order-agnostic).
  verifySharedTaskNames(expectedNames) {
    cy.get(SHARE.readOnlyRows).should("have.length", expectedNames.length);
    cy.get(SHARE.readOnlyRows).then(($rows) => {
      const actual = this._readRowNames($rows).sort();
      expect(actual).to.deep.equal([...expectedNames].sort());
    });
  }

  // Assert a named task in the shared gantt shows the expected % complete.
  verifySharedTaskPercent(taskName, expectedPercent) {
    cy.get(SHARE.readOnlyRows).then(($rows) => {
      const row = [...$rows].find((r) => {
        const label = r.querySelector(SHARE.readOnlyTitleCell);
        return label && label.textContent.trim() === taskName;
      });
      expect(row, `${taskName} row in shared gantt`).to.exist;
      const percentCell = row.querySelector(SHARE.readOnlyPercentCell);
      expect(percentCell.textContent.trim()).to.equal(String(expectedPercent));
    });
  }

  // --- Smart filter helper (Delayed) ---

  // Apply the "Delayed" smart filter fresh. Returning from a shared-link visit
  // reloads the schedule and clears any applied filter, so remove a lingering
  // filter chip first (if one somehow survived) to keep this idempotent.
  applyDelayedFilter() {
    cy.get("body").then(($body) => {
      if ($body.find(SMART_FILTER.removeFilterIcon).length > 0) {
        smartFilterPage.removeAppliedFilter();
      }
    });
    smartFilterPage.applyFilter("Delayed");
  }
}

export default new SharePage();
