import { TASK, TASK_COLUMNS, COMMON } from "../../support/selectors";
import { formatDate, addDays, parseDisplayDate } from "../../support/utils/dateUtils";

class TaskCreationPage {
  // --- Toolbar selectors ---

  get plusButton() {
    return cy.get(TASK.plusButton);
  }

  get deleteButton() {
    return cy.get(TASK.sidePanelDeleteButton);
  }

  // --- Gantt grid selectors ---

  get ganttGridData() {
    return cy.get(TASK.ganttGridData);
  }

  get taskInlineInput() {
    return cy.get(TASK.taskInlineInput);
  }

  // --- Task creation ---

  createTask() {
    this.plusButton.click();
    cy.wait(1000);
  }

  // --- Top toolbar / column visibility ---

  get topToolbarMoreButton() {
    return cy.get(TASK.topToolbarMoreButton);
  }

  openMoreMenu() {
    this.topToolbarMoreButton.click();
    cy.wait(500);
  }

  openShowColumnsMenu() {
    this.openMoreMenu();
    cy.contains(`${COMMON.overlayContainer} li a`, TASK.showColumnsMenuText)
      .first()
      .click();
    cy.wait(500);
  }

  closeOverlayMenu() {
    cy.get("body").type("{esc}");
    cy.wait(300);
  }

  // Iterate every column entry: any item showing the EyeSlash icon (hidden)
  // gets clicked, flipping it to the Eye icon (visible). Re-queries after each
  // click because the DOM updates as the icon class changes.
  // Once no EyeSlash icons remain, click Save to persist.
  ensureAllColumnsVisible() {
    this.openShowColumnsMenu();

    const clickNextHidden = () => {
      cy.get("body").then(($body) => {
        if ($body.find(TASK.hiddenColumnIcon).length > 0) {
          cy.get(TASK.hiddenColumnIcon).first().click();
          cy.wait(300);
          clickNextHidden();
        }
      });
    };

    clickNextHidden();
    // All columns now show the Eye icon — persist via Save
    cy.get(TASK.showColumnsSaveButton).click();
    cy.wait(800);
  }

  // --- Task selection actions ---

  selectTask(taskName) {
    cy.contains(TASK.ganttCell, taskName).click();
    cy.wait(500);
  }

  rightClickTask(taskName) {
    cy.contains(TASK.ganttCell, taskName).rightclick();
    cy.wait(500);
  }

  doubleClickTask(taskName) {
    cy.contains(TASK.ganttCell, taskName).dblclick();
    cy.wait(500);
  }

  // --- Plus menu actions (task selected → click +) ---

  openPlusMenu() {
    this.plusButton.click();
    cy.wait(500);
  }

  clickPlusMenuOption(childIndex) {
    cy.get(`${COMMON.overlayVisibleList} li:nth-child(${childIndex}) a`)
      .last()
      .click();
    cy.wait(500);
  }

  clickPlusMenuOptionByText(optionText, fallbackIndex) {
    cy.get(COMMON.overlayVisibleList).then(($menus) => {
      const option = $menus
        .find("li:visible, a:visible")
        .filter((_, element) =>
          element.innerText
            .trim()
            .toLowerCase()
            .includes(optionText.toLowerCase()),
        )
        .last();

      if (option.length) {
        cy.wrap(option).click();
      } else {
        this.clickPlusMenuOption(fallbackIndex);
      }
    });
    cy.wait(500);
  }

  addAboveViaPlusMenu() {
    this.openPlusMenu();
    this.clickPlusMenuOptionByText("Above", 1);
  }

  addBelowViaPlusMenu() {
    this.openPlusMenu();
    this.clickPlusMenuOptionByText("Below", 2);
  }

  addChildViaPlusMenu() {
    this.openPlusMenu();
    this.clickPlusMenuOptionByText("Child", 3);
  }

  // --- Context menu actions (right-click → Add Task → submenu) ---

