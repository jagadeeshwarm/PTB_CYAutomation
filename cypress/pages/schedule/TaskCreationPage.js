import { TASK, COMMON } from "../../support/selectors";

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
