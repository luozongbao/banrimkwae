describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('redirects unauthenticated users to login', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('allows valid login', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="email-input"]').type('admin@banrimkwae.com');
    cy.get('[data-testid="password-input"]').type('Admin123!');
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });

  it('shows error for invalid credentials', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="email-input"]').type('invalid@banrimkwae.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('handles logout correctly', () => {
    cy.login('admin@banrimkwae.com', 'Admin123!');
    cy.visit('/dashboard');
    
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-btn"]').click();
    
    cy.url().should('include', '/login');
    
    // Try to visit dashboard again - should redirect to login
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('persists authentication across browser refresh', () => {
    cy.login('admin@banrimkwae.com', 'Admin123!');
    cy.visit('/dashboard');
    
    cy.reload();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });

  it('validates login form fields', () => {
    cy.visit('/login');
    
    // Try to submit without filling fields
    cy.get('[data-testid="login-button"]').click();
    
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
    
    // Test invalid email format
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="login-button"]').click();
    
    cy.contains('Please enter a valid email').should('be.visible');
  });
});
