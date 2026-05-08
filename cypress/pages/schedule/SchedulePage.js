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

  // --- Schedule deletion ---

  confirmScheduleDelete() {
    cy.get(COMMON.modal, { timeout: 10000 }).should("be.visible");
    cy.get(COMMON.scheduleModalDangerButton).first().click();
    cy.wait(1000);

    // Optional secondary confirmation for primary project schedule
    cy.get("body").then(($body) => {
      if ($body.text().includes(SCHEDULE.primaryProjectScheduleText)) {
        cy.get(COMMON.scheduleModalDangerButton).first().click();
        cy.wait(1000);
      }
    });

    cy.wait(2000);
  }

  deleteScheduleByName(scheduleName) {
    this.selectScheduleByName(scheduleName);
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
