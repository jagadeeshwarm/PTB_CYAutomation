import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import dashboardFinancePage from "../../../pages/DashboardFinancePage";
import schedulePage from "../../../pages/schedule/SchedulePage";
import taskCreationPage from "../../../pages/schedule/TaskCreationPage";
import sidePanelPage from "../../../pages/schedule/SidePanelPage";
import { SCHEDULE } from "../../../support/selectors";
import { SCHEDULE_NAMES } from "../../../support/utils/scheduleNames";

const SCHEDULE_NAME = SCHEDULE_NAMES.CASHFLOW;

// ── Task structure (as shown in the attachments) ─────────────────────────
// Row order after building: each summary task is followed by its one child.
//   0 Lot 1          (summary)   → finances entered
//   1 Planning       (child)
//   2 Lot 2          (summary)   → finances entered
//   3 Implementation (child)
//   4 Lot 3          (summary)   → no finances
//   5 Maintaince     (child)      (spelling kept as shown in the attachment)
const TASKS = ["Lot 1", "Planning", "Lot 2", "Implementation", "Lot 3", "Maintaince"];
const LOT1_ROW = 0;
const LOT2_ROW = 2;

// ── Finance data (INR). Popup dates are typed as mm/dd/yyyy. ──────────────
const FIN = {
  lot1: {
    booking: [{ date: "07/01/2026", value: 1000000, pi: "PI-001" }],
    invoice: [
      { date: "07/02/2026", value: 300000, pi: "I-001" },
      { date: "07/04/2026", value: 300000, pi: "I-002" },
      { date: "07/06/2026", value: 400000, pi: "I-003" },
    ],
    nalcoInvoice: { pi: "PI-002", value: 500000 },
    nalcoCollection: { pi: "CI-001", value: 250000 },
    bookingTotal: 1000000, // ₹10,00,000
    invoiceTotal: 1000000, // ₹10,00,000
    balance: 0, // ₹0
  },
  lot2: {
    booking: [{ date: "07/06/2026", value: 2500000, pi: "PI-002" }],
    invoice: [
      { date: "07/30/2026", value: 500000, pi: "I-001" },
      { date: "08/13/2026", value: 1500000, pi: "I-002" },
      { date: "08/30/2026", value: 200000, pi: "I-003" },
      { date: "09/01/2026", value: 300000, pi: "I-004" },
    ],
    nalcoInvoice: { pi: "PI-001", value: 1000000 },
    nalcoCollection: { pi: "CI-001", value: 500000 },
    bookingTotal: 2500000, // ₹25,00,000
    invoiceTotal: 2500000, // ₹25,00,000
    balance: 0, // ₹0
  },
};

// ── Dashboard expected cumulative values (computed from the data above) ───
// NOTE: "current month" is July 2026 (today = 2026-07-06). These are computed
// expectations — confirm them against the live Dashboard on the first run.
const DASH = {
  // Booking of all tasks — both bookings are dated in July → full total.
  currentMonthBooking: 3500000, // ₹35,00,000  (10,00,000 + 25,00,000)
  // Invoices dated within July only: Lot1 (10,00,000) + Lot2 30-Jul (5,00,000).
  currentMonthInvoice: 1500000, // ₹15,00,000
  nalcoInvoice: 1500000, // ₹15,00,000  (5,00,000 + 10,00,000)
  nalcoCollection: 750000, // ₹7,50,000  (2,50,000 + 5,00,000)
};

// Select a lot's summary row, open the side panel and the Finances tab.
function openLotFinances(rowIndex) {
  taskCreationPage.getTaskRows().eq(rowIndex).click();
  cy.wait(500);
  sidePanelPage.open();
  sidePanelPage.openFinancesTab();
}

