# Issue #03: API Documentation and Developer Portal

## Issue Overview
Create comprehensive API documentation system with interactive testing capabilities and a developer portal for onboarding external developers and managing API integrations.

## Priority: HIGH
**Estimated Time**: 4-5 days  
**Dependencies**: Issue #01 (API Gateway), Issue #02 (Authentication)  
**Assigned Module**: Documentation & Developer Experience  

## Detailed Requirements

### 1. Interactive API Documentation
**Objective**: Create comprehensive, searchable, and interactive API documentation

**Documentation Framework**:
```php
// Documentation Configuration
class APIDocumentationConfig {
    public string $title = 'Banrimkwae Resort API';
    public string $version = '1.0.0';
    public string $description = 'Comprehensive API for resort management operations';
    public array $servers = [
        'production' => 'https://api.banrimkwae.com',
        'staging' => 'https://staging-api.banrimkwae.com',
        'development' => 'https://dev-api.banrimkwae.com'
    ];
    public array $languages = ['en', 'th'];
    public array $authMethods = ['apiKey', 'oauth2', 'jwt'];
}
```

**OpenAPI Specification Structure**:
```yaml
# OpenAPI 3.0 Documentation Structure
openapi: 3.0.3
info:
  title: Banrimkwae Resort Management API
  version: 1.0.0
  description: |
    Comprehensive API for managing all aspects of Banrimkwae Resort operations
    including accommodations, activities, restaurant services, and inventory management.
    
    ## Authentication
    This API supports multiple authentication methods:
    - API Key authentication for server-to-server communication
    - OAuth 2.0 for third-party integrations
    - JWT tokens for mobile and web applications
    
    ## Rate Limiting
    All endpoints are subject to rate limiting based on your authentication method.
    See the rate limiting section for details.
    
  contact:
    name: API Support
    email: api-support@banrimkwae.com
    url: https://developers.banrimkwae.com
  license:
    name: Proprietary
    url: https://banrimkwae.com/api-license

servers:
  - url: https://api.banrimkwae.com/v1
    description: Production server
  - url: https://staging-api.banrimkwae.com/v1
    description: Staging server

tags:
  - name: Authentication
    description: User authentication and authorization
  - name: Users
    description: User management operations
  - name: Accommodations
    description: Room and accommodation booking
  - name: Activities
    description: Activity booking and management
  - name: Restaurant
    description: Menu and ordering operations
  - name: Inventory
    description: Stock and inventory management
  - name: Reports
    description: Analytics and reporting
```

**Documentation Database Schema**:
```sql
-- API Documentation Management
CREATE TABLE api_documentation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    endpoint_path VARCHAR(500) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    description_th TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    requires_auth BOOLEAN DEFAULT TRUE,
    required_permissions JSON,
    request_schema JSON,
    response_schema JSON,
    examples JSON,
    version VARCHAR(20) DEFAULT '1.0',
    is_deprecated BOOLEAN DEFAULT FALSE,
    deprecation_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_endpoint_method (endpoint_path, http_method),
    INDEX idx_category (category, subcategory),
    INDEX idx_version (version)
);

-- Code Examples for Different Languages
CREATE TABLE api_code_examples (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    documentation_id BIGINT,
    language VARCHAR(50) NOT NULL,
    framework VARCHAR(100),
    code_example LONGTEXT,
    description TEXT,
    is_complete_example BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documentation_id) REFERENCES api_documentation(id) ON DELETE CASCADE,
    INDEX idx_doc_language (documentation_id, language)
);

-- Documentation Feedback and Ratings
CREATE TABLE documentation_feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    documentation_id BIGINT,
    user_id BIGINT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    is_helpful BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documentation_id) REFERENCES api_documentation(id) ON DELETE CASCADE
);
```

### 2. Interactive Testing Interface
**Objective**: Provide in-browser API testing capabilities

