# Issue #09: Mobile Payments & Billing Integration

## Overview
Implement a comprehensive mobile payment and billing system that seamlessly integrates with all resort services, providing guests with secure, convenient payment options and real-time billing management through their mobile devices.

## Priority
**High** - Critical for revenue management and guest convenience

## Estimated Timeline
**6 days** (Week 5 of Phase 6)

## Requirements

### 9.1 Payment Gateway Integration
- **Multiple Payment Methods**: Credit cards, digital wallets, room charging, cryptocurrency
- **Secure Processing**: PCI DSS compliant payment processing with tokenization
- **International Support**: Multi-currency support with real-time exchange rates
- **Split Payments**: Group billing and payment splitting capabilities
- **Recurring Payments**: Subscription services and automatic renewals

### 9.2 Real-time Billing Management
- **Live Billing Dashboard**: Real-time charges and payment tracking
- **Detailed Itemization**: Service-by-service billing breakdown
- **Expense Categories**: Categorized spending with visual analytics
- **Budget Alerts**: Customizable spending alerts and limits
- **Bill Preview**: Pre-authorization and payment confirmation

### 9.3 Mobile Wallet Features
- **Digital Wallet**: Resort credits and loyalty points management
- **Quick Pay**: One-tap payments for frequent services
- **Payment History**: Comprehensive transaction history and receipts
- **Refund Management**: Automated refund processing and tracking
- **Tax Handling**: Automatic tax calculation and compliance

### 9.4 Security & Compliance
- **Biometric Authentication**: Fingerprint and face recognition for payments
- **Multi-factor Authentication**: Enhanced security for high-value transactions
- **Fraud Detection**: Real-time fraud monitoring and prevention
- **Data Encryption**: End-to-end encryption for payment data
- **Compliance Management**: PCI DSS, GDPR, and local regulations

### 9.5 Billing Analytics & Reporting
- **Spending Analytics**: Personal spending insights and trends
- **Cost Optimization**: Smart recommendations for cost savings
- **Receipt Management**: Digital receipts with categorization
- **Expense Reports**: Business trip expense reporting
- **Loyalty Integration**: Points earning and redemption tracking

## Technical Specifications

### 9.6 Database Schema

#### Payment and Billing Tables
```sql
-- Mobile payment methods
CREATE TABLE guest_payment_methods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_id BIGINT NOT NULL,
    payment_type ENUM('credit_card', 'debit_card', 'digital_wallet', 'bank_account', 'crypto') NOT NULL,
    provider VARCHAR(50) NOT NULL, -- visa, mastercard, paypal, apple_pay, etc.
    token VARCHAR(255) NOT NULL, -- tokenized payment info
    last_four_digits VARCHAR(4),
    expiry_month INT,
    expiry_year INT,
    cardholder_name VARCHAR(255),
    billing_address JSON,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guest_payment (guest_id, is_active),
    INDEX idx_primary_method (guest_id, is_primary),
    INDEX idx_payment_type (payment_type),
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mobile payment transactions
CREATE TABLE mobile_payment_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    guest_id BIGINT NOT NULL,
    payment_method_id BIGINT,
    service_type ENUM('accommodation', 'dining', 'spa', 'activities', 'other') NOT NULL,
    service_reference_id BIGINT, -- booking/order ID
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'THB',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    base_amount DECIMAL(10,2), -- amount in base currency
    tax_amount DECIMAL(10,2) DEFAULT 0,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    gateway_transaction_id VARCHAR(255),
    gateway_response JSON,
    payment_method_used VARCHAR(50),
    processed_at TIMESTAMP NULL,
    failure_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_status ENUM('none', 'partial', 'full', 'processing') DEFAULT 'none',
    refunded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guest_transactions (guest_id, created_at DESC),
    INDEX idx_transaction_status (payment_status),
    INDEX idx_gateway_transaction (gateway_transaction_id),
    INDEX idx_service_reference (service_type, service_reference_id),
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES guest_payment_methods(id) ON DELETE SET NULL
);

-- Mobile billing summary
CREATE TABLE mobile_billing_summary (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_id BIGINT NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    accommodation_charges DECIMAL(10,2) DEFAULT 0,
    dining_charges DECIMAL(10,2) DEFAULT 0,
    spa_charges DECIMAL(10,2) DEFAULT 0,
    activity_charges DECIMAL(10,2) DEFAULT 0,
    other_charges DECIMAL(10,2) DEFAULT 0,
    total_charges DECIMAL(10,2) NOT NULL,
    total_taxes DECIMAL(10,2) DEFAULT 0,
    total_tips DECIMAL(10,2) DEFAULT 0,
    grand_total DECIMAL(10,2) NOT NULL,
    payments_received DECIMAL(10,2) DEFAULT 0,
    outstanding_balance DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'THB',
    status ENUM('draft', 'generated', 'sent', 'paid', 'overdue') DEFAULT 'draft',
    generated_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guest_billing (guest_id, billing_period_start DESC),
    INDEX idx_billing_status (status),
    INDEX idx_outstanding_balance (outstanding_balance),
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mobile wallet and credits
CREATE TABLE guest_mobile_wallet (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    guest_id BIGINT NOT NULL UNIQUE,
    resort_credits DECIMAL(10,2) DEFAULT 0,
    loyalty_points INT DEFAULT 0,
    promotional_credits DECIMAL(10,2) DEFAULT 0,
    gift_card_balance DECIMAL(10,2) DEFAULT 0,
    total_balance DECIMAL(10,2) DEFAULT 0,
    last_transaction_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guest_wallet (guest_id),
    INDEX idx_total_balance (total_balance),
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Wallet transaction history
CREATE TABLE wallet_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    wallet_id BIGINT NOT NULL,
    transaction_type ENUM('credit', 'debit', 'transfer', 'conversion') NOT NULL,
    credit_type ENUM('resort_credits', 'loyalty_points', 'promotional_credits', 'gift_card') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    reference_type VARCHAR(50), -- payment, refund, promotion, etc.
    reference_id BIGINT,
    description TEXT,
    processed_by BIGINT, -- staff member who processed
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wallet_transactions (wallet_id, created_at DESC),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_credit_type (credit_type),
    INDEX idx_reference (reference_type, reference_id),
    FOREIGN KEY (wallet_id) REFERENCES guest_mobile_wallet(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 9.7 Backend Services (Laravel)

#### Mobile Payment Service
```php
<?php

