// Custom commands

/**
 * Recover from the app's generic error page.
 *
 * The SPA occasionally renders its "Oops! ... 500" screen
 * (`.error-page-content`) when a route/EMS bootstrap request transiently fails
 * on the server — most visibly when opening the Element Management workspace or
 * the Batch/progress page. It's intermittent and self-heals on a refresh, which
 * is why it never shows up in manual testing but flakes the automated EMS specs.
 *
 * This mirrors that manual refresh: if the error page is showing (and the
 * expected `readySelector` isn't), reload and wait, up to `retries` times.
 * It's a no-op on a healthy page, so it's safe to call before any EMS
 * navigation assertion.
 *
 * @param {string} readySelector selector that exists once the page loaded OK
 * @param {{retries?: number, waitMs?: number}} [opts]
 */
Cypress.Commands.add(
  "recoverFromErrorPage",
  (readySelector, { retries = 3, waitMs = 3000 } = {}) => {
    const attempt = (remaining) => {
      cy.get("body", { log: false }).then(($body) => {
        const errored = $body.find(".error-page-content:visible").length > 0;
        const ready =
          $body.find(readySelector).filter(":visible").length > 0;
        if (errored && !ready && remaining > 0) {
          cy.log(
            `App error page detected — reloading (${remaining} retr${
              remaining === 1 ? "y" : "ies"
            } left)`
          );
          cy.reload();
          cy.wait(waitMs);
          attempt(remaining - 1);
        }
      });
    };
    attempt(retries);
  }
);
