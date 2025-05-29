# Issue #12: Testing Infrastructure and Deployment Setup

## Issue Information
- **Issue ID**: #12
- **Priority**: High
- **Estimated Hours**: 18-22 hours
- **Assignee**: DevOps Engineer / Full-Stack Developer
- **Dependencies**: Issues #01-#11 (Complete Phase 1 Implementation)
- **Labels**: Testing, Deployment, CI/CD, Infrastructure, Quality Assurance

## Phase 1 Context
This issue establishes comprehensive testing infrastructure and deployment pipeline for the Banrimkwae Resort Management System Phase 1. It includes unit testing, integration testing, end-to-end testing, performance testing, and automated deployment workflows to ensure code quality and reliable releases.

## Objective
Create a robust testing and deployment infrastructure that:
- Ensures code quality through comprehensive testing
- Automates testing and deployment processes
- Provides performance monitoring and optimization
- Establishes security scanning and compliance
- Enables reliable production deployments
- Supports continuous integration and delivery

## Scope

### Core Features
1. **Testing Infrastructure**
   - Unit testing setup for frontend and backend
   - Integration testing for API endpoints
   - End-to-end testing for critical user flows
   - Performance testing and monitoring

2. **CI/CD Pipeline**
   - Automated testing on pull requests
   - Code quality checks and linting
   - Security vulnerability scanning
   - Automated deployment to staging/production

3. **Quality Assurance**
   - Code coverage reporting
   - Accessibility testing
   - Performance monitoring
   - Error tracking and logging

4. **Deployment Infrastructure**
   - Environment configuration management
   - Database migration automation
   - Asset optimization and CDN setup
   - Health checks and monitoring

## Technical Requirements

### Testing Technology Stack
- **Frontend Testing**: Jest, React Testing Library, Cypress
- **Backend Testing**: PHPUnit, Pest, Laravel Dusk
- **API Testing**: Postman/Newman, Insomnia
- **Performance Testing**: Lighthouse CI, K6
- **Accessibility**: axe-core, Pa11y
- **Code Coverage**: Istanbul, PHPUnit Coverage

### Infrastructure Technology Stack
- **CI/CD**: GitHub Actions, GitLab CI
- **Containerization**: Docker, Docker Compose
- **Monitoring**: New Relic, Sentry, LogRocket
- **Deployment**: AWS/DigitalOcean, Nginx, PM2
- **Database**: MySQL, Redis

## Implementation Plan

### Phase 1: Frontend Testing Setup (5-6 hours)

#### 1.1 Jest and React Testing Library Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
};

module.exports = createJestConfig(customJestConfig);
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

#### 1.2 Component Testing Examples
```typescript
// tests/components/UserManagement/UserTable.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserTable } from '@/components/UserManagement/UserTable';
import { mockUsers } from '../../mocks/users';

describe('UserTable Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderUserTable = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <UserTable users={mockUsers} {...props} />
      </QueryClientProvider>
    );
  };

  test('renders user table with correct data', () => {
    renderUserTable();
    
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('admin@banrimkwae.com')).toBeInTheDocument();
  });

  test('handles user deletion correctly', async () => {
    const onDelete = jest.fn();
    renderUserTable({ onDelete });
    
    const deleteButton = screen.getByRole('button', { name: /delete user/i });
    fireEvent.click(deleteButton);
    
    // Confirm deletion in modal
    const confirmButton = screen.getByRole('button', { name: /confirm delete/i });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('user-1');
    });
  });

  test('filters users by search term', async () => {
    renderUserTable();
    
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });
  });

  test('sorts users by different columns', async () => {
    renderUserTable();
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    await waitFor(() => {
      const userRows = screen.getAllByTestId('user-row');
      expect(userRows[0]).toHaveTextContent('Alice Johnson');
    });
  });
});
```

#### 1.3 Hook Testing
```typescript
// tests/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/contexts/AuthContext';

describe('useAuth Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );

  test('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('admin@banrimkwae.com', 'password123');
    });
    
    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  test('handles logout correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // First login
    act(() => {
      result.current.login('admin@banrimkwae.com', 'password123');
    });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    // Then logout
    act(() => {
      result.current.logout();
    });
    
    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
```

### Phase 2: Backend Testing Setup (4-5 hours)

