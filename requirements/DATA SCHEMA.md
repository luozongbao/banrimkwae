## Core Entities
### Accommodation Management
accommodation_types
- id (PK)
- name (e.g., "Raft", "House")
- description
- created_at
- updated_at
accommodations
- id (PK)
- accommodation_type_id (FK to accommodation_types)
- name (e.g., "Raft A", "House 1")
- location (e.g., "Riverside", "Garden View")
- status (e.g., "Active", "Under Maintenance")
- created_at
- updated_at
room_types
- id (PK)
- name (e.g., "Single", "Double", "Family Suite")
- description
- base_price
- max_occupancy
- created_at
- updated_at
rooms
- id (PK)
- accommodation_id (FK to accommodations)
- room_type_id (FK to room_types)
- room_number
- floor
- status (e.g., "Available", "Occupied", "Reserved", "Maintenance")
- created_at
- updated_at
room_amenities
- id (PK)
- name (e.g., "Air Conditioning", "Mini Bar")
- created_at
- updated_at
room_amenity_mappings
- id (PK)
- room_id (FK to rooms)
- amenity_id (FK to room_amenities)
- created_at
- updated_at
### Guest Management
guests
- id (PK)
- first_name
- last_name
- email
- phone
- address
- city
- country
- id_type (e.g., "Passport", "ID Card")
- id_number
- notes
- created_at
- updated_at
### Booking Management
bookings
- id (PK)
- booking_number (unique)
- guest_id (FK to guests)
- booking_date
- check_in_date
- check_out_date
- status (e.g., "Confirmed", "Checked In", "Checked Out", "Cancelled")
- total_amount
- payment_status (e.g., "Pending", "Partial", "Paid")
- notes
- created_at
- updated_at
booking_rooms
- id (PK)
- booking_id (FK to bookings)
- room_id (FK to rooms)
- rate_per_night
- check_in_date
- check_out_date
- status
- created_at
- updated_at
### Restaurant Management
menu_categories
- id (PK)
- name (e.g., "Appetizers", "Main Course", "Beverages")
- description
- created_at
- updated_at
menu_items
- id (PK)
- category_id (FK to menu_categories)
- name
- description
- price
- is_available
- image_url
- created_at
- updated_at
orders
- id (PK)
- order_number (unique)
- booking_id (FK to bookings, nullable for walk-in customers)
- room_id (FK to rooms, nullable for restaurant-only orders)
- order_type (e.g., "Dine-in", "Room Service", "Takeaway")
- status (e.g., "Pending", "Preparing", "Served", "Completed", "Cancelled")
- order_date
- total_amount
- notes
- created_at
- updated_at
order_items
- id (PK)
- order_id (FK to orders)
- menu_item_id (FK to menu_items)
- quantity
- unit_price
- subtotal
- notes
- created_at
- updated_at
### Inventory Management
inventory_categories
- id (PK)
- name (e.g., "Food", "Beverages", "Cleaning Supplies", "Amenities")
- description
- created_at
- updated_at
inventory_items
- id (PK)
- category_id (FK to inventory_categories)
- name
- description
- unit (e.g., "kg", "liter", "piece")
- current_quantity
- minimum_quantity (for low stock alerts)
- cost_price
- supplier_id (FK to suppliers)
- created_at
- updated_at
suppliers
- id (PK)
- name
- contact_person
- phone
- email
- address
- notes
- created_at
- updated_at
inventory_transactions
- id (PK)
- item_id (FK to inventory_items)
- transaction_type (e.g., "Purchase", "Usage", "Adjustment", "Wastage")
- quantity (positive for in, negative for out)
- transaction_date
- reference_id (e.g., order_id, purchase_id)
- reference_type (e.g., "Order", "Purchase")
- notes
- created_by (FK to users)
- created_at
- updated_at
menu_item_ingredients
- id (PK)
- menu_item_id (FK to menu_items)
- inventory_item_id (FK to inventory_items)
- quantity_required
- created_at
- updated_at
### Billing and Payments
bills
- id (PK)
- bill_number (unique)
- booking_id (FK to bookings)
- guest_id (FK to guests)
- bill_date
- subtotal
- tax_amount
- discount_amount
- total_amount
- status (e.g., "Draft", "Issued", "Paid", "Cancelled")
- notes
- created_at
- updated_at
bill_items
- id (PK)
- bill_id (FK to bills)
- item_type (e.g., "Room", "Food", "Beverage", "Service")
- reference_id (e.g., booking_room_id, order_item_id)
- description
- quantity
- unit_price
- subtotal
- created_at
- updated_at
payments
- id (PK)
- bill_id (FK to bills)
- payment_method (e.g., "Cash", "Credit Card", "Bank Transfer")
- amount
- payment_date
- reference_number (e.g., transaction ID)
- status (e.g., "Completed", "Failed", "Refunded")
- notes
- created_at
- updated_at
### User Management
roles
- id (PK)
- name (e.g., "Admin", "Manager", "Front Desk", "Restaurant Staff")
- description
- created_at
- updated_at
permissions
- id (PK)
- name (e.g., "create_booking", "view_reports", "manage_inventory")
- description
- created_at
- updated_at
role_permissions
- id (PK)
- role_id (FK to roles)
- permission_id (FK to permissions)
- created_at
- updated_at
users
- id (PK)
- username
- password_hash
- first_name
- last_name
- email
- phone
- role_id (FK to roles)
- is_active
- last_login
- created_at
- updated_at
audit_logs
- id (PK)
- user_id (FK to users)
- action (e.g., "create", "update", "delete")
- entity_type (e.g., "booking", "room", "order")
- entity_id
- details (JSON)
- ip_address
- created_at