namespace App\Services\Mobile;

use App\Models\GuestPaymentMethod;
use App\Models\MobilePaymentTransaction;
use App\Models\GuestMobileWallet;
use App\Services\PaymentGateway\PaymentGatewayFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MobilePaymentService
{
    private $paymentGateway;

    public function __construct()
    {
        $this->paymentGateway = PaymentGatewayFactory::create();
    }

    /**
     * Process mobile payment
     */
    public function processPayment($guestId, $paymentData)
    {
        DB::beginTransaction();
        
        try {
            // Validate payment data
            $this->validatePaymentData($paymentData);
            
            // Create payment transaction record
            $transaction = $this->createPaymentTransaction($guestId, $paymentData);
            
            // Process payment through gateway
            $gatewayResponse = $this->processGatewayPayment($transaction);
            
            // Update transaction with gateway response
            $this->updateTransactionStatus($transaction, $gatewayResponse);
            
            // Update wallet if applicable
            if ($paymentData['use_wallet_credits']) {
                $this->deductWalletCredits($guestId, $paymentData['wallet_amount']);
            }
            
            // Generate receipt
            $receipt = $this->generateReceipt($transaction);
            
            DB::commit();
            
            return [
                'success' => true,
                'transaction' => $transaction,
                'receipt' => $receipt,
                'gateway_response' => $gatewayResponse
            ];
            
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Mobile payment processing failed', [
                'guest_id' => $guestId,
                'error' => $e->getMessage(),
                'payment_data' => $paymentData
            ]);
            
            throw $e;
        }
    }

    /**
     * Add payment method
     */
    public function addPaymentMethod($guestId, $paymentMethodData)
    {
        // Tokenize payment method through gateway
        $tokenResponse = $this->paymentGateway->tokenizePaymentMethod($paymentMethodData);
        
        if (!$tokenResponse['success']) {
            throw new \Exception('Failed to tokenize payment method');
        }
        
        return GuestPaymentMethod::create([
            'guest_id' => $guestId,
            'payment_type' => $paymentMethodData['type'],
            'provider' => $paymentMethodData['provider'],
            'token' => $tokenResponse['token'],
            'last_four_digits' => $this->getLastFourDigits($paymentMethodData),
            'expiry_month' => $paymentMethodData['expiry_month'] ?? null,
            'expiry_year' => $paymentMethodData['expiry_year'] ?? null,
            'cardholder_name' => $paymentMethodData['cardholder_name'] ?? null,
            'billing_address' => $paymentMethodData['billing_address'] ?? [],
            'is_verified' => $tokenResponse['verified'] ?? false,
            'verification_date' => $tokenResponse['verified'] ? now() : null
        ]);
    }

    /**
     * Get payment history
     */
    public function getPaymentHistory($guestId, $filters = [])
    {
        $query = MobilePaymentTransaction::where('guest_id', $guestId)
            ->with(['paymentMethod:id,payment_type,provider,last_four_digits'])
            ->orderBy('created_at', 'desc');

        if (isset($filters['service_type'])) {
            $query->where('service_type', $filters['service_type']);
        }

        if (isset($filters['status'])) {
            $query->where('payment_status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->paginate(20);
    }

    /**
     * Get wallet balance
     */
    public function getWalletBalance($guestId)
    {
        $wallet = GuestMobileWallet::where('guest_id', $guestId)->first();
        
        if (!$wallet) {
            $wallet = $this->createWallet($guestId);
        }
        
        return [
            'resort_credits' => $wallet->resort_credits,
            'loyalty_points' => $wallet->loyalty_points,
            'promotional_credits' => $wallet->promotional_credits,
            'gift_card_balance' => $wallet->gift_card_balance,
            'total_balance' => $wallet->total_balance
        ];
    }

    /**
     * Add wallet credits
     */
    public function addWalletCredits($guestId, $amount, $creditType, $description = null, $processedBy = null)
    {
        $wallet = $this->getOrCreateWallet($guestId);
        
        DB::beginTransaction();
        
        try {
            $balanceBefore = $wallet->{$creditType};
            
            // Update wallet balance
            $wallet->increment($creditType, $amount);
            $wallet->increment('total_balance', $amount);
            
            // Record transaction
            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'transaction_type' => 'credit',
                'credit_type' => $creditType,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceBefore + $amount,
                'description' => $description,
                'processed_by' => $processedBy
            ]);
            
            DB::commit();
            return $wallet->fresh();
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /**
     * Process refund
     */
    public function processRefund($transactionId, $amount = null, $reason = null)
    {
        $transaction = MobilePaymentTransaction::findOrFail($transactionId);
        
        if ($transaction->payment_status !== 'completed') {
            throw new \Exception('Can only refund completed transactions');
        }
        
        $refundAmount = $amount ?? $transaction->total_amount;
        
        if ($refundAmount > ($transaction->total_amount - $transaction->refund_amount)) {
            throw new \Exception('Refund amount exceeds available amount');
        }
        
        DB::beginTransaction();
        
        try {
            // Process refund through gateway
            $gatewayResponse = $this->paymentGateway->processRefund(
                $transaction->gateway_transaction_id,
                $refundAmount
            );
            
            if ($gatewayResponse['success']) {
                // Update transaction
                $transaction->increment('refund_amount', $refundAmount);
                $transaction->refund_status = $this->calculateRefundStatus($transaction);
                $transaction->refunded_at = now();
                $transaction->save();
                
                // Add credits back to wallet if applicable
                $this->addRefundToWallet($transaction->guest_id, $refundAmount);
            }
            
            DB::commit();
            return $gatewayResponse;
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    private function createPaymentTransaction($guestId, $paymentData)
    {
        return MobilePaymentTransaction::create([
            'transaction_id' => $this->generateTransactionId(),
            'guest_id' => $guestId,
            'payment_method_id' => $paymentData['payment_method_id'] ?? null,
            'service_type' => $paymentData['service_type'],
            'service_reference_id' => $paymentData['service_reference_id'],
            'amount' => $paymentData['amount'],
            'currency' => $paymentData['currency'] ?? 'THB',
            'tax_amount' => $paymentData['tax_amount'] ?? 0,
            'tip_amount' => $paymentData['tip_amount'] ?? 0,
            'total_amount' => $paymentData['total_amount'],
            'payment_status' => 'pending'
        ]);
    }

    private function generateTransactionId()
    {
        return 'MPT' . date('Ymd') . uniqid();
    }
}
```

### 9.8 Flutter Implementation

#### Payment Widget
```dart
// lib/features/payment/presentation/widgets/payment_method_selector.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/payment_bloc.dart';

class PaymentMethodSelector extends StatefulWidget {
  final double amount;
  final Function(Map<String, dynamic>) onPaymentMethodSelected;

  PaymentMethodSelector({
    required this.amount,
    required this.onPaymentMethodSelected,
  });

  @override
  _PaymentMethodSelectorState createState() => _PaymentMethodSelectorState();
}

class _PaymentMethodSelectorState extends State<PaymentMethodSelector> {
  String? selectedMethod;
  bool useWalletCredits = false;
  double walletCreditsToUse = 0;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PaymentBloc, PaymentState>(
      builder: (context, state) {
        if (state is PaymentMethodsLoaded) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Payment Method',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              SizedBox(height: 16),
              
              // Wallet credits option
              if (state.walletBalance > 0) ...[
                Card(
                  child: CheckboxListTile(
                    title: Text('Use Wallet Credits'),
                    subtitle: Text('Available: \$${state.walletBalance.toStringAsFixed(2)}'),
                    value: useWalletCredits,
                    onChanged: (value) {
                      setState(() {
                        useWalletCredits = value!;
                        if (value) {
                          walletCreditsToUse = widget.amount > state.walletBalance 
                              ? state.walletBalance 
                              : widget.amount;
                        } else {
                          walletCreditsToUse = 0;
                        }
                      });
                      _updateSelection();
                    },
                  ),
                ),
                
                if (useWalletCredits) ...[
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      children: [
                        Text('Credits to use: \$${walletCreditsToUse.toStringAsFixed(2)}'),
                        Slider(
                          value: walletCreditsToUse,
                          min: 0,
                          max: widget.amount > state.walletBalance 
                              ? state.walletBalance 
                              : widget.amount,
                          divisions: 10,
                          onChanged: (value) {
                            setState(() {
                              walletCreditsToUse = value;
                            });
                            _updateSelection();
                          },
                        ),
                      ],
                    ),
                  ),
                ],
                
                SizedBox(height: 16),
              ],
              
              // Payment methods
              ...state.paymentMethods.map((method) => Card(
                child: RadioListTile<String>(
                  title: Text(_getPaymentMethodTitle(method)),
                  subtitle: Text(_getPaymentMethodSubtitle(method)),
                  value: method.id,
                  groupValue: selectedMethod,
                  onChanged: (value) {
                    setState(() {
                      selectedMethod = value;
                    });
                    _updateSelection();
                  },
                  secondary: Icon(_getPaymentMethodIcon(method.paymentType)),
                ),
              )),
              
              SizedBox(height: 16),
              
              // Add new payment method
              Card(
                child: ListTile(
                  title: Text('Add New Payment Method'),
                  leading: Icon(Icons.add_card),
                  onTap: _addNewPaymentMethod,
                ),
              ),
              
              SizedBox(height: 16),
              
              // Payment summary
              Card(
                color: Colors.grey[100],
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Payment Summary',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Subtotal:'),
                          Text('\$${widget.amount.toStringAsFixed(2)}'),
                        ],
                      ),
                      if (useWalletCredits) ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Wallet Credits:'),
                            Text('-\$${walletCreditsToUse.toStringAsFixed(2)}'),
                          ],
                        ),
                      ],
                      Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Total to Pay:',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          Text(
                            '\$${(widget.amount - walletCreditsToUse).toStringAsFixed(2)}',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        }
        
        return Center(child: CircularProgressIndicator());
      },
    );
  }

  void _updateSelection() {
    widget.onPaymentMethodSelected({
      'payment_method_id': selectedMethod,
      'use_wallet_credits': useWalletCredits,
      'wallet_credits_amount': walletCreditsToUse,
      'remaining_amount': widget.amount - walletCreditsToUse,
    });
  }

  void _addNewPaymentMethod() {
    Navigator.pushNamed(context, '/add-payment-method').then((result) {
      if (result != null) {
        context.read<PaymentBloc>().add(LoadPaymentMethods());
      }
    });
  }

  String _getPaymentMethodTitle(dynamic method) {
    switch (method.paymentType) {
      case 'credit_card':
        return '${method.provider.toUpperCase()} ****${method.lastFourDigits}';
      case 'digital_wallet':
        return method.provider;
      default:
        return method.provider;
    }
  }

  String _getPaymentMethodSubtitle(dynamic method) {
    if (method.expiryMonth != null && method.expiryYear != null) {
      return 'Expires ${method.expiryMonth}/${method.expiryYear}';
    }
    return '';
  }

  IconData _getPaymentMethodIcon(String type) {
    switch (type) {
      case 'credit_card':
        return Icons.credit_card;
      case 'digital_wallet':
        return Icons.account_balance_wallet;
      case 'bank_account':
        return Icons.account_balance;
      default:
        return Icons.payment;
    }
  }
}
```

## Testing Strategy

### 9.9 Security Testing
- **Payment Gateway Testing**: Test all payment gateway integrations
- **PCI Compliance Testing**: Validate PCI DSS compliance
- **Fraud Detection Testing**: Test fraud detection algorithms
- **Token Security Testing**: Validate payment tokenization security

### 9.10 Integration Testing
- **Multi-service Integration**: Test payment across all resort services
- **Wallet Integration**: Test wallet credits and loyalty points
- **Refund Processing**: Test refund workflows
- **Currency Conversion**: Test multi-currency support

## Dependencies
- **Issue #01**: Mobile App Core Architecture (authentication, security)
- **Issue #02**: Guest Profile & Preferences (payment preferences)
- **All Service Issues**: Integration with booking, dining, spa, activities

## Success Criteria
- [ ] 99.9% payment processing uptime
- [ ] Sub-3-second payment processing time
- [ ] Zero payment data breaches
- [ ] 95% guest satisfaction with payment experience
- [ ] Full PCI DSS compliance maintained

## Risk Mitigation
- **Payment Failures**: Implement robust retry mechanisms and fallback options
- **Security Breaches**: Multi-layered security with real-time monitoring
- **Compliance Issues**: Regular security audits and compliance reviews
- **Gateway Downtime**: Multiple payment gateway options for redundancy