  clickContextMenuItem(childIndex) {
    cy.get(`${COMMON.overlayList} li:nth-child(${childIndex})`)
      .last()
      .click();
    cy.wait(500);
  }

  openAddTaskSubmenu() {
    cy.contains(COMMON.overlayListItem, TASK.addTaskMenuText).click();
    cy.wait(300);
  }

  clickSubmenuOption(childIndex) {
    cy.get(COMMON.overlayContainer)
      .find("ul")
      .last()
      .find(`li:nth-child(${childIndex})`)
      .click();
    cy.wait(500);
  }

  addAboveViaContextMenu(taskName) {
    this.selectTask(taskName);
    this.rightClickTask(taskName);
    this.openAddTaskSubmenu();
    this.clickSubmenuOption(1);
  }

  addBelowViaContextMenu(taskName) {
    this.selectTask(taskName);
    this.rightClickTask(taskName);
    this.openAddTaskSubmenu();
    this.clickSubmenuOption(2);
  }

  addChildViaContextMenu(taskName) {
    this.selectTask(taskName);
    this.rightClickTask(taskName);
    this.openAddTaskSubmenu();
    this.clickSubmenuOption(3);
  }

  deleteViaContextMenu(taskName) {
    this.selectTask(taskName);
    this.rightClickTask(taskName);
    this.clickContextMenuItem(4);
    cy.wait(500);
    this.confirmDelete();
  }

  // --- Delete confirmation popup (task-level) ---

  confirmDelete() {
    cy.get(COMMON.modalDangerButton).click();
    cy.wait(500);
  }

  // --- Side panel delete ---

  deleteViaSidePanel(taskName) {
    this.selectTask(taskName);
    this.deleteButton.click();
    cy.wait(500);
    this.confirmDelete();
  }

  // --- Rename task ---

  renameTask(currentName, newName) {
    this.doubleClickTask(currentName);
    this.taskInlineInput.clear().type(newName + "{enter}");
    cy.wait(500);
  }

  // --- Cell editing on currently selected task row ---

  getSelectedTaskCell(columnIndex) {
    return cy.get(`${TASK.ganttSelectedRow} > div:nth-child(${columnIndex})`);
  }

  editSelectedTaskDate(columnIndex, dateValue) {
    // Native <input type="date"> requires YYYY-MM-DD for cy.type(),
    // and rejects {enter}. Commit by clicking on the task name cell
    // (any other cell) to blur the date input.
    this.getSelectedTaskCell(columnIndex).dblclick();
    cy.get(TASK.taskDateInput).clear();
    cy.get(TASK.taskDateInput).type(dateValue);
    this.getSelectedTaskCell(TASK_COLUMNS.NAME).click();
    cy.wait(500)
  }

  editSelectedTaskNumber(columnIndex, value) {
    this.getSelectedTaskCell(columnIndex).dblclick();
    cy.get(TASK.taskNumberInput).clear().type(`${value}{enter}`);
    cy.wait(500);
  }

  editSelectedTaskText(columnIndex, value) {
    this.getSelectedTaskCell(columnIndex).dblclick();
    cy.get(TASK.taskInlineInput).clear().type(`${value}{enter}`);
    cy.wait(500);
  }

  setStartDate(dateValue) {
    this.editSelectedTaskDate(TASK_COLUMNS.START_DATE, dateValue);
  }

  setEndDate(dateValue) {
    this.editSelectedTaskDate(TASK_COLUMNS.END_DATE, dateValue);
  }

  // Read the current end date from the cell and offset it by N days
  adjustEndDate(daysOffset) {
    this.getSelectedTaskCell(TASK_COLUMNS.END_DATE)
      .invoke("text")
      .then((currentText) => {
        const newDate = formatDate(
          addDays(daysOffset, parseDisplayDate(currentText)),
        );
        this.setEndDate(newDate);
      });
  }