**Testing Interface Components**:
```html
<!-- API Testing Interface Template -->
<div class="api-endpoint-testing">
    <!-- Request Configuration -->
    <div class="request-builder">
        <div class="method-url">
            <select class="http-method">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
            </select>
            <input type="text" class="endpoint-url" placeholder="/api/v1/accommodations">
        </div>
        
        <!-- Authentication -->
        <div class="auth-section">
            <select class="auth-method">
                <option value="none">No Authentication</option>
                <option value="api-key">API Key</option>
                <option value="bearer">Bearer Token</option>
                <option value="oauth2">OAuth 2.0</option>
            </select>
            <input type="text" class="auth-value" placeholder="Enter authentication credentials">
        </div>
        
        <!-- Headers -->
        <div class="headers-section">
            <h4>Request Headers</h4>
            <div class="header-inputs">
                <!-- Dynamic header key-value pairs -->
            </div>
        </div>
        
        <!-- Parameters -->
        <div class="parameters-section">
            <h4>Query Parameters</h4>
            <div class="parameter-inputs">
                <!-- Auto-generated from OpenAPI spec -->
            </div>
        </div>
        
        <!-- Request Body -->
        <div class="request-body-section">
            <h4>Request Body</h4>
            <textarea class="json-editor" placeholder="Enter JSON request body"></textarea>
        </div>
        
        <!-- Send Request Button -->
        <button class="send-request-btn">Send Request</button>
    </div>
    
    <!-- Response Display -->
    <div class="response-display">
        <div class="response-status">
            <span class="status-code"></span>
            <span class="response-time"></span>
        </div>
        <div class="response-headers">
            <h4>Response Headers</h4>
            <pre class="headers-display"></pre>
        </div>
        <div class="response-body">
            <h4>Response Body</h4>
            <pre class="json-response"></pre>
        </div>
    </div>
</div>
```

**Testing Interface JavaScript**:
```javascript
class APITester {
    constructor() {
        this.baseURL = window.location.origin;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.querySelector('.send-request-btn').addEventListener('click', () => {
            this.sendRequest();
        });
        
        document.querySelector('.auth-method').addEventListener('change', (e) => {
            this.updateAuthInterface(e.target.value);
        });
    }
    
    async sendRequest() {
        const config = this.buildRequestConfig();
        const startTime = Date.now();
        
        try {
            const response = await fetch(config.url, config.options);
            const endTime = Date.now();
            const responseData = await response.json();
            
            this.displayResponse({
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                data: responseData,
                responseTime: endTime - startTime
            });
        } catch (error) {
            this.displayError(error);
        }
    }
    
    buildRequestConfig() {
        const method = document.querySelector('.http-method').value;
        const endpoint = document.querySelector('.endpoint-url').value;
        const authMethod = document.querySelector('.auth-method').value;
        const authValue = document.querySelector('.auth-value').value;
        const requestBody = document.querySelector('.json-editor').value;
        
        const headers = this.getRequestHeaders();
        
        // Add authentication headers
        if (authMethod === 'api-key') {
            headers['X-API-Key'] = authValue;
        } else if (authMethod === 'bearer') {
            headers['Authorization'] = `Bearer ${authValue}`;
        }
        
        const config = {
            url: `${this.baseURL}${endpoint}`,
            options: {
                method: method,
                headers: headers
            }
        };
        
        if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
            config.options.body = requestBody;
            headers['Content-Type'] = 'application/json';
        }
        
        return config;
    }
    
    displayResponse(response) {
        document.querySelector('.status-code').textContent = 
            `${response.status} ${response.statusText}`;
        document.querySelector('.response-time').textContent = 
            `${response.responseTime}ms`;
        document.querySelector('.headers-display').textContent = 
            JSON.stringify(response.headers, null, 2);
        document.querySelector('.json-response').textContent = 
            JSON.stringify(response.data, null, 2);
            
        // Syntax highlighting
        this.applySyntaxHighlighting();
    }
}
```

### 3. Developer Portal Implementation
**Objective**: Create comprehensive developer portal for API integration

**Portal Features**:

