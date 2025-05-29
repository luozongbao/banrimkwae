# Issue #02: Authentication and Authorization System

## Issue Overview
Implement comprehensive authentication and authorization system for API access, supporting multiple authentication methods including API keys, OAuth 2.0, and JWT tokens with role-based access control.

## Priority: CRITICAL
**Estimated Time**: 4-6 days  
**Dependencies**: Issue #01 (API Gateway and Core Infrastructure)  
**Assigned Module**: Authentication & Security  

## Detailed Requirements

### 1. Multi-Method Authentication System
**Objective**: Support multiple authentication methods for different use cases

**Authentication Methods**:

#### A. API Key Authentication
```php
// API Key Structure
class ApiKey {
    public string $keyId;        // Public identifier
    public string $keySecret;    // Private secret
    public array $permissions;   // Allowed operations
    public array $scopes;        // Access scopes
    public int $rateLimitPer;   // Rate limit per minute
    public int $dailyQuota;     // Daily request quota
    public array $ipWhitelist;  // Allowed IP addresses
    public DateTime $expiresAt;  // Expiration date
}
```

**API Key Features**:
- **Secure Generation**: Cryptographically secure key generation
- **Key Rotation**: Automated and manual key rotation capabilities
- **Granular Permissions**: Module and operation-level access control
- **Usage Tracking**: Comprehensive usage analytics and monitoring
- **Emergency Revocation**: Immediate key deactivation capabilities

#### B. OAuth 2.0 Implementation
```php
// OAuth 2.0 Configuration
class OAuthConfig {
    public array $clients;       // Registered client applications
    public array $scopes;        // Available permission scopes
    public int $tokenLifetime;   // Access token lifetime
    public int $refreshLifetime; // Refresh token lifetime
    public array $grantTypes;    // Supported grant types
}
```

**OAuth 2.0 Grant Types**:
- **Authorization Code**: For web applications
- **Client Credentials**: For server-to-server communication
- **Refresh Token**: For token renewal
- **PKCE**: Enhanced security for mobile/SPA applications

#### C. JWT Token Management
```php
// JWT Configuration
class JWTConfig {
    public string $algorithm;    // Signing algorithm (RS256)
    public string $publicKey;    // Public key for verification
    public string $privateKey;   // Private key for signing
    public int $expiresIn;      // Token expiration time
    public string $issuer;       // Token issuer
    public array $audiences;     // Valid audiences
}
```

**JWT Features**:
- **Stateless Authentication**: No server-side session storage
- **Claims-based Authorization**: Role and permission claims
- **Token Refresh**: Automatic token renewal mechanisms
- **Cross-service Authentication**: Single token for all services

### 2. Role-Based Access Control (RBAC)
**Objective**: Implement comprehensive role-based permission system

**Database Schema for RBAC**:
```sql
-- Roles and Permissions
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    module VARCHAR(50),
    action VARCHAR(50),
    resource VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id BIGINT,
    permission_id BIGINT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- User Role Assignments
CREATE TABLE user_roles (
    user_id BIGINT,
    role_id BIGINT,
    assigned_by BIGINT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- API Key Permissions
CREATE TABLE api_key_permissions (
    api_key_id BIGINT,
    permission_id BIGINT,
    granted_by BIGINT,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (api_key_id, permission_id),
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

**Permission Structure**:
```php
// Permission naming convention: module.action.resource
$permissions = [
    // User Management
    'users.create.account',
    'users.read.profile',
    'users.update.profile',
    'users.delete.account',
    'users.manage.roles',
    
    // Accommodation Management
    'accommodation.create.booking',
    'accommodation.read.booking',
    'accommodation.update.booking',
    'accommodation.cancel.booking',
    'accommodation.manage.rooms',
    
    // Activity Management
    'activities.create.booking',
    'activities.read.schedule',
    'activities.update.booking',
    'activities.manage.activities',
    
    // Restaurant Management
    'restaurant.create.order',
    'restaurant.read.menu',
    'restaurant.update.order',
    'restaurant.manage.menu',
    
    // Inventory Management
    'inventory.read.stock',
    'inventory.update.stock',
    'inventory.manage.suppliers',
    
    // Reporting
    'reports.read.analytics',
    'reports.export.data',
    
    // API Management
    'api.manage.keys',
    'api.read.analytics',
    'api.manage.integrations'
];
```

### 3. Authentication Middleware Implementation
**Objective**: Create robust authentication middleware for all API requests

**Middleware Stack**:
```php
class AuthenticationMiddleware {
    public function handle($request, $next, ...$guards) {
        // 1. Extract authentication credentials
        $credentials = $this->extractCredentials($request);
        
        // 2. Determine authentication method
        $authMethod = $this->detectAuthMethod($credentials);
        
        // 3. Validate credentials
        $user = $this->validateCredentials($credentials, $authMethod);
        
        // 4. Load user permissions
        $permissions = $this->loadUserPermissions($user);
        
        // 5. Set request context
        $request->setUserContext($user, $permissions);
        
        // 6. Continue to next middleware
        return $next($request);
    }
    
