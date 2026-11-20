
describe('Autenticação de usuários', () => {

  it('Deve apresentar erro ao informar credenciais inválidas', () => {

    cy.intercept('POST', '**/api/v1/auth/login', {
      statusCode: 401,
      body: {
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'E-mail ou senha inválidos.'
        }
      }
    }).as('realizarLogin');

    cy.visit('/login');

    cy.get('[data-testid="login-email"]')
      .type('teste@example.com');

    cy.get('[data-testid="login-password"]')
      .type('senha-invalida');

    cy.get('[data-testid="login-submit"]')
      .click();

    cy.wait('@realizarLogin');

    cy.contains(
      '[role="status"]',
      'E-mail ou senha inválidos.'
    ).should('be.visible');

  });

});