#### A. Developer Onboarding System
```php
class DeveloperPortal {
    public function registerDeveloper($data) {
        // Developer registration process
        $developer = new Developer([
            'name' => $data['name'],
            'email' => $data['email'],
            'company' => $data['company'],
            'use_case' => $data['use_case'],
            'expected_volume' => $data['expected_volume'],
            'integration_type' => $data['integration_type']
        ]);
        
        // Email verification process
        $this->sendVerificationEmail($developer);
        
        // Create default API key
        $apiKey = $this->generateDeveloperAPIKey($developer);
        
        return $developer;
    }
    
    public function onboardingWorkflow($developerId) {
        return [
            'welcome' => $this->sendWelcomeEmail($developerId),
            'quickstart' => $this->generateQuickstartGuide($developerId),
            'sandbox_access' => $this->provideSandboxAccess($developerId),
            'documentation' => $this->customizeDocumentation($developerId),
            'support_channel' => $this->setupSupportChannel($developerId)
        ];
    }
}
```

**Developer Portal Database Schema**:
```sql
-- Developer Registration and Management
CREATE TABLE developers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE,
    company_name VARCHAR(255),
    website VARCHAR(500),
    use_case TEXT,
    integration_type ENUM('web', 'mobile', 'server', 'iot'),
    expected_monthly_requests INT,
    status ENUM('pending', 'approved', 'suspended', 'rejected') DEFAULT 'pending',
    approved_by BIGINT NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status)
);

-- Developer Applications and Projects
CREATE TABLE developer_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    developer_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    app_type ENUM('web', 'mobile_ios', 'mobile_android', 'server', 'iot'),
    redirect_uris JSON,
    webhook_urls JSON,
    sandbox_mode BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE CASCADE
);

-- API Usage Analytics for Developers
CREATE TABLE developer_api_usage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    developer_id BIGINT,
    api_key_id BIGINT,
    endpoint VARCHAR(500),
    requests_count INT DEFAULT 0,
    errors_count INT DEFAULT 0,
    avg_response_time DECIMAL(8,2),
    date DATE,
    hour TINYINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (developer_id) REFERENCES developers(id) ON DELETE CASCADE,
    INDEX idx_developer_date (developer_id, date),
    INDEX idx_usage_analytics (developer_id, date, hour)
);
```

#### B. Self-Service API Key Management
```php
class DeveloperAPIKeyManager {
    public function createAPIKey($developerId, $applicationData) {
        $apiKey = APIKey::create([
            'developer_id' => $developerId,
            'application_id' => $applicationData['app_id'],
            'name' => $applicationData['key_name'],
            'description' => $applicationData['description'],
            'environment' => $applicationData['environment'], // sandbox, production
            'permissions' => $this->getDefaultPermissions($developerId),
            'rate_limit_per_minute' => $this->calculateRateLimit($developerId),
            'daily_quota' => $this->calculateDailyQuota($developerId),
            'expires_at' => now()->addYear()
        ]);
        
        return $apiKey;
    }
    
    public function manageKeyPermissions($keyId, $permissions) {
        $apiKey = APIKey::findOrFail($keyId);
        
        // Validate developer owns this key
        if (!$this->developerOwnsKey($apiKey)) {
            throw new UnauthorizedException();
        }
        
        // Validate requested permissions
        $allowedPermissions = $this->getAllowedPermissions($apiKey->developer);
        $validPermissions = array_intersect($permissions, $allowedPermissions);
        
        $apiKey->update(['permissions' => $validPermissions]);
        
        return $apiKey;
    }
}
```

### 4. Code Generation and SDKs
**Objective**: Generate client libraries and code examples

