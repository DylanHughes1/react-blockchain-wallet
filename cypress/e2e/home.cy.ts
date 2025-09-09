describe('Homepage', () => {
  it('loads and shows key sections', () => {
    cy.visit('/');
    cy.contains('DeFi Token Manager').should('be.visible');
    cy.contains('Account Panel').should('exist');
    cy.contains('Approve & Transfer').should('exist');
    cy.contains('Mint DAI').should('exist');
    cy.contains('Recent Events').should('exist');
  });
});