#### 2.1 PHPUnit Configuration
```php
<?php
// phpunit.xml
<phpunit 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:noNamespaceSchemaLocation="./vendor/phpunit/phpunit/phpunit.xsd"
    bootstrap="vendor/autoload.php"
    colors="true"
>
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">./tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">./tests/Feature</directory>
        </testsuite>
    </testsuites>
    
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">./app</directory>
        </include>
        <exclude>
            <directory suffix=".php">./app/Console</directory>
            <file>./app/Http/Kernel.php</file>
        </exclude>
    </coverage>
    
    <php>
        <server name="APP_ENV" value="testing"/>
        <server name="BCRYPT_ROUNDS" value="4"/>
        <server name="CACHE_DRIVER" value="array"/>
        <server name="DB_CONNECTION" value="sqlite"/>
        <server name="DB_DATABASE" value=":memory:"/>
        <server name="MAIL_MAILER" value="array"/>
        <server name="QUEUE_CONNECTION" value="sync"/>
        <server name="SESSION_DRIVER" value="array"/>
        <server name="TELESCOPE_ENABLED" value="false"/>
    </php>
</phpunit>
```

#### 2.2 Model Testing
```php
<?php
// tests/Unit/Models/UserTest.php
namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_required_attributes()
    {
        $user = User::factory()->make([
            'name' => 'John Smith',
            'email' => 'john@banrimkwae.com',
            'phone' => '+66123456789',
        ]);

        $this->assertEquals('John Smith', $user->name);
        $this->assertEquals('john@banrimkwae.com', $user->email);
        $this->assertEquals('+66123456789', $user->phone);
    }

    public function test_user_belongs_to_role()
    {
        $role = Role::factory()->create(['name' => 'admin']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $this->assertInstanceOf(Role::class, $user->role);
        $this->assertEquals('admin', $user->role->name);
    }

    public function test_user_has_permissions_through_role()
    {
        $role = Role::factory()->create();
        $permission = Permission::factory()->create(['name' => 'view_users']);
        $role->permissions()->attach($permission);
        
        $user = User::factory()->create(['role_id' => $role->id]);

        $this->assertTrue($user->hasPermission('view_users'));
        $this->assertFalse($user->hasPermission('delete_users'));
    }

    public function test_user_can_check_multiple_permissions()
    {
        $role = Role::factory()->create();
        $permissions = Permission::factory()->count(3)->create();
        $role->permissions()->attach($permissions);
        
        $user = User::factory()->create(['role_id' => $role->id]);

        $this->assertTrue($user->hasAnyPermission([
            'permission_1',
            'permission_2',
        ]));
    }
}
```

#### 2.3 API Testing
```php
<?php
// tests/Feature/Api/UserManagementTest.php
namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Storage;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->adminRole = Role::factory()->create(['name' => 'admin']);
        $this->admin = User::factory()->create(['role_id' => $this->adminRole->id]);
        
        $this->actingAs($this->admin, 'sanctum');
    }

    public function test_can_list_users()
    {
        User::factory()->count(5)->create();

        $response = $this->getJson('/api/users');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'email',
                             'role',
                             'status',
                             'created_at'
                         ]
                     ],
                     'meta' => [
                         'current_page',
                         'total',
                         'per_page'
                     ]
                 ]);
    }

    public function test_can_create_user()
    {
        Storage::fake('avatars');
        $avatar = UploadedFile::fake()->image('avatar.jpg');

        $userData = [
            'name' => 'New User',
            'email' => 'newuser@banrimkwae.com',
            'phone' => '+66987654321',
            'role_id' => $this->adminRole->id,
            'avatar' => $avatar,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/users', $userData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'data' => [
                         'id',
                         'name',
                         'email',
                         'avatar_url'
                     ]
                 ]);

        $this->assertDatabaseHas('users', [
            'name' => 'New User',
            'email' => 'newuser@banrimkwae.com',
        ]);

        Storage::disk('avatars')->assertExists(
            'avatars/' . User::latest()->first()->avatar
        );
    }

    public function test_validates_user_creation_data()
    {
        $response = $this->postJson('/api/users', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => '123',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors([
                     'name',
                     'email',
                     'password'
                 ]);
    }

    public function test_can_update_user()
    {
        $user = User::factory()->create();

        $updateData = [
            'name' => 'Updated Name',
            'email' => 'updated@banrimkwae.com',
        ];

        $response = $this->putJson("/api/users/{$user->id}", $updateData);

        $response->assertStatus(200);
        
        $user->refresh();
        $this->assertEquals('Updated Name', $user->name);
        $this->assertEquals('updated@banrimkwae.com', $user->email);
    }

    public function test_can_delete_user()
    {
        $user = User::factory()->create();

        $response = $this->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_cannot_delete_own_account()
    {
        $response = $this->deleteJson("/api/users/{$this->admin->id}");

        $response->assertStatus(422)
                 ->assertJson([
                     'message' => 'Cannot delete your own account'
                 ]);
    }
}
```

