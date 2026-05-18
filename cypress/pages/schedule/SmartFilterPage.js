import { SMART_FILTER } from "../../support/selectors";

class SmartFilterPage {
  open() {
    cy.get(SMART_FILTER.filterButton).click();
    cy.get(SMART_FILTER.filterPopup).should("be.visible");
  }

  selectFilterValue(searchText, optionText = searchText) {
    cy.get(SMART_FILTER.filterSelectionDropdown).click();
    cy.get(SMART_FILTER.filterSearchInput)
      .should("be.visible")
      .type(`{selectall}${searchText}`);

    cy.contains(SMART_FILTER.filterOption, optionText)
      .should("be.visible")
      .click();
  }

  apply() {
    cy.get(SMART_FILTER.applyButton).click();
    cy.wait(1000);
  }

  closePopup() {
    cy.get(SMART_FILTER.filterPopup)
      .should("be.visible")
      .parents(".ant-modal-content")
      .find("> .ant-modal-close")
      .click();
    cy.get(SMART_FILTER.filterPopup).should("not.exist");
  }

  removeAppliedFilter() {
    cy.get(SMART_FILTER.removeFilterIcon).click();
    cy.wait(1000);
  }

  applyFilter(searchText, optionText = searchText) {
    this.open();
    this.selectFilterValue(searchText, optionText);
    this.apply();
    this.closePopup();
  }
}

export default new SmartFilterPage();