**SDK Generation System**:
```php
class SDKGenerator {
    protected array $supportedLanguages = [
        'php' => PhpSDKGenerator::class,
        'javascript' => JavaScriptSDKGenerator::class,
        'python' => PythonSDKGenerator::class,
        'java' => JavaSDKGenerator::class,
        'swift' => SwiftSDKGenerator::class,
        'kotlin' => KotlinSDKGenerator::class,
        'dart' => DartSDKGenerator::class
    ];
    
    public function generateSDK($language, $apiSpecification) {
        $generator = new $this->supportedLanguages[$language];
        
        return $generator->generate($apiSpecification);
    }
    
    public function generateCodeExamples($endpoint, $language) {
        $template = $this->getCodeTemplate($language);
        $example = $this->populateTemplate($template, $endpoint);
        
        return $example;
    }
}

class PhpSDKGenerator {
    public function generate($apiSpec) {
        return [
            'client' => $this->generateClient($apiSpec),
            'models' => $this->generateModels($apiSpec),
            'exceptions' => $this->generateExceptions($apiSpec),
            'examples' => $this->generateExamples($apiSpec)
        ];
    }
    
    private function generateClient($apiSpec) {
        return <<<PHP
<?php

namespace BanrimkwaeAPI;

class BanrimkwaeClient {
    private \$apiKey;
    private \$baseUrl;
    private \$httpClient;
    
    public function __construct(\$apiKey, \$environment = 'production') {
        \$this->apiKey = \$apiKey;
        \$this->baseUrl = \$this->getBaseUrl(\$environment);
        \$this->httpClient = new \\GuzzleHttp\\Client();
    }
    
    public function accommodations() {
        return new AccommodationResource(\$this);
    }
    
    public function activities() {
        return new ActivityResource(\$this);
    }
    
    public function restaurant() {
        return new RestaurantResource(\$this);
    }
    
    // ... other resource methods
}
PHP;
    }
}
```

### 5. Documentation Search and Navigation
**Objective**: Advanced search and navigation capabilities

**Search Implementation**:
```javascript
class DocumentationSearch {
    constructor() {
        this.searchIndex = null;
        this.initializeSearch();
    }
    
    async initializeSearch() {
        // Initialize full-text search with Lunr.js or similar
        this.searchIndex = lunr(function () {
            this.ref('id');
            this.field('title', { boost: 10 });
            this.field('description', { boost: 5 });
            this.field('endpoint');
            this.field('method');
            this.field('tags');
            this.field('examples');
            
            // Add all documentation entries to index
            documentationData.forEach(doc => {
                this.add(doc);
            });
        });
    }
    
    search(query) {
        const results = this.searchIndex.search(query);
        return results.map(result => {
            return documentationData.find(doc => doc.id === result.ref);
        });
    }
    
    filterByCategory(category) {
        return documentationData.filter(doc => doc.category === category);
    }
    
    filterByTags(tags) {
        return documentationData.filter(doc => 
            tags.some(tag => doc.tags.includes(tag))
        );
    }
}
```

**Advanced Navigation Features**:
```html
<!-- Documentation Navigation -->
<div class="doc-navigation">
    <!-- Search Bar -->
    <div class="search-section">
        <input type="text" id="doc-search" placeholder="Search API documentation...">
        <div class="search-filters">
            <select id="category-filter">
                <option value="">All Categories</option>
                <option value="authentication">Authentication</option>
                <option value="accommodations">Accommodations</option>
                <option value="activities">Activities</option>
                <option value="restaurant">Restaurant</option>
                <option value="inventory">Inventory</option>
            </select>
            <select id="method-filter">
                <option value="">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
            </select>
        </div>
    </div>
    
    <!-- Category Navigation -->
    <div class="category-nav">
        <ul class="nav-tree">
            <li class="nav-category">
                <span class="category-title">Authentication</span>
                <ul class="endpoint-list">
                    <li><a href="#auth-login">POST /auth/login</a></li>
                    <li><a href="#auth-refresh">POST /auth/refresh</a></li>
                </ul>
            </li>
            <!-- More categories -->
        </ul>
    </div>
    
    <!-- Quick Actions -->
    <div class="quick-actions">
        <button class="bookmark-btn">Bookmark</button>
        <button class="share-btn">Share</button>
        <button class="download-btn">Download PDF</button>
    </div>
</div>
```

## Technical Specifications

