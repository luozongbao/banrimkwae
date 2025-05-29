# Issue #09: API Documentation and Testing

## Priority: Medium
## Estimated Time: 3-4 days
## Dependencies: Issue #01-08
## Assignee: Backend Developer / QA Engineer

## Description
Create comprehensive API documentation, automated testing suites, and developer tools for the restaurant management system. This includes OpenAPI/Swagger documentation, Postman collections, automated test suites, and API monitoring tools.

## Requirements

### 1. OpenAPI/Swagger Documentation

#### API Specification Structure:
```yaml
openapi: 3.0.3
info:
  title: Banrimkwae Restaurant Management API
  description: Comprehensive restaurant management system API
  version: 1.0.0
  contact:
    name: API Support
    email: api-support@banrimkwae.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.banrimkwae.com/v1
    description: Production server
  - url: https://api-staging.banrimkwae.com/v1
    description: Staging server
  - url: http://localhost:3000/api/v1
    description: Development server

security:
  - bearerAuth: []
  - apiKeyAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    apiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
```

#### Endpoint Documentation Categories:
```yaml
tags:
  - name: Authentication
    description: User authentication and authorization
  - name: Restaurants
    description: Restaurant management operations
  - name: Menu Management
    description: Menu categories and items management
  - name: Order Management
    description: Order processing and tracking
  - name: Kitchen Operations
    description: Kitchen workflow and display management
  - name: Table Management
    description: Table and reservation management
  - name: Billing Integration
    description: Payment processing and billing
  - name: Inventory Management
    description: Restaurant inventory and recipes
  - name: Analytics & Reporting
    description: Business intelligence and reports
  - name: Guest Services
    description: Guest-facing restaurant services
```

### 2. Comprehensive API Schemas

#### Core Data Models Documentation:
```yaml
components:
  schemas:
    Restaurant:
      type: object
      required:
        - id
        - name
        - status
      properties:
        id:
          type: integer
          example: 1
          description: Unique restaurant identifier
        name:
          type: string
          example: "Main Dining Hall"
          description: Restaurant name
        description:
          type: string
          example: "Fine dining restaurant with ocean view"
        location:
          type: string
          example: "Building A, Ground Floor"
        contactInfo:
          $ref: '#/components/schemas/ContactInfo'
        operatingHours:
          $ref: '#/components/schemas/OperatingHours'
        capacity:
          type: integer
          example: 120
          description: Maximum seating capacity
        status:
          type: string
          enum: [active, inactive, maintenance]
          example: active
        settings:
          $ref: '#/components/schemas/RestaurantSettings'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    MenuItem:
      type: object
      required:
        - id
        - categoryId
        - name
        - price
        - isAvailable
      properties:
        id:
          type: integer
          example: 1
        categoryId:
          type: integer
          example: 1
        name:
          type: string
          example: "Grilled Salmon"
        description:
          type: string
          example: "Fresh Atlantic salmon with lemon herbs"
        price:
          type: number
          format: decimal
          example: 28.99
        imageUrl:
          type: string
          format: uri
          example: "https://images.banrimkwae.com/menu/salmon.jpg"
        preparationTime:
          type: integer
          example: 15
          description: Preparation time in minutes
        allergenInfo:
          $ref: '#/components/schemas/AllergenInfo'
        nutritionalInfo:
          $ref: '#/components/schemas/NutritionalInfo'
        ingredients:
          type: array
          items:
            type: string
          example: ["Salmon", "Lemon", "Herbs", "Olive Oil"]
        isAvailable:
          type: boolean
          example: true
        isFeatured:
          type: boolean
          example: false
        customizations:
          type: array
          items:
            $ref: '#/components/schemas/MenuCustomization'

    Order:
      type: object
      required:
        - id
        - orderNumber
        - restaurantId
        - orderType
        - status
        - totalAmount
      properties:
        id:
          type: integer
          example: 1
        orderNumber:
          type: string
          example: "ORD20241201000001"
        restaurantId:
          type: integer
          example: 1
        guestId:
          type: integer
          example: 123
          nullable: true
        tableId:
          type: integer
          example: 5
          nullable: true
        orderType:
          type: string
          enum: [dine_in, room_service, takeaway]
          example: dine_in
        status:
          type: string
          enum: [pending, confirmed, preparing, ready, served, completed, cancelled]
          example: confirmed
        items:
          type: array
          items:
            $ref: '#/components/schemas/OrderItem'
        subtotal:
          type: number
          format: decimal
          example: 45.50
        taxAmount:
          type: number
          format: decimal
          example: 4.55
        serviceCharge:
          type: number
          format: decimal
          example: 6.83
        totalAmount:
          type: number
          format: decimal
          example: 56.88
        paymentStatus:
          type: string
          enum: [pending, paid, charged_to_room, refunded]
          example: pending
        specialInstructions:
          type: string
          example: "No onions, extra sauce on the side"
        estimatedCompletionTime:
          type: string
          format: date-time
        guestInfo:
          $ref: '#/components/schemas/GuestInfo'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
```

