import loginPage from "../../pages/LoginPage";
import dashboardPage from "../../pages/DashboardPage";
import projectCreationPage from "../../pages/ProjectCreationPage";

const COMPANY_NAME = "Schueco India";
const LOCATION = {
  line1: "alt.f coworking | Coworking Space In Financial District Hyderabad",
  city: "Nanakramguda",
  state: "Telangana",
  zip: "500032",
  country: "India",
};
const PROJECT_NAME = `Manual Project ${Date.now()}`;
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
      this.users.importUser.password,
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

  it("Step 4: Enter unique Project Name and Project Number", () => {
    projectCreationPage.clearAndTypeProjectName(PROJECT_NAME);
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
      LOCATION.country,
    );
  });

  it("Step 9: Click Next to go to Sales screen", () => {
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
    // After create, the app redirects to /app/project/portal/<projectId>.
    // Wait for that URL pattern instead of dashboardPage.waitForPageLoad()
    // — the latter waits for `project-bar` which only renders on the
    // project list page, not the portal landing.
    cy.url({ timeout: 20000 }).should(
      "match",
      /\/app\/project\/portal\/[0-9a-f-]{8,}/i,
    );
    cy.wait(2000);
  });
});
