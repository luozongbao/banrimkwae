# Issue #07: Billing Integration System

## Priority: High
## Estimated Time: 4-5 days
## Dependencies: Issue #01, #02, #03, Phase 2 (Guest Management)
## Assignee: Backend Developer

## Description
Develop comprehensive billing integration system that connects restaurant orders with guest accommodation charges, handles multiple payment methods, integrates with the existing billing system, and manages financial transactions.

## Requirements

### 1. Guest Account Integration API

#### Guest Billing Endpoints:
```
GET    /api/guests/{guestId}/billing/account     # Get guest billing account
GET    /api/guests/{guestId}/billing/charges     # List guest charges
POST   /api/guests/{guestId}/billing/charges     # Add charge to guest account
PUT    /api/guests/{guestId}/billing/charges/{chargeId} # Update charge
DELETE /api/guests/{guestId}/billing/charges/{chargeId} # Remove/refund charge
GET    /api/guests/{guestId}/billing/folio       # Get guest folio/statement
```

#### Room Charge Integration:
```
POST   /api/billing/charge-to-room              # Charge order to room
GET    /api/billing/room/{roomNumber}/charges   # Get room charges
POST   /api/billing/validate-room-charge        # Validate room charge eligibility
PUT    /api/billing/charges/{chargeId}/approve  # Approve pending charge
PUT    /api/billing/charges/{chargeId}/dispute  # Dispute charge
```

### 2. Billing Data Models

#### Guest Billing Account:
```typescript
interface GuestBillingAccount {
  id: number;
  guestId: number;
  roomNumber: string;
  checkInDate: Date;
  checkOutDate: Date;
  accountStatus: 'active' | 'checked_out' | 'suspended';
  creditLimit: number;
  currentBalance: number;
  authorizedChargers: string[]; // who can charge to room
  billingAddress: Address;
  paymentMethods: PaymentMethod[];
  charges: BillingCharge[];
  folio: BillingFolio;
}

interface BillingCharge {
  id: number;
  accountId: number;
  orderId?: number; // restaurant order ID
  chargeType: 'restaurant' | 'room_service' | 'accommodation' | 'amenities' | 'tax' | 'service_charge';
  description: string;
  amount: number;
  taxAmount: number;
  serviceChargeAmount: number;
  totalAmount: number;
  chargeDate: Date;
  postingDate: Date;
  status: 'pending' | 'posted' | 'disputed' | 'refunded';
  reference: {
    restaurantId?: number;
    tableNumber?: string;
    staffId?: number;
    authorizationCode?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Restaurant Billing Integration:
```typescript
interface RestaurantBillingIntegration {
  orderId: number;
  guestId?: number;
  roomNumber?: string;
  chargeMethod: 'room_charge' | 'direct_payment' | 'split_payment';
  billingItems: Array<{
    itemType: 'food' | 'beverage' | 'service_charge' | 'tax';
    description: string;
    amount: number;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  paymentStatus: 'pending' | 'authorized' | 'charged' | 'failed' | 'refunded';
  transactionId?: string;
  authorizationCode?: string;
  failureReason?: string;
}
```

### 3. Payment Processing System

#### Payment Method Management:
```typescript
interface PaymentMethod {
  id: number;
  guestId: number;
  type: 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_account' | 'room_charge';
  provider: string; // 'visa', 'mastercard', 'apple_pay', etc.
  isDefault: boolean;
  isActive: boolean;
  details: {
    // Encrypted/tokenized payment details
    token: string;
    lastFourDigits?: string;
    expiryDate?: string;
    holderName?: string;
  };
  billingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentTransaction {
  id: number;
  orderId: number;
  paymentMethodId?: number;
  amount: number;
  currency: string;
  type: 'charge' | 'refund' | 'partial_refund';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  gatewayResponse: {
    transactionId: string;
    authorizationCode?: string;
    responseCode: string;
    responseMessage: string;
    riskScore?: number;
  };
  fees: {
    processingFee: number;
    gatewayFee: number;
    totalFees: number;
  };
  processedAt?: Date;
  failureReason?: string;
  createdAt: Date;
}
```

### 4. Restaurant Payment Processing

#### Order Payment Endpoints:
```
POST   /api/orders/{orderId}/payment/process     # Process order payment
POST   /api/orders/{orderId}/payment/authorize   # Authorize payment
POST   /api/orders/{orderId}/payment/capture     # Capture authorized payment
POST   /api/orders/{orderId}/payment/refund      # Refund payment
GET    /api/orders/{orderId}/payment/status      # Get payment status
POST   /api/orders/{orderId}/payment/split       # Split payment processing
```

#### Payment Flow Implementation:
```typescript
class PaymentProcessingService {
  async processOrderPayment(
    orderId: number, 
    paymentMethod: PaymentMethod, 
    amount: number
  ): Promise<PaymentResult>;
  
