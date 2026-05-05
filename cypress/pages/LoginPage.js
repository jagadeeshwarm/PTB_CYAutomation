import { LOGIN, COMMON } from "../support/selectors";

class LoginPage {
  get emailInput() {
    return cy.get(LOGIN.emailInput);
  }

  get passwordInput() {
    return cy.get(LOGIN.passwordInput);
  }

  get loginButton() {
    return cy.get(LOGIN.loginButton);
  }

  visit() {
    cy.visit("/account/login");
  }

  login(email, password) {
    this.emailInput.clear().type(email);
    this.passwordInput.clear().type(password);
    this.loginButton.click();
    cy.url().should("not.include", "/login");
  }

  closeModalIfPresent() {
    cy.wait(2000);
    cy.get("body").then(($body) => {
      if ($body.find(COMMON.releaseModalCookie).length > 0) {
        cy.get(COMMON.releaseModalCookie).click();
      }
    });
  }

  closeNotificationIfPresent() {
    cy.get("body").then(($body) => {
      if ($body.find(COMMON.notificationClose).length > 0) {
        cy.get(COMMON.notificationClose).first().click();
      }
    });
  }
}

export default new LoginPage();