### Phase 3: End-to-End Testing Setup (4-5 hours)

#### 3.1 Cypress Configuration
```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    fixturesFolder: 'cypress/fixtures',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      apiUrl: 'http://localhost:8000/api',
      adminEmail: 'admin@banrimkwae.com',
      adminPassword: 'Admin123!',
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    supportFile: 'cypress/support/component.js',
    specPattern: 'cypress/component/**/*.{js,jsx,ts,tsx}',
  },
});
```

#### 3.2 E2E Test Examples
```javascript
// cypress/e2e/user-management.cy.js
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

  it('can create a new user', () => {
    cy.get('[data-testid="add-user-btn"]').click();
    
    // Fill out form
    cy.get('#name').type('Test User');
    cy.get('#email').type('testuser@banrimkwae.com');
    cy.get('#phone').type('+66123456789');
    cy.get('#role_id').select('Staff');
    cy.get('#password').type('Password123!');
    cy.get('#password_confirmation').type('Password123!');
    
    // Upload avatar
    cy.get('#avatar').selectFile('cypress/fixtures/avatar.jpg');
    
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

  it('can search and filter users', () => {
    // Search by name
    cy.get('[data-testid="search-input"]').type('John');
    cy.get('[data-testid="user-row"]').should('contain', 'John');
    
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
});
```

#### 3.3 Authentication Flow Testing
```javascript
// cypress/e2e/authentication.cy.js
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
    
    cy.get('#email').type('admin@banrimkwae.com');
    cy.get('#password').type('Admin123!');
    cy.get('[data-testid="login-btn"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back, Admin').should('be.visible');
  });

  it('shows error for invalid credentials', () => {
    cy.visit('/login');
    
    cy.get('#email').type('invalid@banrimkwae.com');
    cy.get('#password').type('wrongpassword');
    cy.get('[data-testid="login-btn"]').click();
    
    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('handles logout correctly', () => {
    cy.login('admin@banrimkwae.com', 'Admin123!');
    cy.visit('/dashboard');
    
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-btn"]').click();
    
    cy.url().should('include', '/login');
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
});
```

### Phase 4: CI/CD Pipeline Setup (5-6 hours)