### Performance Requirements
- **Page Load Time**: Documentation pages load within 2 seconds
- **Search Response**: Search results display within 500ms
- **Interactive Testing**: API calls complete within network latency + 200ms
- **SDK Generation**: Client libraries generate within 30 seconds
- **Concurrent Users**: Support 500+ concurrent documentation users

### User Experience Requirements
- **Responsive Design**: Mobile and tablet compatibility
- **Accessibility**: WCAG 2.1 AA compliance
- **Multi-language**: English and Thai language support
- **Offline Capability**: Downloadable documentation for offline use
- **Progressive Web App**: PWA features for mobile experience

### Integration Requirements
- **OpenAPI Sync**: Automatic synchronization with API changes
- **Version Control**: Git integration for documentation versioning
- **CI/CD Integration**: Automated documentation deployment
- **Analytics Integration**: Usage tracking and improvement insights
- **Feedback System**: User feedback collection and management

## Implementation Steps

### Phase 1: Documentation Framework (1.5 days)
1. **OpenAPI Setup**
   - Configure OpenAPI 3.0 specification
   - Set up automated documentation generation
   - Create documentation database schema
   - Implement versioning system

2. **Basic Documentation Interface**
   - Create responsive documentation layout
   - Implement navigation and search
   - Set up multi-language support
   - Create basic styling and theming

### Phase 2: Interactive Testing (1.5 days)
1. **Testing Interface Development**
   - Build request configuration interface
   - Implement authentication testing
   - Create response display components
   - Add syntax highlighting and formatting

2. **Advanced Testing Features**
   - Save and share test configurations
   - Create test collections and suites
   - Implement code generation for tests
   - Add testing analytics and history

### Phase 3: Developer Portal (1.5 days)
1. **Portal Infrastructure**
   - Create developer registration system
   - Build onboarding workflow
   - Implement application management
   - Set up API key self-service

2. **Portal Features**
   - Developer dashboard and analytics
   - Community features and forums
   - Support ticket system
   - Knowledge base and FAQ

### Phase 4: Advanced Features (1 day)
1. **SDK Generation**
   - Implement code generation system
   - Create language-specific generators
   - Build download and package management
   - Set up automated SDK updates

2. **Search and Analytics**
   - Implement advanced search capabilities
   - Add usage analytics tracking
   - Create feedback collection system
   - Set up performance monitoring

## Quality Assurance

### Documentation Quality
- **Accuracy**: All examples work correctly
- **Completeness**: All endpoints documented
- **Clarity**: Clear descriptions and examples
- **Consistency**: Uniform documentation style
- **Accessibility**: Screen reader compatibility

### Testing Validation
- **Interactive Testing**: All endpoints testable
- **Authentication**: All auth methods work in testing
- **Error Handling**: Proper error display and handling
- **Performance**: Fast response times
- **Browser Compatibility**: Works across major browsers

### Developer Experience
- **Onboarding**: Smooth developer registration
- **Self-Service**: Independent API key management
- **Support**: Responsive help and support
- **Community**: Active developer engagement
- **Feedback Integration**: User suggestions implemented

## Success Criteria

### Functional Success Criteria
- [ ] Complete API documentation with interactive testing
- [ ] Developer portal with self-service capabilities
- [ ] Multi-language documentation (English/Thai)
- [ ] SDK generation for major programming languages
- [ ] Advanced search and navigation features
- [ ] Mobile-responsive design

### Performance Success Criteria
- [ ] Documentation loads within 2 seconds
- [ ] Search results appear within 500ms
- [ ] Interactive API testing works reliably
- [ ] Portal supports 500+ concurrent users
- [ ] SDK generation completes within 30 seconds

### User Experience Success Criteria
- [ ] Developers can onboard independently
- [ ] All API features are clearly documented
- [ ] Testing interface is intuitive and functional
- [ ] Mobile experience is fully functional
- [ ] Community features encourage engagement

This comprehensive documentation and developer portal system will significantly enhance developer experience, reduce integration time, and foster a strong developer community around the Banrimkwae Resort API ecosystem.
