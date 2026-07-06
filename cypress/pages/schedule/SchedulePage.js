import { SCHEDULE, COMMON } from "../../support/selectors";

const DEFAULT_SCHEDULE_NAME = "Automation_create_delete";

class SchedulePage {
  // --- Selectors (delegated to centralized selector module) ---

  get newScheduleButton() {
    return cy.get(SCHEDULE.newScheduleButton);
  }

  get scheduleNameInput() {
    return cy.get(SCHEDULE.scheduleNameInput);
  }

  get createScheduleButton() {
    return cy.get(SCHEDULE.createScheduleButton);
  }

  get scheduleDatePicker() {
    return cy.get(SCHEDULE.scheduleDatePicker);
  }

  get scheduleDatePickerClear() {
    return cy.get(SCHEDULE.scheduleDatePickerClear);
  }

  get scheduleListTable() {
    return cy.get(SCHEDULE.scheduleListTable);
  }

  get deleteScheduleButton() {
    return cy.get(SCHEDULE.deleteScheduleButton);
  }

  get backToScheduleListLink() {
    return cy.get(SCHEDULE.scheduleBreadcrumbBack);
  }

  // --- Schedule creation ---

  clickNewSchedule() {
    this.newScheduleButton.click();
  }

  enterScheduleName(name = DEFAULT_SCHEDULE_NAME) {
    this.scheduleNameInput.clear().type(name);
  }

  clickCreateSchedule() {
    this.createScheduleButton.click();
    cy.wait(2000);
  }

  clearScheduleDate() {
    // Clear icon only appears on hover; trigger mouseover first, then click the X
    this.scheduleDatePicker.trigger("mouseover");
    this.scheduleDatePickerClear.click({ force: true });
    cy.wait(300);
  }

  createSchedule(name = DEFAULT_SCHEDULE_NAME) {
    this.clickNewSchedule();
    this.enterScheduleName(name);
    this.clearScheduleDate();
    this.clickCreateSchedule();
  }

  // --- Schedule list navigation ---

  goBackToScheduleList() {
    this.backToScheduleListLink.click();
    cy.wait(2000);
  }

  selectScheduleByName(scheduleName) {
    this.scheduleListTable
      .contains(SCHEDULE.scheduleNameCell, scheduleName)
      .scrollIntoView()
      .click();
    cy.wait(500);
  }

  openScheduleByName(scheduleName) {
    this.scheduleListTable
      .contains(SCHEDULE.scheduleNameCell, scheduleName)
      .scrollIntoView()
      .dblclick();
    cy.wait(2000);
  }

  // Select a schedule in the list, open its "…" menu and mark it primary.
  // Dashboard finance aggregation reads the primary schedule. Idempotent: if
  // "Mark as Primary" is already disabled, the schedule is primary → skip.
  markScheduleAsPrimary(scheduleName) {
    this.selectScheduleByName(scheduleName);
    cy.get(SCHEDULE.scheduleBarMoreButton).first().click();
    cy.wait(800);
    // Scope to the VISIBLE dropdown item — an unscoped/force click can hit a
    // stale hidden overlay and never open the confirmation modal.
    cy.get(`${SCHEDULE.scheduleActionMenuItem}:visible`, { timeout: 10000 })
      .contains(/mark as primary/i)
      .then(($item) => {
        const $li = $item.closest(".ant-dropdown-menu-item");
        const disabled =
          $li.hasClass("ant-dropdown-menu-item-disabled") ||
          $li.attr("aria-disabled") === "true";
        if (disabled) {
          // Already the primary schedule — close the dropdown, nothing to do.
          cy.get("body").type("{esc}");
          cy.wait(300);
        } else {
          cy.wrap($item).click();
          // Wait for the "Mark as Primary" confirmation modal, then click OK.
          cy.get(SCHEDULE.markPrimaryConfirmOk, { timeout: 10000 })
            .filter(":visible")
            .first()
            .click();
          cy.wait(2000);
        }
      });
  }

  // --- Schedule deletion ---

  // Click the danger/confirm button if a confirmation modal is still visible.
  _clickDangerIfVisible() {
    cy.get("body").then(($body) => {
      if ($body.find(`${COMMON.scheduleModalDangerButton}:visible`).length > 0) {
        cy.get(COMMON.scheduleModalDangerButton)
          .filter(":visible")
          .first()
          .click();
        cy.wait(1500);
      }
    });
  }

  confirmScheduleDelete() {
    cy.get(COMMON.modal, { timeout: 10000 }).should("be.visible");
    cy.get(COMMON.scheduleModalDangerButton).filter(":visible").first().click();
    cy.wait(1500);

    // A primary schedule triggers extra confirmations — click the danger button
    // again for each one still/again visible (more robust than matching text).
    this._clickDangerIfVisible();
    this._clickDangerIfVisible();

    cy.wait(2000);
  }

  deleteScheduleByName(scheduleName) {
    this.selectScheduleByName(scheduleName);
    this.deleteScheduleButton.click();
    cy.wait(1000);
    this.confirmScheduleDelete();
  }

  // Delete via the multi-select flow: toggle checkboxes, tick "select all",
  // click delete, then confirm (twice more for a primary schedule).
  deleteAllSchedulesViaMultiSelect() {
    cy.get(SCHEDULE.scheduleMultiSelectButton).click();
    cy.wait(800);
    cy.get(SCHEDULE.scheduleSelectAllCheckbox).check({ force: true });
    cy.wait(500);
    this.deleteScheduleButton.click();
    cy.wait(1000);
    this.confirmScheduleDelete();
  }

  // --- Validations ---

  verifyScheduleExists(scheduleName) {
    this.scheduleListTable.should("contain.text", scheduleName);
  }

  verifyScheduleDoesNotExist(scheduleName) {
    this.scheduleListTable.should("not.contain.text", scheduleName);
  }
}

export default new SchedulePage();
