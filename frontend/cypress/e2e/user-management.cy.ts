describe('User Management', () => {
  beforeEach(() => {
    cy.login('admin@banrimkwae.com', 'Admin123!');
    cy.visit('/users');
  });

  it('displays user list correctly', () => {
    cy.get('[data-testid="user-table"]').should('be.visible');
    cy.get('[data-testid="user-row"]').should('have.length.at.least', 1);
    
    // Check table headers
    cy.contains('th', 'Name').should('be.visible');
    cy.contains('th', 'Email').should('be.visible');
    cy.contains('th', 'Role').should('be.visible');
    cy.contains('th', 'Status').should('be.visible');
  });

  it('can search and filter users', () => {
    // Search by name
    cy.get('[data-testid="search-input"]').type('John');
    cy.get('[data-testid="user-row"]').should('contain', 'John');
    
    // Clear search
    cy.get('[data-testid="search-input"]').clear();
    
    // Filter by role
    cy.get('[data-testid="role-filter"]').select('Admin');
    cy.get('[data-testid="user-row"]').each(($row) => {
      cy.wrap($row).should('contain', 'Admin');
    });
    
    // Filter by status
    cy.get('[data-testid="status-filter"]').select('Active');
    cy.get('[data-testid="user-row"]').each(($row) => {
      cy.wrap($row).should('contain', 'Active');
    });
  });

  it('can create a new user', () => {
    cy.get('[data-testid="add-user-btn"]').click();
    
    // Fill out form
    cy.get('#name').type('Test User');
    cy.get('#email').type('testuser@banrimkwae.com');
    cy.get('#phone').type('+66123456789');
    cy.get('#role_id').select('Staff');
    cy.get('#password').type('Password123!');
    cy.get('#password_confirmation').type('Password123!');
    
    // Submit form
    cy.get('[data-testid="submit-btn"]').click();
    
    // Verify success
    cy.contains('User created successfully').should('be.visible');
    cy.contains('Test User').should('be.visible');
  });

  it('validates form inputs correctly', () => {
    cy.get('[data-testid="add-user-btn"]').click();
    
    // Try to submit empty form
    cy.get('[data-testid="submit-btn"]').click();
    
    // Check validation errors
    cy.contains('Name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('can edit user information', () => {
    // Click edit button for first user
    cy.get('[data-testid="user-row"]').first().within(() => {
      cy.get('[data-testid="edit-btn"]').click();
    });
    
    // Update information
    cy.get('#name').clear().type('Updated User Name');
    cy.get('#email').clear().type('updated@banrimkwae.com');
    
    // Save changes
    cy.get('[data-testid="submit-btn"]').click();
    
    // Verify update
    cy.contains('User updated successfully').should('be.visible');
    cy.contains('Updated User Name').should('be.visible');
  });

  it('can delete user with confirmation', () => {
    const userEmail = 'delete-test@banrimkwae.com';
    
    // First create a test user to delete
    cy.createUser({
      name: 'Delete Test User',
      email: userEmail,
      role: 'Staff',
    });
    
    cy.reload();
    
    // Find and delete the user
    cy.contains('[data-testid="user-row"]', userEmail).within(() => {
      cy.get('[data-testid="delete-btn"]').click();
    });
    
    // Confirm deletion
    cy.get('[data-testid="confirm-delete-btn"]').click();
    
    // Verify deletion
    cy.contains('User deleted successfully').should('be.visible');
    cy.contains(userEmail).should('not.exist');
  });

  it('handles pagination correctly', () => {
    // Assuming we have enough users for pagination
    cy.get('[data-testid="pagination"]').should('be.visible');
    
    // Test page navigation
    cy.get('[data-testid="next-page"]').click();
    cy.url().should('include', 'page=2');
    
    cy.get('[data-testid="prev-page"]').click();
    cy.url().should('include', 'page=1');
  });
});
