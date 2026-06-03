import { COORDINATION_FILES, COMMON } from "../../support/selectors";

class CoordinationFilesPage {
  // ── Upload ─────────────────────────────────────────────────────────────

  clickUpload() {
    cy.get(COORDINATION_FILES.uploadButton).click();
    cy.wait(1000);
  }

  clickUploadFile() {
    cy.get(COORDINATION_FILES.uploadFileOption).click();
    cy.wait(1000);
  }

  clickUploadFolder() {
    cy.get(COORDINATION_FILES.uploadFolderOption).click();
    cy.wait(1000);
  }

  clickUploadTemplate() {
    cy.get(COORDINATION_FILES.uploadTemplateOption).click();
    cy.wait(2000);
  }

  uploadSingleFile(fixtureFileName) {
    this.clickUpload();
    this.clickUploadFile();
    cy.get("input[type='file']").last().selectFile(
      `cypress/fixtures/${fixtureFileName}`,
      { force: true }
    );
    cy.wait(5000);
  }

  uploadMultipleFiles(fixtureFileNames) {
    this.clickUpload();
    this.clickUploadFile();
    const filePaths = fixtureFileNames.map(
      (f) => `cypress/fixtures/${f}`
    );
    cy.get("input[type='file']").last().selectFile(filePaths, {
      force: true,
    });
    cy.wait(5000);
  }

  uploadFolder(folderFiles) {
    // Cypress selectFile does not set webkitRelativePath, so the app
    // cannot reconstruct the folder hierarchy. We read each file,
    // build File objects with webkitRelativePath, and dispatch them
    // to the hidden file input so the app sees a real folder upload.
    cy.on("window:confirm", () => true);
    this.clickUpload();
    this.clickUploadFolder();

    // Read all files sequentially and collect their data
    const filesData = [];
    const readChain = folderFiles.reduce(
      (chain, f) =>
        chain.then(() =>
          cy.readFile(f.contents, "binary").then((binary) => {
            filesData.push({
              binary,
              relativePath: f.fileName,
              name: f.fileName.split("/").pop(),
            });
          })
        ),
      cy.wrap(null)
    );

    readChain.then(() => {
      cy.get("input[type='file']")
        .last()
        .then(($input) => {
          const dataTransfer = new DataTransfer();
          filesData.forEach((f) => {
            const uint8 = new Uint8Array(f.binary.length);
            for (let i = 0; i < f.binary.length; i++) {
              uint8[i] = f.binary.charCodeAt(i);
            }
            const file = new File([uint8], f.name, {
              type: "application/octet-stream",
            });
            Object.defineProperty(file, "webkitRelativePath", {
              value: f.relativePath,
              writable: false,
            });
            dataTransfer.items.add(file);
          });
          $input[0].files = dataTransfer.files;
          $input[0].dispatchEvent(
            new Event("change", { bubbles: true })
          );
        });
    });

    cy.wait(10000);
    this.reloadPage();
  }

  // ── Verify uploads ────────────────────────────────────────────────────

  /**
   * Strip the extension from a filename.
   * "TestFile1.txt" → "TestFile1", "Report.pdf" → "Report"
   */
  stripExtension(fileName) {
    const dotIndex = fileName.lastIndexOf(".");
    return dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
  }

  verifyFileExists(fileName) {
    const baseName = this.stripExtension(fileName);
    cy.get(COORDINATION_FILES.filesList).should("contain.text", baseName);
  }

  verifyFolderExists(folderName) {
    cy.get(COORDINATION_FILES.foldersList).should(
      "contain.text",
      folderName
    );
  }

  verifyFileCount(expectedCount) {
    cy.get(COORDINATION_FILES.filesList)
      .find("cmacs-card")
      .should("have.length", expectedCount);
  }

  verifyFolderCount(expectedCount) {
    cy.get(COORDINATION_FILES.foldersList)
      .find("cmacs-card")
      .should("have.length", expectedCount);
  }

  // ── Open file / folder ────────────────────────────────────────────────