### 3. API Response Standards

#### Standardized Response Format:
```yaml
components:
  schemas:
    SuccessResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        message:
          type: string
          example: "Operation completed successfully"
        data:
          type: object
          description: Response data (varies by endpoint)
        meta:
          $ref: '#/components/schemas/ResponseMeta'

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
              example: "VALIDATION_ERROR"
            message:
              type: string
              example: "Invalid input data"
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                    example: "email"
                  message:
                    type: string
                    example: "Invalid email format"
            timestamp:
              type: string
              format: date-time

    PaginatedResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          type: array
          items:
            type: object
        pagination:
          type: object
          properties:
            page:
              type: integer
              example: 1
            limit:
              type: integer
              example: 20
            total:
              type: integer
              example: 150
            totalPages:
              type: integer
              example: 8
            hasNext:
              type: boolean
              example: true
            hasPrev:
              type: boolean
              example: false
```

### 4. Automated Testing Suite

#### Unit Tests Structure:
```typescript
// Example test structure for API endpoints
describe('Restaurant Management API', () => {
  describe('Restaurant Operations', () => {
    describe('GET /api/restaurants', () => {
      it('should return list of restaurants', async () => {
        const response = await request(app)
          .get('/api/restaurants')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.pagination).toBeDefined();
      });

      it('should filter restaurants by status', async () => {
        const response = await request(app)
          .get('/api/restaurants?status=active')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.data.every(r => r.status === 'active')).toBe(true);
      });

      it('should return 401 for unauthorized access', async () => {
        await request(app)
          .get('/api/restaurants')
          .expect(401);
      });
    });

    describe('POST /api/restaurants', () => {
      it('should create new restaurant', async () => {
        const restaurantData = {
          name: 'Test Restaurant',
          location: 'Test Location',
          capacity: 50,
          contactInfo: {
            phone: '+1234567890',
            email: 'test@restaurant.com'
          }
        };

        const response = await request(app)
          .post('/api/restaurants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(restaurantData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe(restaurantData.name);
      });

      it('should validate required fields', async () => {
        const invalidData = { name: '' };

        const response = await request(app)
          .post('/api/restaurants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });
});
```

#### Integration Tests:
```typescript
describe('Restaurant Order Flow Integration', () => {
  let restaurantId: number;
  let menuItemId: number;
  let orderId: number;

  beforeAll(async () => {
    // Setup test data
    const restaurant = await createTestRestaurant();
    restaurantId = restaurant.id;
    
    const menuItem = await createTestMenuItem(restaurantId);
    menuItemId = menuItem.id;
  });

  it('should complete full order workflow', async () => {
    // Create order
    const orderData = {
      restaurantId,
      orderType: 'dine_in',
      items: [{
        menuItemId,
        quantity: 2,
        customizations: []
      }],
      guestInfo: {
        name: 'Test Guest',
        phone: '+1234567890'
      }
    };

    const createResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(orderData)
      .expect(201);

    orderId = createResponse.body.data.id;
    expect(createResponse.body.data.status).toBe('pending');

    // Confirm order
    await request(app)
      .put(`/api/orders/${orderId}/confirm`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Check order status
    const statusResponse = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(statusResponse.body.data.status).toBe('confirmed');
  });
});
```

### 5. Performance Testing

#### Load Testing Configuration:
```typescript
// Example using Artillery or similar tool
interface LoadTestConfig {
  target: string;
  phases: Array<{
    duration: number;
    arrivalRate: number;
    name: string;
  }>;
  scenarios: Array<{
    name: string;
    weight: number;
    flow: Array<{
      get?: {
        url: string;
        headers?: Record<string, string>;
      };
      post?: {
        url: string;
        json: any;
        headers?: Record<string, string>;
      };
      think?: number;
    }>;
  }>;
}

const loadTestConfig: LoadTestConfig = {
  target: 'https://api-staging.banrimkwae.com',
  phases: [
    { duration: 60, arrivalRate: 5, name: 'Warm up' },
    { duration: 120, arrivalRate: 10, name: 'Normal load' },
    { duration: 60, arrivalRate: 20, name: 'Peak load' },
    { duration: 60, arrivalRate: 5, name: 'Cool down' }
  ],
  scenarios: [
    {
      name: 'Menu browsing and ordering',
      weight: 70,
      flow: [
        { get: { url: '/api/restaurants/1/menu/public' } },
        { think: 5 },
        { get: { url: '/api/restaurants/1/menu/items?category=1' } },
        { think: 10 },
        {
          post: {
            url: '/api/orders',
            json: {
              restaurantId: 1,
              orderType: 'dine_in',
              items: [{ menuItemId: 1, quantity: 1 }]
            }
          }
        }
      ]
    }
  ]
};
```