#### 4.1 GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '18'
  PHP_VERSION: '8.2'
  MYSQL_VERSION: '8.0'

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run type checking
      run: npm run type-check
      
    - name: Run unit tests
      run: npm run test:coverage
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: frontend
        
    - name: Build application
      run: npm run build
      
    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli@0.12.x
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: banrimkwae_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3
      
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: --health-cmd="redis-cli ping" --health-interval=10s --health-timeout=5s --health-retries=3
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: ${{ env.PHP_VERSION }}
        extensions: mbstring, dom, fileinfo, mysql, redis
        coverage: xdebug
        
    - name: Cache Composer packages
      uses: actions/cache@v3
      with:
        path: vendor
        key: ${{ runner.os }}-php-${{ hashFiles('**/composer.lock') }}
        restore-keys: |
          ${{ runner.os }}-php-
          
    - name: Install dependencies
      run: composer install --prefer-dist --no-progress
      
    - name: Copy environment file
      run: cp .env.testing .env
      
    - name: Generate application key
      run: php artisan key:generate
      
    - name: Run database migrations
      run: php artisan migrate --force
      env:
        DB_CONNECTION: mysql
        DB_HOST: 127.0.0.1
        DB_PORT: 3306
        DB_DATABASE: banrimkwae_test
        DB_USERNAME: root
        DB_PASSWORD: root
        
    - name: Run PHPStan analysis
      run: vendor/bin/phpstan analyse
      
    - name: Run PHP CS Fixer
      run: vendor/bin/php-cs-fixer fix --diff --dry-run
      
    - name: Run tests
      run: vendor/bin/phpunit --coverage-clover coverage.xml
      env:
        DB_CONNECTION: mysql
        DB_HOST: 127.0.0.1
        DB_PORT: 3306
        DB_DATABASE: banrimkwae_test
        DB_USERNAME: root
        DB_PASSWORD: root
        
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        flags: backend

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: ${{ env.PHP_VERSION }}
        extensions: mbstring, dom, fileinfo, mysql
        
    - name: Install frontend dependencies
      run: npm ci
      
    - name: Install backend dependencies
      run: composer install --prefer-dist --no-progress
      
    - name: Start services
      run: |
        cp .env.testing .env
        php artisan key:generate
        php artisan migrate --force
        php artisan db:seed
        php artisan serve &
        npm run build
        npm run start &
        
    - name: Wait for services
      run: |
        npx wait-on http://localhost:8000/api/health
        npx wait-on http://localhost:3000
        
    - name: Run Cypress tests
      run: npx cypress run
      env:
        CYPRESS_baseUrl: http://localhost:3000
        CYPRESS_apiUrl: http://localhost:8000/api
        
    - name: Upload Cypress screenshots
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: cypress-screenshots
        path: cypress/screenshots
        
    - name: Upload Cypress videos
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: cypress-videos
        path: cypress/videos

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high
        
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
        
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment..."
        # Add actual deployment commands here
        
  deploy-production:
    runs-on: ubuntu-latest
    needs: [frontend-tests, backend-tests, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Deploy to production
      run: |
        echo "Deploying to production environment..."
        # Add actual deployment commands here
```

#### 4.2 Docker Configuration
```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```dockerfile
# Dockerfile.backend
FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    mysql-client

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory contents
COPY . /var/www

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www

# Install dependencies
RUN composer install --optimize-autoloader --no-dev

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["php-fpm"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "9000:9000"
    environment:
      - DB_CONNECTION=mysql
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_DATABASE=banrimkwae
      - DB_USERNAME=root
      - DB_PASSWORD=secret
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mysql
      - redis
    volumes:
      - storage_data:/var/www/storage

  nginx:
    image: nginx:alpine
    ports:
      - "8000:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - storage_data:/var/www/storage
    depends_on:
      - backend

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_DATABASE=banrimkwae
      - MYSQL_ROOT_PASSWORD=secret
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
  storage_data:
```

### Phase 5: Performance and Monitoring Setup (4-5 hours)

#### 5.1 Performance Testing Configuration
```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/users',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

```javascript
// k6-performance-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests under 1.5s
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
  },
};

const BASE_URL = 'http://localhost:8000/api';

export function setup() {
  // Login and get auth token
  const loginRes = http.post(`${BASE_URL}/auth/login`, {
    email: 'admin@banrimkwae.com',
    password: 'Admin123!',
  });
  
  const authToken = loginRes.json('token');
  return { authToken };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.authToken}`,
    'Content-Type': 'application/json',
  };

  // Test dashboard endpoint
  const dashboardRes = http.get(`${BASE_URL}/dashboard/summary`, { headers });
  check(dashboardRes, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Test users endpoint
  const usersRes = http.get(`${BASE_URL}/users`, { headers });
  check(usersRes, {
    'users status is 200': (r) => r.status === 200,
    'users response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
```