  adjustStartDate(daysOffset) {
    this.getSelectedTaskCell(TASK_COLUMNS.START_DATE)
      .invoke("text")
      .then((currentText) => {
        const newDate = formatDate(
          addDays(daysOffset, parseDisplayDate(currentText)),
        );
        this.setStartDate(newDate);
      });
  }

  setDuration(days) {
    this.editSelectedTaskText(TASK_COLUMNS.DURATION, days);
  }

  setPercent(percent) {
    this.editSelectedTaskNumber(TASK_COLUMNS.PERCENT, percent);
  }

  toggleOnHold() {
    // The On Hold checkbox sits inside the cell — click the inner wrapper
    this.getSelectedTaskCell(TASK_COLUMNS.ON_HOLD).find("div > div").click();
    cy.wait(500);
  }

  // --- Status helpers ---

  getSelectedTaskStatus() {
    return this.getSelectedTaskCell(TASK_COLUMNS.STATUS);
  }

  // Status verification using data-column-index attr — used after closing
  // the side panel (when columns shift to the without-side layout)
  verifyTaskStatusByDataIndex(expectedStatus) {
    cy.get(TASK.selectedRowStatusByDataIndex)
      .invoke("text")
      .then((text) => {
        expect(text.trim().toUpperCase()).to.include(
          expectedStatus.toUpperCase(),
        );
      });
  }

  verifyTaskStatus(expectedStatus) {
    if (!expectedStatus || expectedStatus.toUpperCase() === "BLANK") {
      this.getSelectedTaskStatus().invoke("text").then((text) => {
        expect(text.trim()).to.equal("");
      });
    } else {
      // Case-insensitive comparison — UI may render "OverDue" while constants use "OVERDUE"
      this.getSelectedTaskStatus().invoke("text").then((text) => {
        expect(text.trim().toUpperCase()).to.include(
          expectedStatus.toUpperCase(),
        );
      });
    }
  }

  // Verify status across every task row (e.g. parent + children)
  verifyAllTasksStatus(expectedStatus) {
    const statusSelector = `${TASK.ganttTaskRows} > div:nth-child(${TASK_COLUMNS.STATUS}) > div`;
    cy.get(statusSelector).each(($el) => {
      const text = $el.text().trim();
      if (!expectedStatus || expectedStatus.toUpperCase() === "BLANK") {
        expect(text).to.equal("");
      } else {
        expect(text.toUpperCase()).to.include(expectedStatus.toUpperCase());
      }
    });
  }

  // Select the last (most recently created) task row in the gantt grid
  selectLastTask() {
    cy.get(TASK.ganttTaskRows).last().click();
    cy.wait(500);
  }

  // Select the first task row in the gantt grid
  selectFirstTask() {
    cy.get(TASK.ganttTaskRows).first().click();
    cy.wait(500);
  }

  verifyDuration(expectedDays) {
    this.getSelectedTaskCell(TASK_COLUMNS.DURATION).should(
      "contain.text",
      String(expectedDays),
    );
  }

  verifyAllTasksDuration(expectedDays) {
    const durationSelector = `${TASK.ganttTaskRows} > div:nth-child(${TASK_COLUMNS.DURATION})`;
    cy.get(durationSelector).each(($el) => {
      expect($el.text().trim()).to.include(String(expectedDays));
    });
  }

  // --- Validation helpers ---

  verifyTaskExists(taskName) {
    this.ganttGridData.should("contain.text", taskName);
  }

  verifyTaskDoesNotExist(taskName) {
    this.ganttGridData.should("not.contain.text", taskName);
  }

  getTaskRows() {
    return cy.get(TASK.ganttRows);
  }

  getTaskCount() {
    return this.getTaskRows();
  }

  verifyTaskCount(expectedCount) {
    this.getTaskRows().should("have.length", expectedCount);
  }
}

export default new TaskCreationPage();