### 6. API Monitoring and Health Checks

#### Health Check Endpoints:
```typescript
// Health check implementation
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
    services: {
      database: 'healthy',
      redis: 'healthy',
      payment_gateway: 'healthy'
    }
  });
});

app.get('/health/detailed', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabaseConnection(),
    checkRedisConnection(),
    checkPaymentGatewayConnection(),
    checkExternalAPIs()
  ]);

  const results = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      redis: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      paymentGateway: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      externalAPIs: checks[3].status === 'fulfilled' ? 'healthy' : 'unhealthy'
    }
  };

  const overallStatus = Object.values(results.checks).every(status => status === 'healthy')
    ? 'healthy'
    : 'unhealthy';

  res.status(overallStatus === 'healthy' ? 200 : 503).json({
    ...results,
    status: overallStatus
  });
});
```

### 7. Postman Collections

#### Collection Structure:
```json
{
  "info": {
    "name": "Banrimkwae Restaurant Management API",
    "description": "Complete API collection for restaurant management system",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{auth_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://api.banrimkwae.com/v1",
      "type": "string"
    },
    {
      "key": "restaurant_id",
      "value": "1",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"{{user_email}}\",\n  \"password\": \"{{user_password}}\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    pm.globals.set('auth_token', response.data.token);",
                  "}"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### 8. API Rate Limiting and Security Testing

#### Rate Limiting Tests:
```typescript
describe('API Rate Limiting', () => {
  it('should enforce rate limits', async () => {
    const requests = Array(101).fill(null).map(() =>
      request(app)
        .get('/api/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
    );

    const responses = await Promise.allSettled(requests);
    const rateLimitedResponses = responses.filter(
      r => r.status === 'fulfilled' && r.value.status === 429
    );

    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});

describe('API Security', () => {
  it('should reject requests without authentication', async () => {
    await request(app)
      .get('/api/restaurants')
      .expect(401);
  });

  it('should reject requests with invalid token', async () => {
    await request(app)
      .get('/api/restaurants')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);
  });

  it('should sanitize input to prevent SQL injection', async () => {
    const maliciousInput = {
      name: "'; DROP TABLE restaurants; --"
    };

    await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${authToken}`)
      .send(maliciousInput)
      .expect(400);
  });
});
```

## Implementation Requirements

### 1. Documentation Tools
- OpenAPI 3.0 specification
- Swagger UI integration
- Postman collection generation
- Interactive API documentation

### 2. Testing Framework
- Jest for unit testing
- Supertest for API testing
- Artillery for load testing
- Security testing tools

### 3. Monitoring and Analytics
- API usage metrics
- Performance monitoring
- Error tracking and logging
- Health check endpoints

### 4. Developer Experience
- Clear code examples
- SDK generation
- Webhook documentation
- API versioning strategy

## Acceptance Criteria

- [ ] Complete OpenAPI specification
- [ ] Interactive Swagger documentation
- [ ] Comprehensive unit test suite (90%+ coverage)
- [ ] Integration test scenarios
- [ ] Performance benchmarks established
- [ ] Postman collection with examples
- [ ] API monitoring and health checks
- [ ] Security testing implemented
- [ ] Rate limiting configuration
- [ ] Error handling documentation

## Testing Requirements

- [ ] All API endpoints documented
- [ ] Test coverage analysis
- [ ] Performance testing results
- [ ] Security vulnerability assessment
- [ ] Load testing scenarios
- [ ] API response validation
- [ ] Error scenario testing

## Implementation Notes

- Use automated tools for API documentation generation
- Implement comprehensive logging for API usage
- Set up continuous integration for testing
- Create developer onboarding documentation
- Implement API versioning strategy
- Consider implementing API analytics dashboard

## Related Issues
- Depends on: Issue #01-08 (All previous backend implementations)
- Related: Issue #11 (Performance Optimization), Issue #13 (Integration Testing)
- Enables: Developer onboarding and third-party integrations
