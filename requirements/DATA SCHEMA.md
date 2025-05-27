# Banrimkwae Resort Management System - Database Schema

## Core Entities

### Accommodation Management

**accommodation_types**
- id (PK, UUID)
- name (VARCHAR(50)) - e.g., "Raft", "House"
- description (TEXT)
- is_active (BOOLEAN, DEFAULT true)
- sort_order (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**accommodations**
- id (PK, UUID)
- accommodation_type_id (FK to accommodation_types)
- name (VARCHAR(100)) - e.g., "Raft A", "House 1"
- code (VARCHAR(20), UNIQUE) - Short identifier
- location (VARCHAR(200)) - e.g., "Riverside", "Garden View"
- description (TEXT)
- status (ENUM: "Active", "Under Maintenance", "Seasonal Closure", "Inactive")
- max_occupancy (INTEGER) - Total occupancy for the entire accommodation
- base_rate (DECIMAL(10,2)) - Base pricing for the accommodation
- amenities (JSONB) - Accommodation-level amenities
- location_coordinates (POINT) - GPS coordinates for mapping
- images (JSONB) - Array of image URLs
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**room_types**
- id (PK, UUID)
- name (VARCHAR(50)) - e.g., "Single", "Double", "Family Suite"
- description (TEXT)
- base_price (DECIMAL(10,2))
- max_occupancy (INTEGER)
- bed_configuration (VARCHAR(100)) - e.g., "1 King", "2 Queens"
- room_size_sqm (DECIMAL(6,2)) - Room size in square meters
- is_active (BOOLEAN, DEFAULT true)
- sort_order (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**rooms**
- id (PK, UUID)
- accommodation_id (FK to accommodations)
- room_type_id (FK to room_types)
- room_number (VARCHAR(20))
- floor (INTEGER, NULLABLE) - For houses with multiple floors
- status (ENUM: "Available", "Occupied", "Reserved", "Maintenance", "Out of Order")
- condition_rating (INTEGER 1-5) - Room condition score
- last_maintenance_date (DATE)
- custom_rate (DECIMAL(10,2), NULLABLE) - Override room type base price
- special_features (JSONB) - Room-specific features
- accessibility_features (JSONB) - Disability accommodation features
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**room_amenities**
- id (PK, UUID)
- name (VARCHAR(100)) - e.g., "Air Conditioning", "Mini Bar", "Balcony"
- category (VARCHAR(50)) - e.g., "Climate", "Entertainment", "Bathroom"
- description (TEXT)
- icon_name (VARCHAR(50)) - For UI display
- is_chargeable (BOOLEAN, DEFAULT false) - Whether amenity has additional cost
- charge_amount (DECIMAL(10,2), NULLABLE)
- is_active (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**room_amenity_mappings**
- id (PK, UUID)
- room_id (FK to rooms)
- amenity_id (FK to room_amenities)
- quantity (INTEGER, DEFAULT 1) - For countable amenities
- condition_notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
### Guest Management

**guests**
- id (PK, UUID)
- guest_number (VARCHAR(20), UNIQUE) - Auto-generated guest identifier
- title (VARCHAR(10)) - Mr., Mrs., Ms., Dr., etc.
- first_name (VARCHAR(100), NOT NULL)
- last_name (VARCHAR(100), NOT NULL)
- email (VARCHAR(255), UNIQUE)
- phone (VARCHAR(20))
- secondary_phone (VARCHAR(20), NULLABLE)
- date_of_birth (DATE, NULLABLE)
- nationality (VARCHAR(3)) - ISO 3166 country code
- language_preference (VARCHAR(5)) - ISO 639 language code
- address_line_1 (VARCHAR(200))
- address_line_2 (VARCHAR(200), NULLABLE)
- city (VARCHAR(100))
- state_province (VARCHAR(100))
- postal_code (VARCHAR(20))
- country (VARCHAR(3)) - ISO 3166 country code
- id_type (ENUM: "Passport", "National ID", "Driver License", "Other")
- id_number (VARCHAR(50))
- id_expiry_date (DATE, NULLABLE)
- emergency_contact_name (VARCHAR(200), NULLABLE)
- emergency_contact_phone (VARCHAR(20), NULLABLE)
- dietary_restrictions (JSONB) - Array of dietary preferences/restrictions
- accessibility_needs (JSONB) - Special accommodation requirements
- marketing_consent (BOOLEAN, DEFAULT false)
- vip_status (ENUM: "Regular", "VIP", "VVIP", "Corporate")
- guest_notes (TEXT) - Staff notes about guest preferences
- total_stays (INTEGER, DEFAULT 0)
- total_spent (DECIMAL(12,2), DEFAULT 0)
- last_stay_date (DATE, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**guest_companions**
- id (PK, UUID)
- primary_guest_id (FK to guests)
- companion_guest_id (FK to guests)
- relationship (VARCHAR(50)) - e.g., "Spouse", "Child", "Friend"
- created_at (TIMESTAMP)

### Booking Management

**booking_sources**
- id (PK, UUID)
- name (VARCHAR(100)) - e.g., "Direct", "Walk-in", "Booking.com", "Agoda"
- source_type (ENUM: "Direct", "OTA", "Corporate", "Agent")
- commission_rate (DECIMAL(5,2), DEFAULT 0) - Commission percentage
- is_active (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**bookings**
- id (PK, UUID)
- booking_number (VARCHAR(20), UNIQUE) - Auto-generated booking reference
- source_id (FK to booking_sources)
- primary_guest_id (FK to guests)
- booking_date (TIMESTAMP)
- check_in_date (DATE)
- check_out_date (DATE)
- adults (INTEGER, NOT NULL, DEFAULT 1)
- children (INTEGER, DEFAULT 0)
- infants (INTEGER, DEFAULT 0)
- status (ENUM: "Confirmed", "Checked In", "Checked Out", "Cancelled", "No Show", "In House")
- payment_status (ENUM: "Pending", "Partial", "Paid", "Refunded", "Cancelled")
- total_nights (INTEGER, COMPUTED)
- subtotal_amount (DECIMAL(12,2))
- tax_amount (DECIMAL(12,2))
- discount_amount (DECIMAL(12,2), DEFAULT 0)
- total_amount (DECIMAL(12,2))
- deposit_required (DECIMAL(12,2), DEFAULT 0)
- deposit_paid (DECIMAL(12,2), DEFAULT 0)
- special_requests (TEXT, NULLABLE)
- arrival_time (TIME, NULLABLE)
- departure_time (TIME, NULLABLE)
- actual_check_in (TIMESTAMP, NULLABLE)
- actual_check_out (TIMESTAMP, NULLABLE)
- cancellation_reason (TEXT, NULLABLE)
- cancellation_date (TIMESTAMP, NULLABLE)
- created_by (FK to users)
- modified_by (FK to users, NULLABLE)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**booking_guests**
- id (PK, UUID)
- booking_id (FK to bookings)
- guest_id (FK to guests)
- is_primary (BOOLEAN, DEFAULT false)
- age_category (ENUM: "Adult", "Child", "Infant")
- created_at (TIMESTAMP)

**booking_rooms**
- id (PK, UUID)
- booking_id (FK to bookings)
- room_id (FK to rooms)
- check_in_date (DATE)
- check_out_date (DATE)
- nights (INTEGER, COMPUTED)
- rate_per_night (DECIMAL(10,2))
- total_amount (DECIMAL(12,2), COMPUTED)
- rate_plan (VARCHAR(100)) - e.g., "Standard", "Early Bird", "Package Deal"
- status (ENUM: "Reserved", "Confirmed", "Checked In", "Checked Out", "Cancelled")
- actual_check_in (TIMESTAMP, NULLABLE)
- actual_check_out (TIMESTAMP, NULLABLE)
- guest_count (JSONB) - {"adults": 2, "children": 1, "infants": 0}
- special_requests (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
### Restaurant Management

**menu_categories**
- id (PK, UUID)
- name (VARCHAR(100)) - e.g., "Appetizers", "Main Course", "Beverages"
- name_th (VARCHAR(100)) - Thai translation
- name_en (VARCHAR(100)) - English translation
- description (TEXT, NULLABLE)
- sort_order (INTEGER)
- is_active (BOOLEAN, DEFAULT true)
- availability_schedule (JSONB) - Time-based availability
- image_url (VARCHAR(500), NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**menu_items**
- id (PK, UUID)
- category_id (FK to menu_categories)
- name (VARCHAR(200), NOT NULL)
- name_th (VARCHAR(200)) - Thai translation
- name_en (VARCHAR(200)) - English translation
- description (TEXT)
- price (DECIMAL(10,2), NOT NULL)
- cost_price (DECIMAL(10,2)) - Cost to prepare (for profit analysis)
- preparation_time (INTEGER) - Minutes to prepare
- calories (INTEGER, NULLABLE)
- spice_level (INTEGER 0-5, NULLABLE) - Heat level
- dietary_tags (JSONB) - ["vegetarian", "vegan", "gluten-free", "halal", etc.]
- allergen_info (JSONB) - Allergen warnings
- is_available (BOOLEAN, DEFAULT true)
- is_signature_dish (BOOLEAN, DEFAULT false)
- popularity_score (DECIMAL(3,2), DEFAULT 0) - Based on order frequency
- seasonal_availability (JSONB) - Season-based availability
- image_url (VARCHAR(500), NULLABLE)
- sort_order (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**service_locations**
- id (PK, UUID)
- name (VARCHAR(100)) - e.g., "Main Restaurant", "Pool Bar", "Room Service"
- location_type (ENUM: "Restaurant", "Bar", "Room Service", "Poolside", "Beach")
- is_active (BOOLEAN, DEFAULT true)
- operating_hours (JSONB) - Daily operating schedule
- capacity (INTEGER, NULLABLE) - Seating capacity
- description (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**orders**
- id (PK, UUID)
- order_number (VARCHAR(20), UNIQUE) - Auto-generated order reference
- booking_id (FK to bookings, NULLABLE) - For hotel guests
- guest_id (FK to guests, NULLABLE) - For walk-in customers
- room_id (FK to rooms, NULLABLE) - For room service
- service_location_id (FK to service_locations)
- order_type (ENUM: "Dine-in", "Room Service", "Takeaway", "Delivery")
- status (ENUM: "Pending", "Confirmed", "Preparing", "Ready", "Served", "Completed", "Cancelled")
- priority (ENUM: "Normal", "High", "Urgent") - Order priority for kitchen
- order_date (TIMESTAMP)
- requested_time (TIMESTAMP, NULLABLE) - When customer wants the order
- estimated_completion (TIMESTAMP, NULLABLE) - Kitchen estimate
- actual_completion (TIMESTAMP, NULLABLE)
- guest_count (INTEGER, DEFAULT 1)
- table_number (VARCHAR(20), NULLABLE)
- subtotal_amount (DECIMAL(10,2))
- tax_amount (DECIMAL(10,2))
- service_charge (DECIMAL(10,2), DEFAULT 0)
- discount_amount (DECIMAL(10,2), DEFAULT 0)
- total_amount (DECIMAL(10,2))
- payment_method (ENUM: "Room Charge", "Cash", "Card", "Mobile Payment", "Pending")
- payment_status (ENUM: "Pending", "Paid", "Failed", "Refunded")
- special_instructions (TEXT, NULLABLE)
- allergy_notes (TEXT, NULLABLE)
- delivery_address (TEXT, NULLABLE) - For raft deliveries
- created_by (FK to users)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**order_items**
- id (PK, UUID)
- order_id (FK to orders)
- menu_item_id (FK to menu_items)
- quantity (INTEGER, NOT NULL)
- unit_price (DECIMAL(10,2)) - Price at time of order
- subtotal (DECIMAL(10,2), COMPUTED)
- special_instructions (TEXT, NULLABLE) - Item-specific instructions
- modifications (JSONB) - Item modifications/customizations
- status (ENUM: "Ordered", "Preparing", "Ready", "Served", "Cancelled")
- kitchen_notes (TEXT, NULLABLE)
- preparation_started (TIMESTAMP, NULLABLE)
- preparation_completed (TIMESTAMP, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
### Inventory Management

**inventory_categories**
- id (PK, UUID)
- name (VARCHAR(100)) - e.g., "Food", "Beverages", "Cleaning Supplies", "Amenities"
- description (TEXT, NULLABLE)
- parent_category_id (FK to inventory_categories, NULLABLE) - For subcategories
- category_type (ENUM: "Food", "Beverage", "Supply", "Equipment", "Amenity")
- is_active (BOOLEAN, DEFAULT true)
- sort_order (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**suppliers**
- id (PK, UUID)
- supplier_code (VARCHAR(20), UNIQUE) - Auto-generated supplier identifier
- name (VARCHAR(200), NOT NULL)
- company_type (ENUM: "Distributor", "Manufacturer", "Local Vendor", "Service Provider")
- contact_person_name (VARCHAR(200))
- contact_person_title (VARCHAR(100))
- primary_phone (VARCHAR(20))
- secondary_phone (VARCHAR(20), NULLABLE)
- email (VARCHAR(255))
- website (VARCHAR(500), NULLABLE)
- address_line_1 (VARCHAR(200))
- address_line_2 (VARCHAR(200), NULLABLE)
- city (VARCHAR(100))
- state_province (VARCHAR(100))
- postal_code (VARCHAR(20))
- country (VARCHAR(3)) - ISO 3166 country code
- tax_id (VARCHAR(50), NULLABLE)
- payment_terms (VARCHAR(100)) - e.g., "Net 30", "Cash on Delivery"
- credit_limit (DECIMAL(12,2), DEFAULT 0)
- currency_code (VARCHAR(3)) - ISO 4217 currency code
- delivery_lead_time (INTEGER) - Days for standard delivery
- minimum_order_amount (DECIMAL(10,2), DEFAULT 0)
- rating (INTEGER 1-5, DEFAULT 3) - Supplier performance rating
- is_active (BOOLEAN, DEFAULT true)
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**inventory_items**
- id (PK, UUID)
- item_code (VARCHAR(30), UNIQUE) - Auto-generated item identifier
- category_id (FK to inventory_categories)
- primary_supplier_id (FK to suppliers)
- name (VARCHAR(200), NOT NULL)
- description (TEXT, NULLABLE)
- brand (VARCHAR(100), NULLABLE)
- model (VARCHAR(100), NULLABLE) - For equipment
- unit_of_measure (VARCHAR(20)) - e.g., "kg", "liter", "piece", "box", "case"
- package_size (DECIMAL(10,3)) - Size per unit (e.g., 1.5 for 1.5L bottle)
- current_quantity (DECIMAL(12,3), DEFAULT 0)
- reserved_quantity (DECIMAL(12,3), DEFAULT 0) - Reserved for orders
- minimum_stock_level (DECIMAL(12,3)) - Trigger for reorder alerts
- maximum_stock_level (DECIMAL(12,3)) - Maximum storage capacity
- reorder_point (DECIMAL(12,3)) - Automatic reorder trigger
- reorder_quantity (DECIMAL(12,3)) - Standard reorder amount
- standard_cost (DECIMAL(10,2)) - Average/standard cost price
- last_cost (DECIMAL(10,2)) - Most recent purchase cost
- average_cost (DECIMAL(10,2)) - Weighted average cost
- selling_price (DECIMAL(10,2), NULLABLE) - For retail items
- storage_location (VARCHAR(100)) - Physical storage location
- storage_conditions (VARCHAR(200)) - e.g., "Refrigerated", "Dry Cool Place"
- expiry_tracking (BOOLEAN, DEFAULT false) - Whether item has expiry dates
- batch_tracking (BOOLEAN, DEFAULT false) - Whether to track batches/lots
- serial_tracking (BOOLEAN, DEFAULT false) - Whether to track serial numbers
- is_active (BOOLEAN, DEFAULT true)
- is_consumable (BOOLEAN, DEFAULT true) - False for equipment/assets
- barcode (VARCHAR(50), NULLABLE) - Barcode for scanning
- image_url (VARCHAR(500), NULLABLE)
- supplier_item_code (VARCHAR(100), NULLABLE) - Supplier's SKU
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**inventory_transactions**
- id (PK, UUID)
- transaction_number (VARCHAR(20), UNIQUE) - Auto-generated transaction reference
- item_id (FK to inventory_items)
- transaction_type (ENUM: "Purchase", "Usage", "Adjustment", "Wastage", "Transfer", "Return")
- transaction_date (TIMESTAMP)
- quantity (DECIMAL(12,3)) - Positive for incoming, negative for outgoing
- unit_cost (DECIMAL(10,2), NULLABLE) - Cost per unit (for purchases)
- total_cost (DECIMAL(12,2), NULLABLE) - Total transaction cost
- reference_type (ENUM: "Order", "Purchase Order", "Manual", "System", "Recipe")
- reference_id (UUID, NULLABLE) - Links to orders, purchase orders, etc.
- batch_number (VARCHAR(100), NULLABLE) - Batch/lot number
- expiry_date (DATE, NULLABLE) - For perishable items
- location_from (VARCHAR(100), NULLABLE) - Source location for transfers
- location_to (VARCHAR(100), NULLABLE) - Destination location for transfers
- reason_code (VARCHAR(50), NULLABLE) - Reason for adjustment/wastage
- notes (TEXT, NULLABLE)
- created_by (FK to users)
- approved_by (FK to users, NULLABLE)
- approval_required (BOOLEAN, DEFAULT false)
- approved_at (TIMESTAMP, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**menu_item_recipes**
- id (PK, UUID)
- menu_item_id (FK to menu_items)
- inventory_item_id (FK to inventory_items)
- quantity_required (DECIMAL(10,3)) - Quantity needed per menu item serving
- unit_cost (DECIMAL(10,4)) - Cost contribution per serving
- is_optional (BOOLEAN, DEFAULT false) - Optional ingredient
- preparation_notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**purchase_orders**
- id (PK, UUID)
- po_number (VARCHAR(20), UNIQUE) - Purchase order number
- supplier_id (FK to suppliers)
- order_date (DATE)
- expected_delivery_date (DATE, NULLABLE)
- actual_delivery_date (DATE, NULLABLE)
- status (ENUM: "Draft", "Sent", "Confirmed", "Partially Received", "Completed", "Cancelled")
- subtotal_amount (DECIMAL(12,2))
- tax_amount (DECIMAL(12,2), DEFAULT 0)
- discount_amount (DECIMAL(12,2), DEFAULT 0)
- total_amount (DECIMAL(12,2))
- currency_code (VARCHAR(3))
- payment_terms (VARCHAR(100))
- delivery_address (TEXT)
- special_instructions (TEXT, NULLABLE)
- created_by (FK to users)
- approved_by (FK to users, NULLABLE)
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**purchase_order_items**
- id (PK, UUID)
- purchase_order_id (FK to purchase_orders)
- inventory_item_id (FK to inventory_items)
- quantity_ordered (DECIMAL(12,3))
- quantity_received (DECIMAL(12,3), DEFAULT 0)
- unit_cost (DECIMAL(10,2))
- total_cost (DECIMAL(12,2), COMPUTED)
- supplier_item_code (VARCHAR(100), NULLABLE)
- description (VARCHAR(500), NULLABLE)
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
### Billing and Payments

**bills**
- id (PK, UUID)
- bill_number (VARCHAR(20), UNIQUE) - Auto-generated bill identifier
- booking_id (FK to bookings)
- guest_id (FK to guests) - Primary guest for the bill
- bill_type (ENUM: "Room Charge", "Restaurant", "Services", "Combined", "Deposit")
- bill_date (DATE)
- issue_date (TIMESTAMP)
- due_date (DATE, NULLABLE)
- currency_code (VARCHAR(3)) - ISO 4217 currency code
- exchange_rate (DECIMAL(10,6), DEFAULT 1) - For foreign currency bills
- subtotal_amount (DECIMAL(12,2))
- tax_amount (DECIMAL(12,2), DEFAULT 0)
- service_charge_amount (DECIMAL(12,2), DEFAULT 0)
- discount_amount (DECIMAL(12,2), DEFAULT 0)
- total_amount (DECIMAL(12,2))
- amount_paid (DECIMAL(12,2), DEFAULT 0)
- balance_due (DECIMAL(12,2), COMPUTED)
- status (ENUM: "Draft", "Issued", "Partially Paid", "Paid", "Overdue", "Cancelled", "Refunded")
- payment_terms (VARCHAR(100)) - e.g., "Due on Receipt", "Net 30"
- billing_address (JSONB) - Guest billing address
- notes (TEXT, NULLABLE)
- internal_notes (TEXT, NULLABLE) - Staff notes, not printed
- created_by (FK to users)
- approved_by (FK to users, NULLABLE)
- approved_at (TIMESTAMP, NULLABLE)
- voided_by (FK to users, NULLABLE)
- voided_at (TIMESTAMP, NULLABLE)
- void_reason (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**bill_items**
- id (PK, UUID)
- bill_id (FK to bills)
- item_type (ENUM: "Room", "Food", "Beverage", "Service", "Tax", "Discount", "Package")
- reference_type (ENUM: "Booking Room", "Order Item", "Manual", "Package", "Service")
- reference_id (UUID, NULLABLE) - Links to booking_rooms, order_items, etc.
- description (VARCHAR(500)) - Item description as it appears on bill
- category (VARCHAR(100), NULLABLE) - For reporting grouping
- service_date (DATE) - Date service was provided
- quantity (DECIMAL(10,3), DEFAULT 1)
- unit_price (DECIMAL(10,2))
- subtotal (DECIMAL(12,2), COMPUTED)
- tax_rate (DECIMAL(5,4), DEFAULT 0) - Tax percentage (0.07 for 7%)
- tax_amount (DECIMAL(12,2), DEFAULT 0)
- discount_rate (DECIMAL(5,4), DEFAULT 0) - Discount percentage
- discount_amount (DECIMAL(12,2), DEFAULT 0)
- total_amount (DECIMAL(12,2), COMPUTED)
- is_taxable (BOOLEAN, DEFAULT true)
- is_discountable (BOOLEAN, DEFAULT true)
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**payments**
- id (PK, UUID)
- payment_number (VARCHAR(20), UNIQUE) - Auto-generated payment reference
- bill_id (FK to bills)
- booking_id (FK to bookings, NULLABLE) - For tracking
- guest_id (FK to guests, NULLABLE) - For tracking
- payment_method (ENUM: "Cash", "Credit Card", "Debit Card", "Bank Transfer", "Mobile Payment", "Room Charge", "Deposit", "Voucher", "Complimentary")
- payment_type (ENUM: "Payment", "Refund", "Partial Refund", "Chargeback")
- amount (DECIMAL(12,2))
- currency_code (VARCHAR(3))
- exchange_rate (DECIMAL(10,6), DEFAULT 1)
- local_amount (DECIMAL(12,2), COMPUTED) - Amount in resort's base currency
- payment_date (TIMESTAMP)
- transaction_id (VARCHAR(100), NULLABLE) - External transaction reference
- authorization_code (VARCHAR(50), NULLABLE) - Card authorization code
- card_type (VARCHAR(20), NULLABLE) - e.g., "Visa", "MasterCard"
- card_last_four (VARCHAR(4), NULLABLE) - Last 4 digits of card
- bank_name (VARCHAR(100), NULLABLE) - For bank transfers
- reference_number (VARCHAR(100), NULLABLE) - Check number, transfer reference
- processor_name (VARCHAR(100), NULLABLE) - Payment processor used
- processor_fee (DECIMAL(10,2), DEFAULT 0) - Processing fee charged
- status (ENUM: "Pending", "Completed", "Failed", "Cancelled", "Refunded", "Partially Refunded")
- failure_reason (TEXT, NULLABLE) - Reason for failed payments
- receipt_number (VARCHAR(20), NULLABLE) - Printed receipt reference
- notes (TEXT, NULLABLE)
- processed_by (FK to users)
- approved_by (FK to users, NULLABLE) - For large amounts requiring approval
- processed_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**payment_allocations**
- id (PK, UUID)
- payment_id (FK to payments)
- bill_id (FK to bills)
- allocated_amount (DECIMAL(12,2)) - Amount applied to this specific bill
- allocation_date (TIMESTAMP)
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)

**refunds**
- id (PK, UUID)
- refund_number (VARCHAR(20), UNIQUE)
- original_payment_id (FK to payments)
- booking_id (FK to bookings, NULLABLE)
- guest_id (FK to guests)
- refund_amount (DECIMAL(12,2))
- refund_reason (TEXT)
- refund_method (ENUM: "Original Payment Method", "Cash", "Bank Transfer", "Credit")
- status (ENUM: "Pending", "Approved", "Processed", "Failed", "Cancelled")
- requested_by (FK to users)
- approved_by (FK to users, NULLABLE)
- processed_by (FK to users, NULLABLE)
- requested_at (TIMESTAMP)
- approved_at (TIMESTAMP, NULLABLE)
- processed_at (TIMESTAMP, NULLABLE)
- transaction_id (VARCHAR(100), NULLABLE) - External refund transaction ID
- notes (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
### User Management & Security

**roles**
- id (PK, UUID)
- name (VARCHAR(100)) - e.g., "Admin", "Manager", "Front Desk", "Restaurant Staff"
- display_name (VARCHAR(100)) - User-friendly role name
- description (TEXT)
- role_type (ENUM: "System", "Custom") - System roles cannot be deleted
- department (VARCHAR(100), NULLABLE) - e.g., "Front Office", "F&B", "Housekeeping"
- is_active (BOOLEAN, DEFAULT true)
- sort_order (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**permissions**
- id (PK, UUID)
- name (VARCHAR(100)) - e.g., "booking.create", "reports.revenue.view", "inventory.adjust"
- display_name (VARCHAR(100)) - User-friendly permission name
- description (TEXT)
- module (VARCHAR(50)) - e.g., "booking", "restaurant", "inventory", "reports"
- resource (VARCHAR(50)) - e.g., "booking", "room", "order", "report"
- action (VARCHAR(50)) - e.g., "create", "read", "update", "delete", "approve"
- permission_level (ENUM: "Basic", "Advanced", "Admin") - Permission complexity level
- is_system (BOOLEAN, DEFAULT true) - System permissions cannot be deleted
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**role_permissions**
- id (PK, UUID)
- role_id (FK to roles)
- permission_id (FK to permissions)
- granted (BOOLEAN, DEFAULT true) - Allow explicit deny permissions
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**users**
- id (PK, UUID)
- username (VARCHAR(50), UNIQUE, NOT NULL)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255)) - Bcrypt hashed password
- first_name (VARCHAR(100), NOT NULL)
- last_name (VARCHAR(100), NOT NULL)
- display_name (VARCHAR(200), COMPUTED) - Full name for display
- phone (VARCHAR(20), NULLABLE)
- employee_id (VARCHAR(50), UNIQUE, NULLABLE)
- department (VARCHAR(100), NULLABLE)
- position_title (VARCHAR(100), NULLABLE)
- role_id (FK to roles)
- manager_id (FK to users, NULLABLE) - Reporting structure
- hire_date (DATE, NULLABLE)
- language_preference (VARCHAR(5), DEFAULT 'en') - ISO 639 language code
- timezone (VARCHAR(50), DEFAULT 'Asia/Bangkok')
- avatar_url (VARCHAR(500), NULLABLE)
- is_active (BOOLEAN, DEFAULT true)
- email_verified (BOOLEAN, DEFAULT false)
- phone_verified (BOOLEAN, DEFAULT false)
- force_password_change (BOOLEAN, DEFAULT true)
- password_expires_at (TIMESTAMP, NULLABLE)
- last_password_change (TIMESTAMP, NULLABLE)
- failed_login_attempts (INTEGER, DEFAULT 0)
- account_locked_until (TIMESTAMP, NULLABLE)
- last_login_at (TIMESTAMP, NULLABLE)
- last_login_ip (INET, NULLABLE)
- last_activity_at (TIMESTAMP, NULLABLE)
- email_notifications (BOOLEAN, DEFAULT true)
- sms_notifications (BOOLEAN, DEFAULT false)
- two_factor_enabled (BOOLEAN, DEFAULT false)
- two_factor_secret (VARCHAR(32), NULLABLE) - TOTP secret
- backup_codes (JSONB, NULLABLE) - Array of backup codes
- api_access_enabled (BOOLEAN, DEFAULT false)
- notes (TEXT, NULLABLE) - Administrative notes
- created_by (FK to users, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**user_sessions**
- id (PK, UUID)
- user_id (FK to users)
- session_token (VARCHAR(255), UNIQUE) - Secure session identifier
- device_name (VARCHAR(200), NULLABLE) - User-agent or device name
- ip_address (INET)
- location (VARCHAR(200), NULLABLE) - Geo-location if available
- created_at (TIMESTAMP)
- last_activity_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- is_active (BOOLEAN, DEFAULT true)

**audit_logs**
- id (PK, UUID)
- user_id (FK to users, NULLABLE) - NULL for system actions
- session_id (FK to user_sessions, NULLABLE)
- action (VARCHAR(100)) - e.g., "create", "update", "delete", "login", "logout"
- entity_type (VARCHAR(100)) - e.g., "booking", "room", "order", "user"
- entity_id (UUID, NULLABLE) - ID of the affected entity
- entity_name (VARCHAR(200), NULLABLE) - Name/description of affected entity
- old_values (JSONB, NULLABLE) - Previous values for updates
- new_values (JSONB, NULLABLE) - New values for updates
- ip_address (INET, NULLABLE)
- user_agent (TEXT, NULLABLE)
- request_url (VARCHAR(500), NULLABLE)
- request_method (VARCHAR(10), NULLABLE) - HTTP method
- response_status (INTEGER, NULLABLE) - HTTP response code
- execution_time_ms (INTEGER, NULLABLE) - Time taken for operation
- risk_level (ENUM: "Low", "Medium", "High", "Critical") - Security risk assessment
- tags (JSONB, NULLABLE) - Additional categorization tags
- metadata (JSONB, NULLABLE) - Additional context data
- created_at (TIMESTAMP)

**user_preferences**
- id (PK, UUID)
- user_id (FK to users)
- preference_key (VARCHAR(100)) - e.g., "dashboard_layout", "default_page_size"
- preference_value (JSONB) - Flexible value storage
- preference_type (VARCHAR(50)) - e.g., "UI", "Notification", "Workflow"
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**password_reset_tokens**
- id (PK, UUID)
- user_id (FK to users)
- token (VARCHAR(255), UNIQUE) - Secure reset token
- expires_at (TIMESTAMP)
- used_at (TIMESTAMP, NULLABLE)
- ip_address (INET)
- created_at (TIMESTAMP)

**api_keys**
- id (PK, UUID)
- user_id (FK to users)
- key_name (VARCHAR(100)) - User-defined name for the key
- key_hash (VARCHAR(255)) - Hashed API key
- key_prefix (VARCHAR(20)) - First few characters for identification
- permissions (JSONB) - API-specific permissions
- rate_limit (INTEGER, DEFAULT 1000) - Requests per hour
- last_used_at (TIMESTAMP, NULLABLE)
- expires_at (TIMESTAMP, NULLABLE)
- is_active (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### System Configuration & Settings

**system_settings**
- id (PK, UUID)
- setting_key (VARCHAR(100), UNIQUE) - e.g., "resort_name", "default_currency", "tax_rate"
- setting_value (TEXT) - Setting value as string
- value_type (ENUM: "String", "Number", "Boolean", "JSON", "Date") - Data type for validation
- category (VARCHAR(50)) - e.g., "General", "Billing", "Security", "Integration"
- description (TEXT) - Human-readable description
- is_public (BOOLEAN, DEFAULT false) - Whether setting can be accessed by frontend
- is_editable (BOOLEAN, DEFAULT true) - Whether setting can be modified via UI
- validation_rules (JSONB, NULLABLE) - Validation constraints
- default_value (TEXT, NULLABLE) - Default value for the setting
- updated_by (FK to users, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**tax_configurations**
- id (PK, UUID)
- tax_name (VARCHAR(100)) - e.g., "VAT", "Service Charge", "Tourism Tax"
- tax_code (VARCHAR(20), UNIQUE) - Short code for the tax
- tax_rate (DECIMAL(5,4)) - Tax percentage (0.07 for 7%)
- tax_type (ENUM: "Percentage", "Fixed Amount")
- applies_to (JSONB) - Array of item types this tax applies to
- is_inclusive (BOOLEAN, DEFAULT false) - Whether tax is included in price
- is_active (BOOLEAN, DEFAULT true)
- effective_from (DATE)
- effective_until (DATE, NULLABLE)
- description (TEXT, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**currencies**
- id (PK, UUID)
- currency_code (VARCHAR(3), UNIQUE) - ISO 4217 currency code
- currency_name (VARCHAR(100)) - Full currency name
- symbol (VARCHAR(10)) - Currency symbol
- decimal_places (INTEGER, DEFAULT 2) - Number of decimal places
- is_base_currency (BOOLEAN, DEFAULT false) - Resort's primary currency
- is_active (BOOLEAN, DEFAULT true)
- exchange_rate (DECIMAL(12,6), DEFAULT 1) - Rate against base currency
- last_updated (TIMESTAMP) - When exchange rate was last updated
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**exchange_rate_history**
- id (PK, UUID)
- currency_id (FK to currencies)
- exchange_rate (DECIMAL(12,6))
- effective_date (DATE)
- source (VARCHAR(100)) - Where rate was obtained from
- created_at (TIMESTAMP)

### Notification & Communication

**notification_templates**
- id (PK, UUID)
- template_name (VARCHAR(100), UNIQUE) - e.g., "booking_confirmation", "payment_receipt"
- template_type (ENUM: "Email", "SMS", "Push", "In-App")
- subject_template (VARCHAR(500), NULLABLE) - For email templates
- body_template (TEXT) - Template content with placeholders
- language_code (VARCHAR(5)) - ISO 639 language code
- is_active (BOOLEAN, DEFAULT true)
- variables (JSONB) - Available template variables
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**notifications**
- id (PK, UUID)
- recipient_type (ENUM: "User", "Guest", "External")
- recipient_id (UUID, NULLABLE) - user_id or guest_id
- recipient_email (VARCHAR(255), NULLABLE)
- recipient_phone (VARCHAR(20), NULLABLE)
- notification_type (VARCHAR(100)) - e.g., "booking_confirmation", "low_stock_alert"
- channel (ENUM: "Email", "SMS", "Push", "In-App", "System")
- subject (VARCHAR(500), NULLABLE)
- message (TEXT)
- status (ENUM: "Pending", "Sent", "Delivered", "Failed", "Read")
- priority (ENUM: "Low", "Normal", "High", "Urgent")
- scheduled_at (TIMESTAMP, NULLABLE) - For scheduled notifications
- sent_at (TIMESTAMP, NULLABLE)
- delivered_at (TIMESTAMP, NULLABLE)
- read_at (TIMESTAMP, NULLABLE)
- error_message (TEXT, NULLABLE) - For failed notifications
- metadata (JSONB, NULLABLE) - Additional data
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Reports & Analytics

**report_definitions**
- id (PK, UUID)
- report_name (VARCHAR(200)) - Human-readable report name
- report_code (VARCHAR(100), UNIQUE) - Internal report identifier
- category (VARCHAR(100)) - e.g., "Financial", "Operational", "Guest", "Inventory"
- description (TEXT)
- sql_query (TEXT, NULLABLE) - SQL query for the report
- report_parameters (JSONB) - Available parameters and their types
- default_parameters (JSONB) - Default parameter values
- output_formats (JSONB) - Supported formats ["PDF", "Excel", "CSV"]
- chart_config (JSONB, NULLABLE) - Chart configuration for visual reports
- is_system_report (BOOLEAN, DEFAULT true) - System vs custom reports
- is_active (BOOLEAN, DEFAULT true)
- access_level (ENUM: "Public", "Manager", "Admin") - Who can access this report
- created_by (FK to users, NULLABLE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**scheduled_reports**
- id (PK, UUID)
- report_definition_id (FK to report_definitions)
- schedule_name (VARCHAR(200))
- cron_expression (VARCHAR(100)) - Cron schedule expression
- parameters (JSONB) - Report parameters to use
- output_format (VARCHAR(20)) - Format for generated report
- recipients (JSONB) - Array of email addresses
- is_active (BOOLEAN, DEFAULT true)
- last_run_at (TIMESTAMP, NULLABLE)
- next_run_at (TIMESTAMP, NULLABLE)
- created_by (FK to users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**report_executions**
- id (PK, UUID)
- report_definition_id (FK to report_definitions)
- scheduled_report_id (FK to scheduled_reports, NULLABLE)
- executed_by (FK to users, NULLABLE)
- parameters_used (JSONB)
- execution_started_at (TIMESTAMP)
- execution_completed_at (TIMESTAMP, NULLABLE)
- status (ENUM: "Running", "Completed", "Failed", "Cancelled")
- row_count (INTEGER, NULLABLE)
- file_url (VARCHAR(500), NULLABLE) - URL to generated report file
- error_message (TEXT, NULLABLE)
- execution_time_seconds (INTEGER, NULLABLE)
- created_at (TIMESTAMP)

### Integration & External Services

**external_integrations**
- id (PK, UUID)
- integration_name (VARCHAR(100)) - e.g., "Booking.com", "Agoda", "Payment Gateway"
- integration_type (ENUM: "OTA", "Payment", "PMS", "Email", "SMS", "Analytics")
- provider_name (VARCHAR(100))
- is_active (BOOLEAN, DEFAULT true)
- configuration (JSONB) - Integration-specific configuration
- credentials (JSONB) - Encrypted credentials and API keys
- last_sync_at (TIMESTAMP, NULLABLE)
- sync_status (ENUM: "Never", "Success", "Error", "In Progress")
- error_count (INTEGER, DEFAULT 0)
- last_error (TEXT, NULLABLE)
- rate_limit_config (JSONB, NULLABLE) - API rate limiting configuration
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**sync_logs**
- id (PK, UUID)
- integration_id (FK to external_integrations)
- sync_type (VARCHAR(100)) - e.g., "rate_update", "booking_import", "inventory_sync"
- direction (ENUM: "Import", "Export", "Bidirectional")
- started_at (TIMESTAMP)
- completed_at (TIMESTAMP, NULLABLE)
- status (ENUM: "Success", "Partial", "Failed")
- records_processed (INTEGER, DEFAULT 0)
- records_success (INTEGER, DEFAULT 0)
- records_failed (INTEGER, DEFAULT 0)
- error_details (JSONB, NULLABLE)
- summary (TEXT, NULLABLE)
- created_at (TIMESTAMP)

## Database Indexes

### Performance Indexes
```sql
-- Booking performance
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_guest ON bookings(primary_guest_id);

-- Room availability
CREATE INDEX idx_booking_rooms_dates ON booking_rooms(check_in_date, check_out_date, status);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_accommodation ON rooms(accommodation_id);

-- Orders and billing
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Inventory
CREATE INDEX idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX idx_inventory_transactions_date ON inventory_transactions(transaction_date);
CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(item_id);

-- Audit and security
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at);
```

### Search Indexes
```sql
-- Full-text search for guests
CREATE INDEX idx_guests_search ON guests USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || email));

-- Menu item search
CREATE INDEX idx_menu_items_search ON menu_items USING gin(to_tsvector('english', name || ' ' || description));

-- Inventory item search
CREATE INDEX idx_inventory_items_search ON inventory_items USING gin(to_tsvector('english', name || ' ' || description));
```

### Foreign Key Constraints
```sql
-- All FK relationships should have proper constraints
ALTER TABLE accommodations ADD CONSTRAINT fk_accommodations_type 
    FOREIGN KEY (accommodation_type_id) REFERENCES accommodation_types(id);

ALTER TABLE rooms ADD CONSTRAINT fk_rooms_accommodation 
    FOREIGN KEY (accommodation_id) REFERENCES accommodations(id);

ALTER TABLE bookings ADD CONSTRAINT fk_bookings_guest 
    FOREIGN KEY (primary_guest_id) REFERENCES guests(id);

-- Continue for all FK relationships...
```

## Data Migration Considerations

### Legacy Data Import
- **Guest data deduplication** strategy
- **Booking history** preservation
- **Financial data** integrity checks
- **Inventory** opening balances setup

### Data Validation Rules
- **Email format** validation
- **Phone number** format validation
- **Date range** consistency checks
- **Monetary amount** precision rules
- **Inventory quantity** non-negative constraints

### Backup and Recovery
- **Daily automated backups**
- **Point-in-time recovery** capability
- **Cross-region backup** replication
- **Backup integrity** verification
- **Recovery testing** procedures