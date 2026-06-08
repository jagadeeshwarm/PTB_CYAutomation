import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import coordinationFilesPage from "../../../pages/coordination/CoordinationFilesPage";

const SINGLE_FILE = "upload-test-files/SingleTestFile.txt";
const SINGLE_FILE_PATH = "cypress/fixtures/upload-test-files/SingleTestFile.txt";
const ORIGINAL_CONTENT = "Single upload test";
const MODIFIED_CONTENT = "Modified upload test - version 2";
const MULTIPLE_FILES = [
  "upload-test-files/TestFile1.txt",
  "upload-test-files/TestFile2.txt",
  "upload-test-files/TestFile3.txt",
];
const UPLOAD_FOLDER_FILES = [
  {
    contents: "cypress/fixtures/upload-test-folder/FolderFile1.txt",
    fileName: "upload-test-folder/FolderFile1.txt",
  },
  {
    contents: "cypress/fixtures/upload-test-folder/SubFolder1/SubFile1.txt",
    fileName: "upload-test-folder/SubFolder1/SubFile1.txt",
  },
  {
    contents: "cypress/fixtures/upload-test-folder/SubFolder2/SubFile2.txt",
    fileName: "upload-test-folder/SubFolder2/SubFile2.txt",
  },
];
const NEW_FOLDER_NAME = `NewFolder-${Date.now()}`;
const SHARE_TITLE = `Share-${Date.now()}`;
const SHARE_PASSWORD = "Password1234!";
const RENAME_FOLDER = `RenamedFolder-${Date.now()}`;
const RENAME_FILE = `RenamedFile-${Date.now()}`;

