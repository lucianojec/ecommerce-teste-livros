
describe('Página inicial - Livraria QA', () => {

  beforeEach(() => {
    cy.visit('/');
  });

  it('Deve exibir o título principal', () => {
    cy.get('h1')
      .should('contain.text', 'Sua próxima história')
      .and('contain.text', 'começa aqui.');
  });

  it('Deve navegar para o catálogo de livros', () => {
    cy.contains('a', 'Explorar livros').click();

    cy.location('pathname').should('eq', '/livros');

    cy.get('h1')
      .should('contain.text', 'Todos os livros');
  });

});
