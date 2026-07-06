import { DASHBOARD_FINANCE } from "../support/selectors";

// Page object for the Project-workspace Dashboard finance report (#printArea).
// Verifies the cumulative finance cards (Current Month Finances, Nalco summary)
// and the per-lot Financial Details panel.
class DashboardFinancePage {
  // Open the Dashboard view. Assumes the Project workspace is already selected.
  open() {
    cy.get(DASHBOARD_FINANCE.dashboardNavItem, { timeout: 15000 }).click();
    cy.wait(3000);
    cy.get(DASHBOARD_FINANCE.printArea, { timeout: 20000 }).should("exist");
  }

  // Reload the dashboard and wait for the report to re-render.
  reloadAndWait() {
    cy.reload();
    cy.wait(3000);
    cy.get(DASHBOARD_FINANCE.printArea, { timeout: 20000 }).should("exist");
  }

  scrollToFinanceSections() {
    cy.get(DASHBOARD_FINANCE.currentMonthFinances, { timeout: 15000 })
      .scrollIntoView()
      .should("be.visible");
    cy.wait(500);
  }

  // Assert a section's text contains a numeric amount, ignoring currency symbol
  // and Indian-style grouping (e.g. "₹35,00,000" ⇒ 3500000).
  _sectionContains(selector, amount, label) {
    const digits = String(amount).replace(/[^0-9]/g, "");
    cy.get(selector)
      .invoke("text")
      .then((text) => {
        const normalized = text.replace(/[^0-9]/g, "");
        expect(normalized, `${label} should contain ${amount}`).to.include(
          digits,
        );
      });
  }

  // Current Month Finances card — cumulative Booking and Invoice across all tasks.
  verifyCurrentMonthBooking(amount) {
    this._sectionContains(
      DASHBOARD_FINANCE.currentMonthFinances,
      amount,
      "Current-month Booking (cumulative)",
    );
  }

  verifyCurrentMonthInvoice(amount) {
    this._sectionContains(
      DASHBOARD_FINANCE.currentMonthFinances,
      amount,
      "Current-month Invoice (cumulative)",
    );
  }

  // Nalco cumulative summary card — Invoice and Collection totals across tasks.
  verifyNalcoSummary(invoiceAmount, collectionAmount) {
    this._sectionContains(
      DASHBOARD_FINANCE.nalcoSummary,
      invoiceAmount,
      "Nalco Invoice (cumulative)",
    );
    this._sectionContains(
      DASHBOARD_FINANCE.nalcoSummary,
      collectionAmount,
      "Nalco Collection (cumulative)",
    );
  }

  // Financial Details — lot summary panel.
  verifyLotPresentInSummary(lotName) {
    cy.get(DASHBOARD_FINANCE.lotSummaryPanel).should("contain.text", lotName);
  }

  verifyLotAbsentFromSummary(lotName) {
    cy.get(DASHBOARD_FINANCE.lotSummaryPanel).should(
      "not.contain.text",
      lotName,
    );
  }

  // Expand a lot row (click its header) and verify its Booking + Invoice amounts.
  expandAndVerifyLot(lotName, { booking, invoice }) {
    cy.get(DASHBOARD_FINANCE.lotSummaryPanel).contains(lotName).click();
    cy.wait(800);

    const bookingDigits = String(booking).replace(/[^0-9]/g, "");
    const invoiceDigits = String(invoice).replace(/[^0-9]/g, "");
    cy.get(DASHBOARD_FINANCE.lotSummaryPanel)
      .invoke("text")
      .then((text) => {
        const normalized = text.replace(/[^0-9]/g, "");
        expect(normalized, `${lotName} Booking`).to.include(bookingDigits);
        expect(normalized, `${lotName} Invoice`).to.include(invoiceDigits);
      });
  }
}

export default new DashboardFinancePage();
