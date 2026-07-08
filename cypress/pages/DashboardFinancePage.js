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

  // Indian short-scale units used by the dashboard's currency formatter.
  static get UNITS() {
    return { cr: 1e7, l: 1e5, k: 1e3 };
  }

  // Pull every "₹<number><unit?>" token out of `text` and return the rupee
  // values. The dashboard renders abbreviated amounts ("₹35.00 L" = 35 lakh,
  // "₹7.63 Cr" = 7.63 crore); older builds printed them in full ("₹35,00,000").
  // Both parse correctly — a missing unit is just a multiplier of 1.
  //
  // Digit-stripping the whole card cannot work here: "₹35.00 L" reduces to
  // "3500", and the unit that makes it 3500000 is discarded along with it.
  _parseRupeeAmounts(text) {
    const re = /₹\s*([\d,]+(?:\.\d+)?)\s*(Cr|L|K)?/gi;
    const amounts = [];
    let m;
    while ((m = re.exec(text)) !== null) {
      const value = parseFloat(m[1].replace(/,/g, ""));
      if (Number.isNaN(value)) continue;
      const unit = m[2] ? DashboardFinancePage.UNITS[m[2].toLowerCase()] : 1;
      amounts.push(value * unit);
    }
    return amounts;
  }

  // Assert `selector`'s text shows `amount` as one of its rupee figures.
  // An abbreviated figure carries only two decimals, so "₹35.12 L" pins the
  // true value to ±500. Allow a 0.5% relative tolerance to absorb that
  // rounding; it stays far tighter than the gap between any two figures we
  // check on the same card.
  _sectionContains(selector, amount, label) {
    cy.get(selector)
      .invoke("text")
      .then((text) => {
        const amounts = this._parseRupeeAmounts(text);
        const tolerance = Math.max(1, amount * 0.005);
        const found = amounts.some((v) => Math.abs(v - amount) <= tolerance);
        expect(
          found,
          `${label} should show ${amount} — parsed [${amounts.join(", ")}] from "${text.trim()}"`,
        ).to.be.true;
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
  // The row chips render abbreviated too ("Bookings: ₹10.00 L").
  expandAndVerifyLot(lotName, { booking, invoice }) {
    cy.get(DASHBOARD_FINANCE.lotSummaryPanel).contains(lotName).click();
    cy.wait(800);

    this._sectionContains(
      DASHBOARD_FINANCE.lotSummaryPanel,
      booking,
      `${lotName} Booking`,
    );
    this._sectionContains(
      DASHBOARD_FINANCE.lotSummaryPanel,
      invoice,
      `${lotName} Invoice`,
    );
  }
}

export default new DashboardFinancePage();