  openFirstFile() {
    // Double-click opens the file in a new tab.
    // Capture the new tab URL via window.open stub, then visit it.
    cy.window().then((win) => {
      cy.stub(win, "open").as("newTab");
    });
    cy.get(COORDINATION_FILES.fileCard).first().dblclick();
    cy.wait(2000);
    cy.get("@newTab").then((stub) => {
      if (stub.called) {
        const url = stub.firstCall.args[0];
        cy.visit(url);
        cy.wait(5000);
      }
    });
  }

  openFirstFolder() {
    cy.get(COORDINATION_FILES.folderCard).first().dblclick();
    cy.wait(3000);
  }

  selectFirstFile() {
    cy.get(COORDINATION_FILES.fileCard).first().click();
    cy.wait(500);
  }

  selectFirstFolder() {
    cy.get(COORDINATION_FILES.folderCard).first().click();
    cy.wait(500);
  }

  selectFileByName(fileName) {
    cy.get(COORDINATION_FILES.filesList)
      .contains("cmacs-card", fileName)
      .click();
    cy.wait(500);
  }

  selectFolderByName(folderName) {
    cy.get(COORDINATION_FILES.foldersList)
      .contains("cmacs-card", folderName)
      .click();
    cy.wait(500);
  }

  openFolderByName(folderName) {
    cy.get(COORDINATION_FILES.foldersList)
      .contains("cmacs-card", folderName)
      .dblclick();
    cy.wait(3000);
  }

  // ── File open verification ──────────────────────────────────────────

  verifyFileIsOpen() {
    // Verify the file viewer page has loaded
    cy.url().should("include", "/viewer/");
    cy.wait(5000);
  }

  // ── Import Template ───────────────────────────────────────────────────

  importTemplate() {
    this.clickUpload();
    this.clickUploadTemplate();
  }

  selectTemplateBySearch(templateName) {
    cy.get(COORDINATION_FILES.folderStructureTemplateDropdown).click();
    cy.wait(500);
    cy.get(".cmacs-select-search").clear().type(templateName);
    cy.wait(1000);
    cy.get(`${COMMON.overlayContainer} ul:visible li`)
      .contains(templateName)
      .click();
    cy.wait(1000);
  }

  expandTemplateFolder() {
    cy.get(COORDINATION_FILES.expandFolder).first().click();
    cy.wait(500);
  }

  selectAllTemplateFolders() {
    cy.get(COORDINATION_FILES.templateCheckbox).first().click();
    cy.wait(500);
  }

  clickImport() {
    cy.get(COORDINATION_FILES.importButton).click();
    cy.wait(10000);
  }

  // ── Download ──────────────────────────────────────────────────────────

  clickDownload() {
    cy.get(COORDINATION_FILES.downloadButton).click();
    cy.wait(3000);
  }

  // ── Add Folder ────────────────────────────────────────────────────────

  clickAddFolder() {
    cy.get(COORDINATION_FILES.addFolderButton).click();
    cy.wait(500);
  }

  clickNewFolderOption() {
    cy.get(COORDINATION_FILES.newFolderOption).click();
    cy.wait(1000);
  }

  enterFolderName(folderName) {
    cy.get(COORDINATION_FILES.newFolderInput).clear().type(folderName);
    cy.wait(500);
  }

  confirmNewFolder() {
    cy.get(COORDINATION_FILES.newFolderOkButton).click();
    cy.wait(2000);
  }

  createNewFolder(folderName) {
    this.clickAddFolder();
    this.clickNewFolderOption();
    this.enterFolderName(folderName);
    this.confirmNewFolder();
  }

  // ── Share ─────────────────────────────────────────────────────────────

  clickShare() {
    cy.get(COORDINATION_FILES.shareButton).click();
    cy.wait(2000);
  }

  selectOnlyFiles() {
    cy.get(COORDINATION_FILES.shareOnlyFiles).click();
    cy.wait(500);
  }

  selectFoldersAndFiles() {
    cy.get(COORDINATION_FILES.shareFoldersAndFiles).click();
    cy.wait(500);
  }

