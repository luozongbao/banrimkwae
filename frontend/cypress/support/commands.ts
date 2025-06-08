// ***********************************************
// Custom commands for Cypress
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createUser(userData: {
        name: string;
        email: string;
        role: string;
      }): Chainable<void>;
      deleteUser(userId: string | number): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for successful login
    cy.url().should('not.include', '/login');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });
});

Cypress.Commands.add('createUser', (userData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('auth_token')}`,
      'Content-Type': 'application/json',
    },
    body: {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      password: 'Password123!',
      password_confirmation: 'Password123!',
    },
  });
});

Cypress.Commands.add('deleteUser', (userId) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/users/${userId}`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('auth_token')}`,
    },
  });
});
