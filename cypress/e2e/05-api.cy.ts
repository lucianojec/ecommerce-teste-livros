
describe('Testes de API - Livraria QA', () => {

  it('Deve rejeitar um limite de livros inválido', () => {

    cy.request({
      method: 'GET',
      url: '/api/v1/books?limit=0',
      failOnStatusCode: false
    }).then((response) => {

      expect(response.status).to.eq(422);

      expect(response.body.error.code)
        .to.eq('VALIDATION_ERROR');

    });

  });

  it('Deve impedir acesso à conta sem autenticação', () => {

    cy.clearCookies();

    cy.request({
      method: 'GET',
      url: '/api/v1/auth/me',
      failOnStatusCode: false
    }).then((response) => {

      expect(response.status).to.eq(401);

      expect(response.body.error.code)
        .to.eq('UNAUTHORIZED');

    });

  });

});
