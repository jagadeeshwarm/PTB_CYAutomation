import 'cypress-mochawesome-reporter/register';
import './commands';

// ── Global: clear cache before each test suite to avoid stale state ─────
before(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});
