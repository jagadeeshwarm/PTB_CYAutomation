import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import projectCreationPage from "../../../pages/ProjectCreationPage";

const COMPANY_NAME = "Schuco India";
const LOCATION_SEARCH = "alt.f coworking space";
const LOCATION_LABEL = "alt.f coworking | Coworking Space In Financial District Hyderabad";
const PROJECT_NUMBER = `IMP-${Date.now()}`;

describe("Import Project Creation - Advanced Settings", () => {
  before(function () {
    cy.fixture("users").then((users) => {
      this.users = users;
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
    });
  });

  it("Step 1: Switch company to Schuco India", function () {
    projectCreationPage.switchCompany(
      COMPANY_NAME,
      this.users.testUser.password
    );
    dashboardPage.waitForPageLoad();
  });

  it("Step 2: Click New and select Import Project", () => {
    projectCreationPage.clickNewButton();
    projectCreationPage.clickImportProject();
  });

  it("Step 3: Upload import file", () => {
    projectCreationPage.uploadImportFile(
      "cypress/fixtures/Project Info Sheet Template Myhome 99 (1).xlsx"
    );
  });

  it("Step 4: Select Project Type - New Building and click Next", () => {
    projectCreationPage.selectProjectType("New Building");
    projectCreationPage.clickNext();
  });

  it("Step 5: Fill Basic Information - clear and enter Project Number", () => {
    projectCreationPage.clearAndTypeProjectNumber(PROJECT_NUMBER);
  });

  it("Step 6: Select Status - Active", () => {
    projectCreationPage.selectStatus("Active");
  });

  it("Step 7: Clear Start Date and select current date", () => {
    projectCreationPage.clearStartDate();
    projectCreationPage.selectCurrentStartDate();
  });

  it("Step 8: Click Next to go to Location screen", () => {
    projectCreationPage.clickNext();
  });

  it("Step 9: Search and select location", () => {
    projectCreationPage.setLocation(LOCATION_SEARCH, LOCATION_LABEL);
  });

  it("Step 10: Click Next to go to Sales screen", () => {
    projectCreationPage.clickNext();
  });

  it("Step 11: Verify Sales fields from imported data and click Next", () => {
    cy.get("sales-panel").should("be.visible");
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
    cy.wait(3000);
    dashboardPage.waitForPageLoad();
  });
});
