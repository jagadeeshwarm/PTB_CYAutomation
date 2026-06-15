import 'cypress-mochawesome-reporter/register';
import 'cypress-real-events';
import './commands';

// ── Global: clear cookies + localStorage once per spec file ─────────────
// Runs ONCE before the first test in each spec (not between tests in the
// same spec), so TC02→TC07 still share the session from TC01 — but a fresh
// spec run starts from a clean slate. Without this, stale localStorage from
// a prior run causes the front-end to hide nav tabs (Templates, Checklist)
// on newly-created projects even though the API returns them.
before(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});
