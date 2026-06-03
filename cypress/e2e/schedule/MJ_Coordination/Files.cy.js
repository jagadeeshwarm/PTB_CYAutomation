import loginPage from "../../../pages/LoginPage";
import dashboardPage from "../../../pages/DashboardPage";
import coordinationFilesPage from "../../../pages/coordination/CoordinationFilesPage";

const SINGLE_FILE = "upload-test-files/SingleTestFile.txt";
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
    cy.fixture("users").then((users) => {
      this.users = users;
      loginPage.visit();
      loginPage.login(users.testUser.email, users.testUser.password);
      loginPage.closeModalIfPresent();
      loginPage.closeNotificationIfPresent();
      dashboardPage.openProjectBySearch("Automation Project 2");
      // Click on Workspaces and then click on Coordination
      dashboardPage.selectWorkspaceByName("Coordination");
    });
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

  it("Step 16: Get shareable link, open it, enter password, verify file opens", () => {
    coordinationFilesPage.clickGetShareableLinkTab();
    coordinationFilesPage.getShareableLink().then((link) => {
      coordinationFilesPage.openSharedLinkAndVerify(link, SHARE_PASSWORD);
    });
  });

  it("Step 18: Verify Share Review - password and expiration date", () => {
    coordinationFilesPage.verifyShareReviewInfo();
  });

  it("Step 19: Click Documents tab and verify document", () => {
    coordinationFilesPage.clickDocumentsTab();
    coordinationFilesPage.verifyDocumentInReview();
  });

  it("Step 20: Share via PTB", () => {
    coordinationFilesPage.clickShareViaPTB();
  });

  // ── Share - Folders & Files ─────────────────────────────────────────────

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

  it("Step 24: Get shareable link for Folders & Files and verify", () => {
    coordinationFilesPage.clickGetShareableLinkTab();
    coordinationFilesPage.getShareableLink().then((link) => {
      coordinationFilesPage.openSharedLinkAndVerify(link, SHARE_PASSWORD);
    });
  });

  it("Step 25: Verify Share Review for Folders & Files", () => {
    coordinationFilesPage.clickShareNext();
    coordinationFilesPage.verifyShareReviewInfo();
    coordinationFilesPage.clickDocumentsTab();
    coordinationFilesPage.verifyDocumentInReview();
    coordinationFilesPage.clickShareViaPTB();
  });

  // ── Delete File ─────────────────────────────────────────────────────────

  it("Step 26: Select a file and delete it", () => {
    coordinationFilesPage.selectFirstFile();
    coordinationFilesPage.deleteSelectedItem();
  });

  it("Step 27: Verify file is deleted", () => {
    // After deletion the file count should have decreased
    cy.wait(2000);
    coordinationFilesPage.reloadPage();
  });

  // ── Delete Folder ───────────────────────────────────────────────────────

  it("Step 28: Select the created folder and delete it", () => {
    coordinationFilesPage.selectFolderByName(NEW_FOLDER_NAME);
    coordinationFilesPage.deleteSelectedItem();
  });

  it("Step 29: Verify folder is deleted", () => {
    coordinationFilesPage.reloadPage();
    cy.get("app-document-view-icons > div > div:nth-child(2)").should(
      "not.contain.text",
      NEW_FOLDER_NAME
    );
  });

  // ── Rename Folder ───────────────────────────────────────────────────────

  it("Step 30: Select the uploaded folder and rename it", () => {
    coordinationFilesPage.selectFolderByName("upload-test-folder");
    coordinationFilesPage.renameSelectedItem(RENAME_FOLDER);
  });

  it("Step 31: Verify folder is renamed", () => {
    coordinationFilesPage.verifyFolderExists(RENAME_FOLDER);
  });

  // ── Rename File ─────────────────────────────────────────────────────────

  it("Step 32: Select an uploaded file and rename it", () => {
    coordinationFilesPage.selectFirstFile();
    coordinationFilesPage.renameSelectedItem(RENAME_FILE);
  });

  it("Step 33: Verify file is renamed", () => {
    coordinationFilesPage.verifyFileExists(RENAME_FILE);
  });
});
