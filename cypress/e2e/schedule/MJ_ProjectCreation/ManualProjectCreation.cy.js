import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import projectCreationPage from "../../../pages/ProjectCreationPage";

const COMPANY_NAME = "Schuco India";
const LOCATION_SEARCH = "alt.f coworking space";
const LOCATION_SELECTION =
  "alt.f coworking | Coworking Space In Financial District Hyderabad";
const PROJECT_NUMBER = `MAN-${Date.now()}`;

describe("Manual Project Creation - Advanced Settings", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      this.users = users;
      loginPage.visit();
      loginPage.login(users.importUser.email, users.importUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
    });
  });

  it("Step 1: Switch company to Schuco India", function () {
    projectCreationPage.switchCompany(
      COMPANY_NAME,
      this.users.importUser.password
    );
    dashboardPage.waitForPageLoad();
  });

  it("Step 2: Click New and then click Advanced", () => {
    projectCreationPage.clickNewButton();
    projectCreationPage.clickAdvanced();
  });

  it("Step 3: Select Project Type - New Building (default) and click Next", () => {
    projectCreationPage.selectProjectType("New Building");
    projectCreationPage.clickNext();
  });

  it("Step 4: Clear Project Number and enter a unique one", () => {
    projectCreationPage.clearAndTypeProjectNumber(PROJECT_NUMBER);
  });

  it("Step 5: Select Status - Active", () => {
    projectCreationPage.selectStatus("Active");
  });

  it("Step 6: Clear Start Date and select current date", () => {
    projectCreationPage.clearStartDate();
    projectCreationPage.selectCurrentStartDate();
  });

  it("Step 7: Click Next to go to Location screen", () => {
    projectCreationPage.clickNext();
  });

  it("Step 8: Search and select location from dropdown", () => {
    projectCreationPage.searchAndSelectLocation(
      LOCATION_SEARCH,
      LOCATION_SELECTION
    );
  });

  it("Step 9: Verify location fields are auto-filled", () => {
    cy.get("app-address form div:nth-child(2) input").should("not.have.value", "");
    cy.get("app-address form div:nth-child(3) input").should("not.have.value", "");
    cy.get("app-address form div:nth-child(4) div:nth-child(1) input").should("not.have.value", "");
    cy.get("app-address form div:nth-child(4) div:nth-child(2) input").should("not.have.value", "");
    cy.get("app-address form div:nth-child(5) input").should("not.have.value", "");
  });

  it("Step 10: Click Next to go to Sales screen", () => {
    projectCreationPage.clickNext();
  });

  it("Step 11: Sales screen - click Next", () => {
    projectCreationPage.clickNext();
  });

  it("Step 12: Contact Information - click Next", () => {
    projectCreationPage.clickNext();
  });

  it("Step 13: Select Folder Structure Template and click Next", () => {
    projectCreationPage.selectFirstFolderStructureTemplate();
    projectCreationPage.clickNext();
  });

  it("Step 14: Select Schedule Template and click Next", () => {
    projectCreationPage.selectFirstScheduleTemplate();
    projectCreationPage.clickNext();
  });

  it("Step 15: Select All Teams and click Next", () => {
    projectCreationPage.selectAllTeams();
    projectCreationPage.clickNext();
  });

  it("Step 16: Review and Create Project", () => {
    projectCreationPage.clickCreate();
    dashboardPage.waitForPageLoad();
  });
});
