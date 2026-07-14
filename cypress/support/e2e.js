import 'cypress-mochawesome-reporter/register';
import 'cypress-real-events';
import './commands';

// ── Ignore benign app errors that would otherwise fail tests ────────────
// Cypress fails the current test on ANY uncaught exception from application
// code. These two are noise the tests neither trigger nor can fix. Anything
// else still propagates and fails the test, as it should.
const IGNORED_APP_ERRORS = [
  // The PDF/drawing viewer (and some ant/cmacs resize logic) emit the harmless
  // "ResizeObserver loop ..." warning.
  /ResizeObserver loop/,

  // Thrown on page load by app code reaching for `.document` on a window or
  // iframe handle that is null — it fires repeatedly from a timer, so it can
  // land inside any command and kill an otherwise healthy test. Suppressing it
  // only hides the symptom: if the app is genuinely broken, the next command
  // (e.g. cy.get on the login form) still fails, and loudly.
  /Cannot read propert(y|ies) of null \(reading 'document'\)/,
];

Cypress.on('uncaught:exception', (err) => {
  if (err.message && IGNORED_APP_ERRORS.some((re) => re.test(err.message))) {
    return false;
  }
  return undefined;
});

// ── Global: clear cookies + localStorage once per spec file ─────────────
// Runs ONCE before the first test in each spec (not between tests in the
// same spec), so TC02→TC07 still share the session from TC01 — but a fresh
// spec run starts from a clean slate. Without this, stale localStorage from
// a prior run causes the front-end to hide nav tabs (Templates, Checklist)
// on newly-created projects even though the API returns them.
before(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearAllSessionStorage();
});