describe("Cash Flow – Booking/Invoicing + Nalco end-to-end", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      this.users = users;
      loginPage.visit();
      // Log in as the admin PM user for this project.
      loginPage.login("adminuser001@yopmail.com", "Password1234!");
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      // Navigate: All → search "Automation Project" → open → Planning workspace.
      dashboardPage.openProjectBySearch("Automation Project");
      dashboardPage.selectWorkspaceByIndex(5);
    });
  });

  // ── Step 1: Create schedule ────────────────────────────────────────────

  it("Step 1: Create a new schedule", () => {
    schedulePage.createSchedule(SCHEDULE_NAME);
    cy.contains(SCHEDULE_NAME).should("be.visible");
  });

  // ── Step 2: Build the Lot 1 / Lot 2 / Lot 3 structure with children ─────

  it("Step 2: Create and rename the six tasks, nested as three lot/child pairs", () => {
    // Create the first task, then append the rest as top-level siblings.
    taskCreationPage.createTask();
    for (let i = 1; i < TASKS.length; i += 1) {
      taskCreationPage.addTopLevelTaskBelowLast();
    }
    taskCreationPage.verifyTaskCount(TASKS.length);

    // Rename via the side-panel name field — this app disables dhtmlx inline
    // grid editing, so double-clicking the grid cell does nothing. Selecting a
    // row updates the side panel's General Settings name input.
    sidePanelPage.open();
    TASKS.forEach((name, rowIndex) => {
      taskCreationPage.getTaskRows().eq(rowIndex).click();
      cy.wait(300);
      sidePanelPage.renameTask(name);
    });
    sidePanelPage.close();

    // Indent the child rows under their preceding summary task.
    taskCreationPage.indentTaskAtRow(1); // Planning       → under Lot 1
    taskCreationPage.indentTaskAtRow(3); // Implementation → under Lot 2
    taskCreationPage.indentTaskAtRow(5); // Maintaince     → under Lot 3

    // Verify the names are all present after nesting.
    TASKS.forEach((name) => taskCreationPage.verifyTaskExists(name));
  });

  // ── Step 3: Lot 1 – Booking/Invoicing ──────────────────────────────────

  it("Step 3: Lot 1 – add Booking and Invoices, verify totals and ₹0 balance", () => {
    openLotFinances(LOT1_ROW);
    sidePanelPage.openBookingInvoicingSubTab();

    FIN.lot1.booking.forEach((entry) => sidePanelPage.addBooking(entry));
    FIN.lot1.invoice.forEach((entry) => sidePanelPage.addInvoice(entry));

    sidePanelPage.verifyBookingSectionTotal(FIN.lot1.bookingTotal);
    sidePanelPage.verifyInvoiceSectionTotal(FIN.lot1.invoiceTotal);
    sidePanelPage.verifyBalanceRow(FIN.lot1.balance);
  });

  // ── Step 4: Lot 1 – Nalco ──────────────────────────────────────────────

  it("Step 4: Lot 1 – add Nalco Invoice and Collection, verify totals", () => {
    sidePanelPage.openNalcoSubTab();

    sidePanelPage.addNalcoInvoice(FIN.lot1.nalcoInvoice);
    sidePanelPage.addNalcoCollection(FIN.lot1.nalcoCollection);

    sidePanelPage.verifyNalcoInvoiceTotal(FIN.lot1.nalcoInvoice.value);
    sidePanelPage.verifyNalcoCollectionTotal(FIN.lot1.nalcoCollection.value);
  });

  // ── Step 5: Lot 2 – Booking/Invoicing ──────────────────────────────────

  it("Step 5: Lot 2 – add Booking and Invoices, verify totals and ₹0 balance", () => {
    openLotFinances(LOT2_ROW);
    sidePanelPage.openBookingInvoicingSubTab();

    FIN.lot2.booking.forEach((entry) => sidePanelPage.addBooking(entry));
    FIN.lot2.invoice.forEach((entry) => sidePanelPage.addInvoice(entry));

    sidePanelPage.verifyBookingSectionTotal(FIN.lot2.bookingTotal);
    sidePanelPage.verifyInvoiceSectionTotal(FIN.lot2.invoiceTotal);
    sidePanelPage.verifyBalanceRow(FIN.lot2.balance);
  });

  // ── Step 6: Lot 2 – Nalco ──────────────────────────────────────────────

  it("Step 6: Lot 2 – add Nalco Invoice and Collection, verify totals", () => {
    sidePanelPage.openNalcoSubTab();

    sidePanelPage.addNalcoInvoice(FIN.lot2.nalcoInvoice);
    sidePanelPage.addNalcoCollection(FIN.lot2.nalcoCollection);

    sidePanelPage.verifyNalcoInvoiceTotal(FIN.lot2.nalcoInvoice.value);
    sidePanelPage.verifyNalcoCollectionTotal(FIN.lot2.nalcoCollection.value);
  });

  // ── Step 7: Persistence – reload and re-verify both lots ───────────────

  it("Step 7: Reload and verify Lot 1 & Lot 2 finances persist", () => {
    sidePanelPage.close();
    cy.reload();
    cy.get(".gantt_grid_data", { timeout: 15000 }).should("be.visible");
    cy.wait(1000);

    // Lot 1
    openLotFinances(LOT1_ROW);
    sidePanelPage.openBookingInvoicingSubTab();
    sidePanelPage.verifyBookingSectionTotal(FIN.lot1.bookingTotal);
    sidePanelPage.verifyInvoiceSectionTotal(FIN.lot1.invoiceTotal);
    sidePanelPage.verifyBalanceRow(FIN.lot1.balance);
    sidePanelPage.openNalcoSubTab();
    sidePanelPage.verifyNalcoInvoiceTotal(FIN.lot1.nalcoInvoice.value);
    sidePanelPage.verifyNalcoCollectionTotal(FIN.lot1.nalcoCollection.value);

    // Lot 2
    openLotFinances(LOT2_ROW);
    sidePanelPage.openBookingInvoicingSubTab();
    sidePanelPage.verifyBookingSectionTotal(FIN.lot2.bookingTotal);
    sidePanelPage.verifyInvoiceSectionTotal(FIN.lot2.invoiceTotal);
    sidePanelPage.verifyBalanceRow(FIN.lot2.balance);
    sidePanelPage.openNalcoSubTab();
    sidePanelPage.verifyNalcoInvoiceTotal(FIN.lot2.nalcoInvoice.value);
    sidePanelPage.verifyNalcoCollectionTotal(FIN.lot2.nalcoCollection.value);

    sidePanelPage.close();
  });

  // ── Step 7b: Mark the schedule as primary ──────────────────────────────
  // The Dashboard aggregates finances from the project's PRIMARY schedule.

  it("Step 7b: Go to the schedule list and mark the schedule as primary", () => {
    schedulePage.goBackToScheduleList();
    schedulePage.markScheduleAsPrimary(SCHEDULE_NAME);
  });

  // ── Step 8: Dashboard – cumulative Current Month & Nalco summary ───────

  it("Step 8: Open Project-workspace Dashboard, verify cumulative finance cards", () => {
    dashboardPage.selectWorkspaceByName("Project");
    dashboardFinancePage.open();
    dashboardFinancePage.reloadAndWait();
    dashboardFinancePage.scrollToFinanceSections();

    dashboardFinancePage.verifyCurrentMonthBooking(DASH.currentMonthBooking);
    dashboardFinancePage.verifyCurrentMonthInvoice(DASH.currentMonthInvoice);
    dashboardFinancePage.verifyNalcoSummary(
      DASH.nalcoInvoice,
      DASH.nalcoCollection,
    );
  });

  // ── Step 9: Dashboard – Financial Details per-lot summary ──────────────

  it("Step 9: Verify Financial Details – Lot 1 & Lot 2 shown, Lot 3 not shown", () => {
    // Only summary tasks with financial values appear here.
    dashboardFinancePage.verifyLotPresentInSummary("Lot 1");
    dashboardFinancePage.verifyLotPresentInSummary("Lot 2");
    dashboardFinancePage.verifyLotAbsentFromSummary("Lot 3");

    // Expand each lot and verify its Booking / Invoice values.
    dashboardFinancePage.expandAndVerifyLot("Lot 1", {
      booking: FIN.lot1.bookingTotal,
      invoice: FIN.lot1.invoiceTotal,
    });
    dashboardFinancePage.expandAndVerifyLot("Lot 2", {
      booking: FIN.lot2.bookingTotal,
      invoice: FIN.lot2.invoiceTotal,
    });
  });

  // ── Step 10: Cleanup – delete the schedule ─────────────────────────────

  it("Step 10: Delete the schedule via multi-select and verify it is removed", () => {
    // Return to the Planning workspace (schedule list) to clean up.
    dashboardPage.selectWorkspaceByIndex(5);
    cy.wait(2000);
    cy.get("body").then(($body) => {
      if ($body.find(SCHEDULE.scheduleBreadcrumbBack).length > 0) {
        schedulePage.goBackToScheduleList();
      }
    });
    schedulePage.deleteAllSchedulesViaMultiSelect();
    schedulePage.verifyScheduleDoesNotExist(SCHEDULE_NAME);
  });
});