describe("Coordination - Files", () => {
  before(function () {
    // Ensure fixture file starts with original content
    cy.writeFile(SINGLE_FILE_PATH, ORIGINAL_CONTENT);
    cy.fixture("users").then((users) => {
      this.users = users;
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch("Automation Project 3");
      // Click on Workspaces and then click on Coordination
      dashboardPage.selectWorkspaceByName("Coordination");
    });
  });

  after(() => {
    // Reset fixture file back to original content after test run
    cy.writeFile(SINGLE_FILE_PATH, ORIGINAL_CONTENT);
  });

  // ── Upload Single File ──────────────────────────────────────────────────

  it("Step 1: Upload a single file and verify", () => {
    coordinationFilesPage.uploadSingleFile(SINGLE_FILE);
    coordinationFilesPage.verifyFileExists("SingleTestFile");
  });

  // ── Upload Multiple Files ───────────────────────────────────────────────

  it("Step 2: Upload multiple files and verify", () => {
    coordinationFilesPage.uploadMultipleFiles(MULTIPLE_FILES);
    coordinationFilesPage.verifyFileExists("TestFile1");
    coordinationFilesPage.verifyFileExists("TestFile2");
    coordinationFilesPage.verifyFileExists("TestFile3");
  });

  it("Step 3: Open an uploaded file and verify it opens", () => {
    coordinationFilesPage.openFirstFile();
    coordinationFilesPage.verifyFileIsOpen();
  });

  it("Step 4: Close the file tab and go back to files list", () => {
    cy.go("back");
    cy.wait(5000);
  });

  // ── Modify and re-upload file to create V2 ──────────────────────────────

  it("Step 4a: Modify SingleTestFile.txt and re-upload it", () => {
    cy.writeFile(SINGLE_FILE_PATH, MODIFIED_CONTENT);
    coordinationFilesPage.uploadSingleFile(SINGLE_FILE);
    coordinationFilesPage.verifyFileExists("SingleTestFile");
  });

  it("Step 4b: Open the file, select V1 and close", () => {
    coordinationFilesPage.openFirstFile();
    coordinationFilesPage.verifyFileIsOpen();
    coordinationFilesPage.selectVersion("V 1");
    cy.go("back");
    cy.wait(5000);
  });

  // ── Upload Folder ───────────────────────────────────────────────────────

  it("Step 5: Upload a folder with multiple folders and files", () => {
    coordinationFilesPage.uploadFolder(UPLOAD_FOLDER_FILES);
    coordinationFilesPage.verifyFolderExists("upload-test-folder");
  });

  it("Step 6: Open uploaded folder and verify contents", () => {
    coordinationFilesPage.openFolderByName("upload-test-folder");
    coordinationFilesPage.verifyFolderExists("SubFolder1");
    coordinationFilesPage.verifyFolderExists("SubFolder2");
    coordinationFilesPage.verifyFileExists("FolderFile1");
    // Navigate back to root
    coordinationFilesPage.navigateToRootFolder();
  });

  // ── Import Template ─────────────────────────────────────────────────────

  it("Step 7: Import a folder structure template", () => {
    coordinationFilesPage.importTemplate();
    coordinationFilesPage.selectTemplateBySearch("Test_MJ2");
    coordinationFilesPage.expandTemplateFolder();
    coordinationFilesPage.selectAllTemplateFolders();
    coordinationFilesPage.clickImport();
    // Template import takes time, reload to verify
    coordinationFilesPage.reloadPage();
  });

  // ── Download ────────────────────────────────────────────────────────────

  it("Step 8: Click Download to get the download link", () => {
    coordinationFilesPage.selectFirstFile();
    coordinationFilesPage.clickDownload();
    // Download triggers an email with the link
    cy.wait(3000);
  });

  // ── Add New Folder ──────────────────────────────────────────────────────

  it("Step 9: Create a new folder", () => {
    coordinationFilesPage.createNewFolder(NEW_FOLDER_NAME);
    coordinationFilesPage.verifyFolderExists(NEW_FOLDER_NAME);
  });

  it("Step 10: Open new folder and upload folder with files", () => {
    coordinationFilesPage.openFolderByName(NEW_FOLDER_NAME);
    coordinationFilesPage.uploadFolder(UPLOAD_FOLDER_FILES);
    coordinationFilesPage.verifyFolderExists("upload-test-folder");
  });

  it("Step 11: Upload separate files in the new folder", () => {
    coordinationFilesPage.uploadMultipleFiles(MULTIPLE_FILES);
    cy.wait(3000);
  });

  it("Step 12: Verify folder and files are uploaded in the new folder", () => {
    coordinationFilesPage.verifyFolderExists("upload-test-folder");
    coordinationFilesPage.verifyFileExists("TestFile1");
    coordinationFilesPage.verifyFileExists("TestFile2");
    coordinationFilesPage.verifyFileExists("TestFile3");
    // Navigate back to root
    coordinationFilesPage.navigateToRootFolder();
  });

  // ── Share - Only Files ──────────────────────────────────────────────────

  it("Step 13: Click Share and select Only Files", () => {
    coordinationFilesPage.clickShare();
    coordinationFilesPage.selectOnlyFiles();
    coordinationFilesPage.clickShareNext();
  });

  it("Step 14: Expand all folders and select the last file", () => {
    coordinationFilesPage.selectDocumentFileCheckbox();
    coordinationFilesPage.clickShareNext();
  });

  it("Step 15: Enter share title, password, expiration date and enable download link", () => {
    const expirationDate =
      coordinationFilesPage.getExpirationDateString(5);
    coordinationFilesPage.enterShareTitle(SHARE_TITLE);
    coordinationFilesPage.enterSharePassword(SHARE_PASSWORD);
    coordinationFilesPage.setExpirationDate(expirationDate);
    coordinationFilesPage.enableIncludeDownloadLink();
    coordinationFilesPage.clickShareNext();
  });

  it("Step 16: Click Get Shareable Link tab then Next to Review", () => {
    coordinationFilesPage.clickGetShareableLinkTab();
    coordinationFilesPage.clickShareNext();
  });

  it("Step 17: Verify Share Review - password and expiration date", () => {
    coordinationFilesPage.verifyShareReviewInfo();
  });

  it("Step 18: Click Documents tab and verify document", () => {
    coordinationFilesPage.clickDocumentsTab();
    coordinationFilesPage.verifyDocumentInReview();
  });

  it("Step 19: Share via PTB", () => {
    coordinationFilesPage.clickShareViaPTB();
  });

  // ── Share - Folders & Files ─────────────────────────────────────────────

  it("Step 20: Dismiss any leftover modal", () => {
    coordinationFilesPage.dismissModalIfPresent();
  });

  it("Step 21: Click Share again and select Folders & Files", () => {
    coordinationFilesPage.clickShare();
    coordinationFilesPage.selectFoldersAndFiles();
    coordinationFilesPage.clickShareNext();
  });

  it("Step 22: Expand document tree and select a folder", () => {
    coordinationFilesPage.selectDocumentFolderCheckbox();
    coordinationFilesPage.clickShareNext();
  });

  it("Step 23: Enter share settings for Folders & Files", () => {
    const shareTitle2 = `ShareFF-${Date.now()}`;
    const expirationDate =
      coordinationFilesPage.getExpirationDateString(5);
    coordinationFilesPage.enterShareTitle(shareTitle2);
    coordinationFilesPage.enterSharePassword(SHARE_PASSWORD);
    coordinationFilesPage.setExpirationDate(expirationDate);
    coordinationFilesPage.enableIncludeDownloadLink();
    coordinationFilesPage.clickShareNext();
  });

  it("Step 24: Click Get Shareable Link tab then Next to Review for Folders & Files", () => {
    coordinationFilesPage.clickGetShareableLinkTab();
    coordinationFilesPage.clickShareNext();
  });

  it("Step 25: Verify Share Review for Folders & Files", () => {
    coordinationFilesPage.verifyShareReviewInfo();
    coordinationFilesPage.clickDocumentsTab();
    coordinationFilesPage.verifyDocumentInReview();
    coordinationFilesPage.clickShareViaPTB();
  });

  // ── Rename Folder ───────────────────────────────────────────────────────

  it("Step 25b: Dismiss any leftover modal", () => {
    coordinationFilesPage.dismissModalIfPresent();
  });

  it("Step 26: Select the uploaded folder and rename it", () => {
    coordinationFilesPage.selectFolderByName("upload-test-folder");
    coordinationFilesPage.renameSelectedItem(RENAME_FOLDER);
    coordinationFilesPage.verifyFolderExists(RENAME_FOLDER);
  });

  // ── Rename File ─────────────────────────────────────────────────────────

  it("Step 27: Select an uploaded file and rename it", () => {
    coordinationFilesPage.selectFirstFile();
    coordinationFilesPage.renameSelectedItem(RENAME_FILE);
    coordinationFilesPage.verifyFileExists(RENAME_FILE);
  });

  // ── Delete All Files ──────────────────────────────────────────────────

  it("Step 28: Delete all files one by one", () => {
    coordinationFilesPage.deleteAllFiles();
  });

  // ── Delete All Folders ────────────────────────────────────────────────

  it("Step 29: Delete all folders one by one", () => {
    coordinationFilesPage.deleteAllFolders();
  });
});