#### 5.2 Monitoring and Logging Setup
```javascript
// lib/monitoring.js
import { Sentry } from '@sentry/nextjs';
import { LogRocket } from 'logrocket';

// Sentry configuration
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
});

// LogRocket configuration
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID);
  
  LogRocket.getSessionURL((sessionURL) => {
    Sentry.configureScope((scope) => {
      scope.setContext('LogRocket', { sessionURL });
    });
  });
}

// Performance monitoring
export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Custom error boundary
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.props.error && this.props.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

```php
<?php
// app/Http/Middleware/RequestLogging.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RequestLogging
{
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        
        $response = $next($request);
        
        $duration = microtime(true) - $startTime;
        
        Log::info('API Request', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => auth()->id(),
            'duration' => round($duration * 1000, 2) . 'ms',
            'status' => $response->getStatusCode(),
            'memory_usage' => round(memory_get_peak_usage(true) / 1024 / 1024, 2) . 'MB',
        ]);
        
        return $response;
    }
}
```

## Quality Assurance Checklist

### Code Quality
- [ ] ESLint and Prettier configured for frontend
- [ ] PHP CS Fixer and PHPStan configured for backend
- [ ] Code coverage targets met (>80% for critical components)
- [ ] Type safety enforced (TypeScript, PHP type hints)
- [ ] Security vulnerabilities scanned and resolved

### Testing Coverage
- [ ] Unit tests for all models and services
- [ ] Integration tests for all API endpoints
- [ ] Component tests for critical UI components
- [ ] E2E tests for primary user workflows
- [ ] Performance tests for key scenarios

### Performance Standards
- [ ] Frontend bundle size optimized (<250KB gzipped)
- [ ] Page load times under 3 seconds
- [ ] API response times under 500ms
- [ ] Database queries optimized
- [ ] Lighthouse scores above 80 for all categories

### Security Requirements
- [ ] Authentication and authorization tested
- [ ] Input validation and sanitization verified
- [ ] SQL injection protection confirmed
- [ ] XSS protection implemented
- [ ] CSRF protection enabled

### Accessibility Compliance
- [ ] WCAG 2.1 AA standards met
- [ ] Keyboard navigation functional
- [ ] Screen reader compatibility verified
- [ ] Color contrast ratios compliant
- [ ] Alternative text for images provided

## Deployment Infrastructure

### Environment Configuration
```yaml
# .env.production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.banrimkwae.com
NEXT_PUBLIC_WS_URL=wss://api.banrimkwae.com/ws
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_GA_TRACKING_ID=your-ga-id

# Backend environment
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.banrimkwae.com
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=banrimkwae_prod
REDIS_HOST=your-redis-host
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Health Check Endpoints
```php
<?php
// routes/web.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'version' => config('app.version'),
        'environment' => config('app.env'),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
        'redis' => Redis::ping() ? 'connected' : 'disconnected',
    ]);
});
```

```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  });
}
```

## Acceptance Criteria

### Testing Infrastructure
- [ ] Comprehensive test suite covers >80% of codebase
- [ ] All tests run automatically on pull requests
- [ ] Performance benchmarks established and monitored
- [ ] Security scans integrated into CI pipeline
- [ ] Accessibility tests automated

### CI/CD Pipeline
- [ ] Automated deployment to staging on develop branch
- [ ] Automated deployment to production on main branch
- [ ] Rollback mechanisms implemented
- [ ] Database migration automation working
- [ ] Environment configuration management secure

### Monitoring and Observability
- [ ] Error tracking and alerting configured
- [ ] Performance monitoring dashboards created
- [ ] Log aggregation and analysis setup
- [ ] Uptime monitoring implemented
- [ ] User session recording available

### Documentation
- [ ] Testing procedures documented
- [ ] Deployment processes documented
- [ ] Monitoring setup documented
- [ ] Troubleshooting guides created
- [ ] Runbooks for common operations available

## Dependencies

### External Services
- **Monitoring**: Sentry, LogRocket, New Relic
- **CI/CD**: GitHub Actions, Docker Hub
- **Testing**: Cypress Dashboard, BrowserStack
- **Security**: Snyk, Trivy, OWASP ZAP

### Internal Dependencies
- All Phase 1 issues (#01-#11) must be completed
- Database schema finalized
- API endpoints documented and stable
- Frontend components tested and functional

## Implementation Timeline

### Week 1: Foundation (5 days)
- Days 1-2: Frontend testing setup (Jest, RTL, component tests)
- Days 3-4: Backend testing setup (PHPUnit, API tests)
- Day 5: E2E testing framework setup (Cypress configuration)

### Week 2: CI/CD and Quality (5 days)
- Days 1-2: GitHub Actions workflow creation
- Days 3-4: Performance testing and monitoring setup
- Day 5: Security scanning integration

### Week 3: Deployment and Documentation (5 days)
- Days 1-2: Docker configuration and deployment scripts
- Days 3-4: Production environment setup
- Day 5: Documentation and final testing

This comprehensive testing and deployment setup ensures the Banrimkwae Resort Management System meets high standards for quality, performance, security, and reliability while enabling continuous delivery of features and improvements.