  clickShareNext() {
    cy.get(COORDINATION_FILES.shareNextButton).click();
    cy.wait(2000);
  }

  expandDocumentTree() {
    cy.get(COORDINATION_FILES.documentTreeExpand).first().click();
    cy.wait(1000);
  }

  selectDocumentFileCheckbox() {
    // Select a file checkbox (not a folder). Files have names with extensions.
    cy.get("cmacs-modal app-document-tree cmacs-tree cmacs-tree-node")
      .filter(":contains('.txt'), :contains('.pdf'), :contains('.xlsx'), :contains('.docx')")
      .first()
      .find("span.ant-tree-checkbox > span")
      .click();
    cy.wait(500);
  }

  enterShareTitle(title) {
    cy.get(COORDINATION_FILES.shareTitle).clear().type(title);
    cy.wait(500);
  }

  enterSharePassword(password) {
    cy.get(COORDINATION_FILES.sharePassword).clear().type(password);
    cy.wait(500);
  }

  setExpirationDate(dateString) {
    cy.get(COORDINATION_FILES.shareExpirationDate).click();
    cy.wait(500);
    // Clear existing date and type the new date
    cy.get(COORDINATION_FILES.shareExpirationDate)
      .find("input")
      .clear()
      .type(dateString);
    cy.wait(300);
    // Press Enter to confirm the date
    cy.get(COORDINATION_FILES.shareExpirationDate)
      .find("input")
      .type("{enter}");
    cy.wait(500);
  }

  enableIncludeDownloadLink() {
    cy.get(COORDINATION_FILES.shareIncludeDownloadLink).click();
    cy.wait(500);
  }

  clickGetShareableLinkTab() {
    cy.get(COORDINATION_FILES.getShareableLinkRadio).click({ force: true });
    cy.wait(1000);
  }

  getShareableLink() {
    return cy
      .get(COORDINATION_FILES.shareableLink)
      .invoke("attr", "href")
      .then((href) => {
        return href;
      });
  }

  clickShareViaPTB() {
    cy.get(COORDINATION_FILES.shareViaPTBButton).click();
    cy.wait(3000);
  }

  // ── Share review ──────────────────────────────────────────────────────

  verifyShareReviewInfo() {
    cy.get(COORDINATION_FILES.shareReviewInfo).should("be.visible");
  }

  clickDocumentsTab() {
    cy.get(COORDINATION_FILES.shareReviewDocumentsTab)
      .contains(/documents/i)
      .click();
    cy.wait(1000);
  }

  verifyDocumentInReview() {
    cy.get(COORDINATION_FILES.shareReviewDocumentContent).should("be.visible");
  }

  // ── Delete ────────────────────────────────────────────────────────────

  clickDelete() {
    cy.get(COORDINATION_FILES.deleteButton).click();
    cy.wait(1000);
  }

  confirmDelete() {
    // Click the primary confirm button in the delete confirmation modal
    cy.get("cmacs-modal .trans-model-footer button.ant-btn-primary")
      .last()
      .click();
    cy.wait(3000);
  }

  deleteSelectedItem() {
    this.clickDelete();
    this.confirmDelete();
  }

  // ── Rename ────────────────────────────────────────────────────────────

  clickRename() {
    cy.get(COORDINATION_FILES.renameButton).click();
    cy.wait(1000);
  }

  enterNewName(newName) {
    cy.get(COORDINATION_FILES.renameInput).clear().type(newName);
    cy.wait(500);
  }

  confirmRename() {
    cy.get(COORDINATION_FILES.renameOkButton).click();
    cy.wait(2000);
  }

  renameSelectedItem(newName) {
    this.clickRename();
    this.enterNewName(newName);
    this.confirmRename();
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  navigateToRootFolder() {
    cy.contains("Root Folder").first().click();
    cy.wait(3000);
  }

  // ── Utility ───────────────────────────────────────────────────────────

  reloadPage() {
    cy.reload();
    cy.wait(5000);
  }

  getExpirationDateString(daysFromNow) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }
}

export default new CoordinationFilesPage();