    private function extractCredentials($request) {
        // Extract from Authorization header, API key header, or query params
    }
    
    private function detectAuthMethod($credentials) {
        // Detect API key, Bearer token, or OAuth token
    }
    
    private function validateCredentials($credentials, $method) {
        // Validate based on authentication method
    }
}

class AuthorizationMiddleware {
    public function handle($request, $next, $permission) {
        $user = $request->getUserContext();
        
        if (!$this->hasPermission($user, $permission)) {
            throw new UnauthorizedException('Insufficient permissions');
        }
        
        return $next($request);
    }
    
    private function hasPermission($user, $permission) {
        return $user->permissions->contains($permission);
    }
}
```

### 4. OAuth 2.0 Server Implementation
**Objective**: Full OAuth 2.0 server for third-party integrations

**OAuth Endpoints**:
```php
// OAuth 2.0 Endpoint Routes
Route::group(['prefix' => 'oauth'], function () {
    // Authorization endpoint
    Route::get('/authorize', 'OAuthController@authorize');
    Route::post('/authorize', 'OAuthController@authorizePost');
    
    // Token endpoint
    Route::post('/token', 'OAuthController@issueToken');
    
    // Token introspection
    Route::post('/token/introspect', 'OAuthController@introspect');
    
    // Token revocation
    Route::post('/token/revoke', 'OAuthController@revoke');
    
    // User info endpoint
    Route::get('/userinfo', 'OAuthController@userInfo');
    
    // JWK Set endpoint
    Route::get('/.well-known/jwks.json', 'OAuthController@jwks');
});
```

**OAuth Client Management**:
```sql
CREATE TABLE oauth_clients (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    secret VARCHAR(255),
    redirect_uris JSON,
    grant_types JSON,
    scopes JSON,
    is_confidential BOOLEAN DEFAULT TRUE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE oauth_access_tokens (
    id VARCHAR(100) PRIMARY KEY,
    client_id VARCHAR(100),
    user_id BIGINT NULL,
    scopes JSON,
    revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES oauth_clients(id) ON DELETE CASCADE
);

CREATE TABLE oauth_refresh_tokens (
    id VARCHAR(100) PRIMARY KEY,
    access_token_id VARCHAR(100),
    revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (access_token_id) REFERENCES oauth_access_tokens(id) ON DELETE CASCADE
);
```

### 5. Security Features Implementation
**Objective**: Implement advanced security features for API protection

**Security Features**:

#### A. Rate Limiting by Authentication
```php
class AuthenticatedRateLimiter {
    public function getRateLimit($user, $endpoint) {
        // Different limits based on authentication method and user type
        $limits = [
            'guest' => ['rpm' => 30, 'daily' => 1000],
            'api_key_basic' => ['rpm' => 100, 'daily' => 10000],
            'api_key_premium' => ['rpm' => 500, 'daily' => 100000],
            'oauth_user' => ['rpm' => 200, 'daily' => 20000],
            'internal_service' => ['rpm' => 1000, 'daily' => 1000000]
        ];
        
        return $limits[$user->getAuthType()] ?? $limits['guest'];
    }
}
```

#### B. IP Whitelisting and Geolocation
```php
class IPSecurityMiddleware {
    public function handle($request, $next) {
        $clientIP = $request->ip();
        $user = $request->getUserContext();
        
        // Check IP whitelist for API keys
        if ($user->hasIPRestrictions()) {
            if (!$this->isIPAllowed($clientIP, $user->getAllowedIPs())) {
                throw new UnauthorizedException('IP address not allowed');
            }
        }
        
        // Check for suspicious geographic patterns
        if ($this->isSuspiciousLocation($clientIP, $user)) {
            $this->triggerSecurityAlert($user, $clientIP);
        }
        
        return $next($request);
    }
}
```

#### C. Multi-Factor Authentication (MFA)
```php
class MFAMiddleware {
    public function handle($request, $next) {
        $user = $request->getUserContext();
        
        // Check if MFA is required for this operation
        if ($this->requiresMFA($request->route(), $user)) {
            $mfaToken = $request->header('X-MFA-Token');
            
            if (!$this->validateMFAToken($user, $mfaToken)) {
                throw new MFARequiredException('MFA token required');
            }
        }
        
        return $next($request);
    }
}
```

## Technical Specifications

### Performance Requirements
- **Authentication Time**: < 50ms for token validation
- **Permission Check**: < 10ms for authorization checks
- **Token Generation**: < 100ms for new token creation
- **Cache Utilization**: 95%+ cache hit rate for permissions
- **Concurrent Authentication**: Support 1000+ simultaneous authentications

### Security Standards
- **Encryption**: AES-256 for sensitive data storage
- **Hashing**: bcrypt with cost factor 12 for passwords
- **Token Security**: Cryptographically secure random generation
- **Key Management**: Hardware Security Module (HSM) integration ready
- **Audit Compliance**: Complete authentication audit trail

### Scalability Requirements
- **Horizontal Scaling**: Stateless authentication design
- **Cache Distribution**: Redis cluster for permission caching
- **Database Optimization**: Efficient indexing for permission lookups
- **Load Distribution**: Support for multiple authentication servers
- **Session Management**: Distributed session handling

## Implementation Steps

### Phase 1: Core Authentication (2 days)
1. **Authentication Framework Setup**
   - Install and configure authentication libraries
   - Set up JWT and OAuth 2.0 infrastructure
   - Create authentication middleware stack
   - Implement basic API key authentication

2. **Database Schema Implementation**
   - Create authentication and authorization tables
   - Set up proper indexes for performance
   - Implement data relationships and constraints
   - Create migration scripts

### Phase 2: OAuth 2.0 Server (2 days)
1. **OAuth Server Configuration**
   - Set up OAuth 2.0 server endpoints
   - Configure supported grant types
   - Implement client registration system
   - Create scope and permission management

2. **Token Management**
   - Implement JWT token generation and validation
   - Set up token refresh mechanisms
   - Create token revocation capabilities
   - Implement token introspection endpoints

### Phase 3: RBAC Implementation (1.5 days)
1. **Role and Permission System**
   - Create role management interface
   - Implement permission assignment system
   - Set up hierarchical role structures
   - Create permission inheritance mechanisms

2. **Authorization Middleware**
   - Implement permission checking middleware
   - Create role-based route protection
   - Set up resource-level authorization
   - Implement dynamic permission loading

### Phase 4: Security Features (1.5 days)
1. **Advanced Security**
   - Implement IP whitelisting system
   - Set up geolocation-based security
   - Create MFA authentication system
   - Implement security monitoring and alerting

2. **Rate Limiting Integration**
   - Create authentication-aware rate limiting
   - Implement user-specific quota management
   - Set up abuse detection mechanisms
   - Create fair usage policy enforcement

## Quality Assurance

### Security Testing
- **Penetration Testing**: Third-party security assessment
- **Vulnerability Scanning**: Automated security scans
- **Token Security**: Cryptographic strength validation
- **Permission Testing**: Comprehensive authorization testing
- **Replay Attack Prevention**: Anti-replay mechanism testing

### Performance Testing
- **Authentication Load Testing**: 1000+ concurrent authentications
- **Permission Check Performance**: < 10ms response time validation
- **Token Generation Speed**: Performance under load
- **Cache Performance**: Redis cache effectiveness testing
- **Database Performance**: Query optimization validation

### Integration Testing
- **Multi-Method Authentication**: All authentication methods working
- **Cross-Service Authorization**: Permissions across all modules
- **Mobile Integration**: SDK authentication testing
- **Third-Party Integration**: OAuth with external services
- **Backward Compatibility**: Existing system integration

## Documentation Requirements

### API Documentation
- **Authentication Guide**: Complete authentication methods documentation
- **Authorization Reference**: Role and permission documentation
- **OAuth 2.0 Guide**: OAuth implementation and usage guide
- **Security Best Practices**: Client implementation guidelines
- **Integration Examples**: Code samples for all authentication methods

### Administrative Documentation
- **Role Management Guide**: Admin interface documentation
- **Security Configuration**: Security settings and policies
- **Troubleshooting Guide**: Common authentication issues
- **Monitoring Guide**: Security monitoring and alerting setup
- **Compliance Documentation**: Security compliance requirements

## Success Criteria

### Functional Success Criteria
- [ ] All authentication methods work correctly (API Key, OAuth 2.0, JWT)
- [ ] Role-based access control enforces permissions accurately
- [ ] OAuth 2.0 server supports all required grant types
- [ ] Multi-factor authentication works for high-privilege operations
- [ ] IP whitelisting and geolocation security function properly
- [ ] Token refresh and revocation work seamlessly

### Security Success Criteria
- [ ] All authentication tokens are cryptographically secure
- [ ] Permission checks prevent unauthorized access
- [ ] Rate limiting prevents authentication abuse
- [ ] Audit logging captures all authentication events
- [ ] Security monitoring detects and alerts on threats
- [ ] MFA provides additional security for sensitive operations

### Performance Success Criteria
- [ ] Authentication completes within 50ms for 95% of requests
- [ ] Permission checks complete within 10ms
- [ ] System supports 1000+ concurrent authenticated users
- [ ] Cache hit rate exceeds 95% for permission lookups
- [ ] Token generation scales under load

## Risk Mitigation

### Security Risks
- **Token Compromise**: Implement token rotation and revocation
- **Permission Escalation**: Comprehensive authorization testing
- **Brute Force Attacks**: Rate limiting and account lockout
- **Man-in-the-Middle**: Enforce HTTPS and certificate pinning

### Technical Risks
- **Performance Degradation**: Implement caching and optimization
- **Single Point of Failure**: Design for high availability
- **Integration Complexity**: Thorough testing and documentation
- **Scalability Issues**: Design for horizontal scaling

This comprehensive authentication and authorization system provides the security foundation for all API operations while supporting multiple authentication methods and ensuring scalable, secure access control for the resort management system.