  async chargeToRoom(
    orderId: number, 
    guestId: number, 
    roomNumber: string
  ): Promise<RoomChargeResult>;
  
  async splitPayment(
    orderId: number, 
    payments: PaymentSplit[]
  ): Promise<SplitPaymentResult>;
  
  async refundPayment(
    transactionId: string, 
    amount?: number
  ): Promise<RefundResult>;
  
  async validateRoomCharge(
    guestId: number, 
    amount: number
  ): Promise<ValidationResult>;
}

interface PaymentSplit {
  paymentMethod: PaymentMethod;
  amount: number;
  description?: string;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  authorizationCode?: string;
  errorCode?: string;
  errorMessage?: string;
  requiresAction?: boolean;
  actionUrl?: string;
}
```

### 5. Folio and Statement Generation

#### Guest Folio System:
```typescript
interface BillingFolio {
  id: number;
  guestId: number;
  roomNumber: string;
  generatedDate: Date;
  periodFrom: Date;
  periodTo: Date;
  charges: BillingCharge[];
  payments: PaymentRecord[];
  adjustments: BillingAdjustment[];
  summary: {
    accommodationCharges: number;
    restaurantCharges: number;
    serviceCharges: number;
    taxes: number;
    totalCharges: number;
    totalPayments: number;
    balance: number;
  };
  status: 'draft' | 'final' | 'disputed';
}

interface PaymentRecord {
  id: number;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: Date;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

interface BillingAdjustment {
  id: number;
  type: 'discount' | 'refund' | 'correction' | 'comped';
  amount: number;
  reason: string;
  authorizedBy: string;
  adjustmentDate: Date;
  reference?: string;
}
```

#### Statement Generation Endpoints:
```
GET    /api/guests/{guestId}/folio/current       # Current folio
GET    /api/guests/{guestId}/folio/final         # Final checkout folio
POST   /api/guests/{guestId}/folio/generate      # Generate interim folio
GET    /api/guests/{guestId}/statements/{id}/pdf # Download PDF statement
POST   /api/guests/{guestId}/statements/email    # Email statement to guest
```

### 6. Revenue Recognition and Reporting

#### Revenue Tracking:
```typescript
interface RevenueEntry {
  id: number;
  restaurantId: number;
  orderId: number;
  transactionId: string;
  revenueDate: Date;
  accountingDate: Date;
  amount: number;
  revenueType: 'food' | 'beverage' | 'service_charge';
  taxAmount: number;
  netRevenue: number;
  paymentMethod: string;
  status: 'recognized' | 'pending' | 'deferred';
  accounting: {
    journalEntryId?: string;
    chartOfAccountCode: string;
    costCenter: string;
  };
}
```

#### Financial Reporting Endpoints:
```
GET    /api/billing/reports/revenue              # Revenue reports
GET    /api/billing/reports/payments             # Payment reports
GET    /api/billing/reports/refunds              # Refund reports
GET    /api/billing/reports/reconciliation       # Reconciliation reports
GET    /api/billing/reports/tax                  # Tax reports
```

### 7. Integration with External Payment Gateways

#### Payment Gateway Configuration:
```typescript
interface PaymentGatewayConfig {
  provider: 'stripe' | 'square' | 'paypal' | 'adyen';
  environment: 'sandbox' | 'production';
  credentials: {
    apiKey: string;
    secretKey: string;
    merchantId?: string;
    webhookSecret?: string;
  };
  supportedMethods: PaymentMethodType[];
  currencies: string[];
  features: {
    recurringPayments: boolean;
    refunds: boolean;
    partialRefunds: boolean;
    authorizeAndCapture: boolean;
  };
  webhookEndpoints: {
    success: string;
    failure: string;
    refund: string;
  };
}

class PaymentGatewayService {
  async processPayment(gateway: string, paymentData: PaymentData): Promise<PaymentResult>;
  async authorizePayment(gateway: string, paymentData: PaymentData): Promise<AuthorizationResult>;
  async capturePayment(gateway: string, authorizationId: string): Promise<CaptureResult>;
  async refundPayment(gateway: string, transactionId: string, amount?: number): Promise<RefundResult>;
  async handleWebhook(gateway: string, payload: any, signature: string): Promise<WebhookResult>;
}
```

### 8. Compliance and Security

#### PCI DSS Compliance:
```typescript
interface SecurityMeasures {
  dataEncryption: {
    cardDataEncryption: boolean;
    tokenization: boolean;
    keyManagement: string;
  };
  accessControl: {
    roleBasedAccess: boolean;
    multiFactorAuth: boolean;
    auditLogging: boolean;
  };
  networkSecurity: {
    firewalls: boolean;
    intrusion_detection: boolean;
    vulnerabilityScanning: boolean;
  };
  compliance: {
    pciDssLevel: string;
    certificationDate: Date;
    assessmentDate: Date;
    complianceStatus: 'compliant' | 'non_compliant';
  };
}
```

#### Audit Trail:
```typescript
interface BillingAuditLog {
  id: number;
  entityType: 'charge' | 'payment' | 'refund' | 'adjustment';
  entityId: number;
  action: 'create' | 'update' | 'delete' | 'approve' | 'dispute';
  performedBy: number; // user ID
  previousValues: any;
  newValues: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  reason?: string;
}
```

## Implementation Requirements

### 1. Data Security
- PCI DSS compliance for payment processing
- Encryption of sensitive billing data
- Secure tokenization of payment methods
- Audit logging for all financial transactions

### 2. Integration Points
- Guest management system integration
- Accommodation billing system integration
- Payment gateway integrations
- Accounting system integration

### 3. Error Handling
- Payment failure recovery mechanisms
- Duplicate transaction prevention
- Reconciliation error handling
- Dispute resolution workflows

### 4. Performance
- Efficient payment processing
- Optimized billing queries
- Scalable transaction handling
- Real-time balance updates

## Acceptance Criteria

- [ ] Guest account billing integration working
- [ ] Room charge functionality operational
- [ ] Multiple payment method support
- [ ] Payment gateway integration complete
- [ ] Folio generation system functional
- [ ] Revenue tracking and reporting
- [ ] Refund and adjustment processing
- [ ] Security and compliance measures
- [ ] Audit trail implementation
- [ ] Integration with existing billing system

## Testing Requirements

- [ ] Payment processing workflow testing
- [ ] Room charge validation testing
- [ ] Refund and adjustment testing
- [ ] Security and compliance testing
- [ ] Integration testing with payment gateways
- [ ] Performance testing under load
- [ ] Data integrity and audit testing

## Implementation Notes

- Implement comprehensive error handling for payment failures
- Use database transactions for all financial operations
- Implement proper retry mechanisms for payment processing
- Ensure real-time synchronization with guest management system
- Consider implementing payment reconciliation automation

## Related Issues
- Depends on: Issue #01 (Database), Issue #02 (Restaurant Backend), Issue #03 (Menu/Order Management), Phase 2 (Guest Management)
- Related: Issue #06 (Guest Interface), Issue #10 (Restaurant Reporting)
- Blocks: Issue #14 (User Acceptance Testing)
