import { TASK, TASK_COLUMNS, TASK_COLUMN_HEADERS, COMMON } from "../../support/selectors";
import {
  formatDate,
  addDays,
  parseDisplayDate,
  nextWorkday,
  prevWorkday,
  diffWorkingDays,
} from "../../support/utils/dateUtils";

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

  rightClickLastTask() {
    this.getTaskRows().last().click();
    cy.wait(300);
    this.getTaskRows().last().rightclick();
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

  // Dynamically resolves the 1-based column index by reading the header element's
  // sibling position. Yields the index into the Cypress chain so callers can use it
  // inside a .then() callback without breaking Cypress's async model.
  // Usage: this._getColIndex(TASK_COLUMN_HEADERS.START_DATE).then(idx => { ... })
  _getColIndex(headerSelector) {
    return cy.get(headerSelector).invoke("index").then((i) => i + 1);
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
    cy.get(TASK.taskNumberInput).type("{selectall}").type(`${value}{enter}`);
    cy.wait(500);
  }

  editSelectedTaskText(columnIndex, value) {
    this.getSelectedTaskCell(columnIndex).dblclick();
    cy.get(TASK.taskInlineInput).clear().type(`${value}{enter}`);
    cy.wait(500);
  }

  setStartDate(dateValue) {
    // Resolve column position from the header element so the index stays
    // correct even if columns are reordered or hidden
    this._getColIndex(TASK_COLUMN_HEADERS.START_DATE).then((colIndex) => {
      this.getSelectedTaskCell(colIndex).dblclick();
      cy.get(TASK.taskDateInput).clear();
      cy.get(TASK.taskDateInput).type(dateValue);
      this.getSelectedTaskCell(TASK_COLUMNS.NAME).click();
      cy.wait(500);
    });
  }

  setEndDate(dateValue) {
    this._getColIndex(TASK_COLUMN_HEADERS.END_DATE).then((colIndex) => {
      this.getSelectedTaskCell(colIndex).dblclick();
      cy.get(TASK.taskDateInput).clear();
      cy.get(TASK.taskDateInput).type(dateValue);
      this.getSelectedTaskCell(TASK_COLUMNS.NAME).click();
      cy.wait(500);
    });
  }

  // Read the current end date from the cell and offset it by N days
  adjustEndDate(daysOffset) {
    this._getColIndex(TASK_COLUMN_HEADERS.END_DATE).then((colIndex) => {
      this.getSelectedTaskCell(colIndex)
        .invoke("text")
        .then((currentText) => {
          const newDate = formatDate(
            addDays(daysOffset, parseDisplayDate(currentText)),
          );
          this.setEndDate(newDate);
        });
    });
  }

  adjustStartDate(daysOffset) {
    this._getColIndex(TASK_COLUMN_HEADERS.START_DATE).then((colIndex) => {
      this.getSelectedTaskCell(colIndex)
        .invoke("text")
        .then((currentText) => {
          const newDate = formatDate(
            addDays(daysOffset, parseDisplayDate(currentText)),
          );
          this.setStartDate(newDate);
        });
    });
  }

  setDuration(days) {
    this._getColIndex(TASK_COLUMN_HEADERS.DURATION).then((colIndex) => {
      this.editSelectedTaskText(colIndex, days);
    });
  }

  setPercent(percent) {
    this._getColIndex(TASK_COLUMN_HEADERS.PERCENT).then((colIndex) => {
      this.editSelectedTaskNumber(colIndex, percent);
    });
  }

  toggleOnHold() {
    this._getColIndex(TASK_COLUMN_HEADERS.ON_HOLD).then((colIndex) => {
      this.getSelectedTaskCell(colIndex).find("div > div").click();
      cy.wait(500);
    });
  }

  // --- Status helpers ---

  getSelectedTaskStatus() {
    return this._getColIndex(TASK_COLUMN_HEADERS.STATUS).then((colIndex) =>
      cy.get(`${TASK.ganttSelectedRow} > div:nth-child(${colIndex})`),
    );
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

  verifyTaskStatusByRow(rowIndex, expectedStatus) {
    this._getColIndex(TASK_COLUMN_HEADERS.STATUS).then((colIndex) => {
      cy.get(TASK.ganttRows)
        .eq(rowIndex)
        .find(`> div:nth-child(${colIndex})`)
        .invoke("text")
        .then((text) => {
          const trimmedText = text.trim();
          if (!expectedStatus || expectedStatus.toUpperCase() === "BLANK") {
            expect(trimmedText).to.equal("");
          } else {
            expect(trimmedText.toUpperCase()).to.include(
              expectedStatus.toUpperCase(),
            );
          }
        });
    });
  }

  verifyTaskPercentByRow(rowIndex, expectedPercent) {
    this._getColIndex(TASK_COLUMN_HEADERS.PERCENT).then((colIndex) => {
      cy.get(TASK.ganttRows)
        .eq(rowIndex)
        .find(`> div:nth-child(${colIndex})`)
        .invoke("text")
        .then((text) => {
          expect(text.trim()).to.include(String(expectedPercent));
        });
    });
  }

  verifyTaskDurationByRow(rowIndex, expectedDays) {
    this._getColIndex(TASK_COLUMN_HEADERS.DURATION).then((colIndex) => {
      cy.get(TASK.ganttRows)
        .eq(rowIndex)
        .find(`> div:nth-child(${colIndex})`)
        .invoke("text")
        .then((text) => {
          expect(text.trim()).to.include(String(expectedDays));
        });
    });
  }

  verifyTaskDelayedByRow(rowIndex, expectedDays) {
    this._getColIndex(TASK_COLUMN_HEADERS.DELAYED).then((colIndex) => {
      cy.get(TASK.ganttRows)
        .eq(rowIndex)
        .find(`> div:nth-child(${colIndex})`)
        .invoke("text")
        .then((text) => {
          expect(text.trim()).to.include(String(expectedDays));
        });
    });
  }

  verifyTaskEndDatesEqual(firstRowIndex, secondRowIndex) {
    this._getColIndex(TASK_COLUMN_HEADERS.END_DATE).then((colIndex) => {
      cy.get(TASK.ganttRows)
        .eq(firstRowIndex)
        .find(`> div:nth-child(${colIndex})`)
        .invoke("text")
        .then((firstEndDate) => {
          cy.get(TASK.ganttRows)
            .eq(secondRowIndex)
            .find(`> div:nth-child(${colIndex})`)
            .invoke("text")
            .then((secondEndDate) => {
              expect(secondEndDate.trim()).to.equal(firstEndDate.trim());
            });
        });
    });
  }

  // Verify status across every task row (e.g. parent + children)
  verifyAllTasksStatus(expectedStatus) {
    this._getColIndex(TASK_COLUMN_HEADERS.STATUS).then((colIndex) => {
      cy.get(`${TASK.ganttTaskRows} > div:nth-child(${colIndex}) > div`).each(
        ($el) => {
          const text = $el.text().trim();
          if (!expectedStatus || expectedStatus.toUpperCase() === "BLANK") {
            expect(text).to.equal("");
          } else {
            expect(text.toUpperCase()).to.include(expectedStatus.toUpperCase());
          }
        },
      );
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
    this._getColIndex(TASK_COLUMN_HEADERS.DURATION).then((colIndex) => {
      this.getSelectedTaskCell(colIndex).should(
        "contain.text",
        String(expectedDays),
      );
    });
  }

  verifyAllTasksDuration(expectedDays) {
    this._getColIndex(TASK_COLUMN_HEADERS.DURATION).then((colIndex) => {
      cy.get(`${TASK.ganttTaskRows} > div:nth-child(${colIndex})`).each(
        ($el) => {
          expect($el.text().trim()).to.include(String(expectedDays));
        },
      );
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

  scrollGantt(position) {
    cy.get("body").then(($body) => {
      const $scrollbar = $body.find(TASK.ganttScrollbar);

      if ($scrollbar.length > 0) {
        cy.wrap($scrollbar.first()).scrollTo(position, {
          ensureScrollable: false,
        });
      } else {
        const $fallback = $body.find(TASK.ganttScrollbarFallback);
        if ($fallback.length > 0) {
          cy.wrap($fallback.first()).scrollTo(position, {
            ensureScrollable: false,
          });
        }
        // No scrollbar found — all columns are already visible, skip scroll
      }
    });

    cy.wait(500);
  }

  scrollGanttLeft() {
    this.scrollGantt("left");
  }

  scrollGanttRight() {
    this.scrollGantt("right");
  }

  selectTaskByRow(rowIndex) {
    cy.get(TASK.ganttTaskRows).eq(rowIndex).click();
    cy.wait(500);
  }

  getTaskCellByRowAndColumn(rowIndex, headerSelector) {
    return this._getColIndex(headerSelector).then((colIndex) =>
      cy.get(TASK.ganttTaskRows).eq(rowIndex).find(`> div:nth-child(${colIndex})`),
    );
  }

  setPercentForSelectedTask(percent) {
    this.scrollGanttLeft();
    this.setPercent(percent);
    this.scrollGanttRight();
  }

  setPercentForRow(rowIndex, percent) {
    this.selectTaskByRow(rowIndex);
    this.setPercentForSelectedTask(percent);
  }

  toggleOnHoldByRow(rowIndex) {
    this.scrollGanttRight();
    this.selectTaskByRow(rowIndex);
    this.toggleOnHold();
  }

  verifyVisibleRowsByNameAndStatus(expectedTaskNames, expectedStatus) {
    cy.get(TASK.ganttTaskRows).should("have.length", expectedTaskNames.length);
    this.scrollGanttLeft();

    expectedTaskNames.forEach((taskName, rowIndex) => {
      cy.get(TASK.ganttTaskRows).eq(rowIndex).should("contain.text", taskName);
    });

    this.scrollGanttRight();
    expectedTaskNames.forEach((_, rowIndex) => {
      this.verifyTaskStatusByRow(rowIndex, expectedStatus);
    });
  }

  verifyTaskCount(expectedCount) {
    this.getTaskRows().should("have.length", expectedCount);
  }

  // In dhtmlx Gantt each row has one .gantt_tree_indent element.
  // Top-level rows use width: 0px; children use width > 0px.
  // Counting non-zero-width indents gives the number of child (nested) rows.
  // Reads the selected task's start and end dates from the grid cells, simulates
  // the app's weekend snap on the adjusted end, and returns the expected duration.
  // Call this BEFORE adjustEndDate() to get the value for your assertion.
  computeExpectedDurationAfterAdjust(daysOffset) {
    return this._getColIndex(TASK_COLUMN_HEADERS.START_DATE).then(
      (startColIdx) => {
        return this._getColIndex(TASK_COLUMN_HEADERS.END_DATE).then(
          (endColIdx) => {
            return this.getSelectedTaskCell(startColIdx)
              .invoke("text")
              .then((startText) => {
                const start = parseDisplayDate(startText);
                return this.getSelectedTaskCell(endColIdx)
                  .invoke("text")
                  .then((endText) => {
                    const end = parseDisplayDate(endText);
                    const newEnd =
                      daysOffset < 0
                        ? prevWorkday(addDays(daysOffset, end))
                        : nextWorkday(addDays(daysOffset, end));
                    return diffWorkingDays(start, newEnd);
                  });
              });
          },
        );
      },
    );
  }

  verifyIndentedTaskCount(expectedCount) {
    cy.get(`${TASK.ganttRows} .gantt_tree_indent:not([style*="width: 0"])`)
      .should("have.length", expectedCount);
  }

  // --- Indent / Outdent via right-click context menu ---

  outdentTaskAtRow(rowIndex) {
    this.getTaskRows().eq(rowIndex).click();
    cy.wait(300);
    this.getTaskRows().eq(rowIndex).rightclick();
    cy.wait(500);
    cy.contains(".cdk-overlay-container li", /outdent/i).click();
    cy.wait(800);
  }

  indentTaskAtRow(rowIndex) {
    this.getTaskRows().eq(rowIndex).click();
    cy.wait(300);
    cy.get('[name="indent"] > .iconspan').click();
    cy.wait(800);
  }
}

export default new TaskCreationPage();
