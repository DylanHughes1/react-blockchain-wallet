describe('Mint flow validation', () => {
  it('disables mint button for invalid inputs', () => {
    cy.visit('/');
    cy.contains('Mint DAI');
    cy.get('[data-testid="mint-address-DAI"]').first().should('be.visible').and('not.be.disabled')
      .invoke('val', 'not-an-address').trigger('input');
    cy.get('[data-testid="mint-amount-DAI"]').first()
      .invoke('val', '1').trigger('input');
    cy.get('[data-testid="mint-submit-DAI"]').first().should('be.disabled');
  });

  it('enables mint for valid inputs (UI only)', () => {
    cy.visit('/');
    cy.get('[data-testid="mint-address-DAI"]').first().clear().type('0x1111111111111111111111111111111111111111');
    cy.get('[data-testid="mint-amount-DAI"]').first().clear().type('1');
    cy.get('[data-testid="mint-submit-DAI"]').first().should('not.be.disabled');
  });
});


