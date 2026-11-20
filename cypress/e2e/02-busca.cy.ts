
describe('Pesquisa de livros', () => {

  beforeEach(() => {
    cy.viewport(1280, 800);
  });

  it('Deve pesquisar um livro pelo título', () => {

    // Simular a resposta da API do catálogo
    cy.intercept('GET', '**/api/v1/books*', {
      fixture: 'livros.json'
    }).as('consultarLivros');

    cy.visit('/livros');

    // Esperar a consulta inicial
    cy.wait('@consultarLivros');

    // Digitar e realizar a pesquisa
    cy.get('[data-testid="book-search"]')
      .type('Cypress');

    cy.contains('button', 'Buscar').click();

    // Verificar que a nova consulta recebeu a busca
    cy.wait('@consultarLivros')
      .its('request.url')
      .should('include', 'q=Cypress');

    // Validar os resultados apresentados
    cy.get('[data-testid="book-card"]')
      .should('have.length', 1)
      .first()
      .should('contain.text', 'Aprendendo Cypress');

  });

  it('Deve mostrar mensagem quando não encontrar livros', () => {

    cy.intercept('GET', '**/api/v1/books*', {
      statusCode: 200,
      body: {
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          total_pages: 0
        }
      }
    }).as('pesquisaVazia');

    cy.visit('/livros?q=livro-inexistente-123');

    cy.wait('@pesquisaVazia');

    cy.contains('Nenhum livro encontrado')
      .should('be.visible');

  });

});
