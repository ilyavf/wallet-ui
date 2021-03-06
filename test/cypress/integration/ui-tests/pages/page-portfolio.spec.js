describe('Portfolio Test', () => {
  beforeEach(() => {
    cy.loginQA()
    cy.fixture('users').as('users')
  })

  it('user can create a portfolio', function () {
    cy.login(this.users.noPortfolio)
    cy.url().should('contain', '/portfolio')
    cy
      .get('[data-cy=message-box]')
      .should('contain', 'Manage your Portfolio')

    cy
      .contains('Receive')
      .should('have.id', 'createPortfolio')
      .should('have.attr', 'on:click', 'receiveFunds()')
  })

  it('user has portfolio', function () {
    cy.login(this.users.validUsers[0])

    cy.url().should('contain', '/portfolio')
    cy
      .get('[data-cy=my-portfolio]')
      .should('contain', 'My Portfolio')
  })

  it('user has no EQB', function () {
    cy.login(this.users.validUsers[2])
    cy.url().should('contain', '/portfolio')
    cy
      .get('[data-cy=loading-overlay]')
      .should('not.be.visible')
    cy.wait(5000)
    cy
      .get('.alert.alert-warning', { timeout: 1000 })
      .should('be.visible')
  })

  it('user has EQB', function () {
    cy.login(this.users.validUsers[3])

    cy.url().should('contain', '/portfolio')
    cy
      .get('[data-cy=loading-overlay]')
      .should('not.be.visible')

    cy
      .get('[data-cy=no-funds-alert]')
      .should('not.be.visible')
  })

  it('portfolio has send function which opens modal', function () {
    cy.login(this.users.validUsers[1])
    cy.url().should('contain', '/portfolio')
    cy
      .contains('Send')
      .should('have.attr', 'on:click', 'sendFunds()')
      .click()

    cy
      .get('[data-cy=send-modal-title]')
      .should('contain', 'Send')
  })

  it('portfolio has receive function which opens modal', function () {
    cy.login(this.users.validUsers[0])
    cy.url().should('contain', '/portfolio')
    cy
      .contains('Receive')
      .should('have.id', 'receiveFunds')
      .click()

    cy
      .get('[data-cy=receive-modal-title]')
      .should('contain', 'Receive')
  })
})
