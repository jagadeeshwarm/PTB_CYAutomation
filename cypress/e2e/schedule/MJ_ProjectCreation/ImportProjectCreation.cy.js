import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import projectCreationPage from "../../../pages/ProjectCreationPage";

const COMPANY_NAME = "Schuco India";
const IMPORT_FILE = "Central IKON_PIS_Latest_version.xlsx";
const LOCATION = {
  line1: "alt.f coworking | Coworking Space In Financial District Hyderabad",
  city: "Nanakramguda",
  state: "Telangana",
  zip: "500032",
  country: "India",
};
const PROJECT_NUMBER = `IMP-${Date.now()}`;

describe("Import Project Creation - Advanced Settings", () => {
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

  it("Step 2: Click New and then click Import Project", () => {
    projectCreationPage.clickNewButton();
    projectCreationPage.clickImportProject();
    projectCreationPage.importProjectFile(IMPORT_FILE);
  });

  it("Step 3: Select Project Type - New Building and click Next", () => {
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

  it("Step 8: Fill location fields", () => {
    projectCreationPage.fillLocationFields(
      LOCATION.line1,
      LOCATION.city,
      LOCATION.state,
      LOCATION.zip,
      LOCATION.country
    );
  });

  it("Step 9: Click Next to go to Sales screen", () => {
    projectCreationPage.clickNext();
  });

  it("Step 10: Verify Sales screen and click Next", () => {
    cy.get("sales-panel").should("be.visible");
    projectCreationPage.clickNext();
  });

  it("Step 11: Contact Information - click Next", () => {
    projectCreationPage.clickNext();
  });

  it("Step 12: Select Folder Structure Template and click Next", () => {
    projectCreationPage.selectFirstFolderStructureTemplate();
    projectCreationPage.clickNext();
  });

  it("Step 13: Select Schedule Template and click Next", () => {
    projectCreationPage.selectFirstScheduleTemplate();
    projectCreationPage.clickNext();
  });

  it("Step 14: Select All Teams and click Next", () => {
    projectCreationPage.selectAllTeams();
    projectCreationPage.clickNext();
  });

  it("Step 15: Review and Create Project", () => {
    projectCreationPage.clickCreate();
    dashboardPage.waitForPageLoad();
  });
});
