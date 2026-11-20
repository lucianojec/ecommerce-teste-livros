
describe('Carrinho de compras', () => {

  it('Deve exibir mensagem de carrinho vazio', () => {

    cy.intercept('GET', '**/api/v1/cart', {
      statusCode: 200,
      body: {
        data: {
          cart_items: []
        }
      }
    }).as('carregarCarrinho');

    cy.visit('/carrinho');

    cy.wait('@carregarCarrinho');

    cy.contains('Seu carrinho está vazio')
      .should('be.visible');

  });

  it('Deve redirecionar para login ao adicionar sem autenticação', () => {

    cy.intercept('GET', '**/api/v1/books*', {
      fixture: 'livros.json'
    }).as('listarLivros');

    cy.intercept('POST', '**/api/v1/cart', {
      statusCode: 401,
      body: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Faça login para continuar.'
        }
      }
    }).as('adicionarCarrinho');

    cy.visit('/livros');
    cy.wait('@listarLivros');

    cy.get('[data-testid="book-card"]')
      .first()
      .find('[data-testid="add-to-cart"]')
      .click();

    cy.wait('@adicionarCarrinho');

    cy.location('pathname')
      .should('eq', '/login');

  });

});
