import 'cypress-axe';
import '@testing-library/cypress/add-commands';

Cypress.on('uncaught:exception', (err) => {
  if (err?.message?.includes('Hydration failed')) {
    return false;
  }
  return undefined;
});


