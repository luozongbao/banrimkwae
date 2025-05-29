# Issue #01: Database Schema Design for Restaurant Management

## Priority: High
## Estimated Time: 3-4 days
## Dependencies: Phase 2 completion
## Assignee: Backend Developer

## Description
Design and implement comprehensive database schema for the restaurant management system, including all tables, relationships, indexes, and constraints required for restaurant operations.

## Requirements

### Core Database Tables

#### 1. restaurants
- `id` (PRIMARY KEY)
- `name` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `location` (VARCHAR)
- `contact_info` (JSON)
- `operating_hours` (JSON)
- `capacity` (INTEGER)
- `status` (ENUM: active, inactive, maintenance)
- `created_at`, `updated_at`

#### 2. menu_categories
- `id` (PRIMARY KEY)
- `restaurant_id` (FOREIGN KEY)
- `name` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `display_order` (INTEGER)
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at`, `updated_at`

#### 3. menu_items
- `id` (PRIMARY KEY)
- `category_id` (FOREIGN KEY)
- `name` (VARCHAR, NOT NULL)
- `description` (TEXT)
- `price` (DECIMAL(10,2), NOT NULL)
- `image_url` (VARCHAR)
- `preparation_time` (INTEGER) // minutes
- `allergen_info` (JSON)
- `nutritional_info` (JSON)
- `ingredients` (JSON)
- `is_available` (BOOLEAN, DEFAULT true)
- `is_featured` (BOOLEAN, DEFAULT false)
- `display_order` (INTEGER)
- `created_at`, `updated_at`

#### 4. tables
- `id` (PRIMARY KEY)
- `restaurant_id` (FOREIGN KEY)
- `table_number` (VARCHAR, NOT NULL)
- `capacity` (INTEGER, NOT NULL)
- `location` (VARCHAR) // floor section
- `position_x` (DECIMAL) // for floor map
- `position_y` (DECIMAL) // for floor map
- `status` (ENUM: available, occupied, reserved, maintenance)
- `qr_code` (VARCHAR, UNIQUE)
- `created_at`, `updated_at`

#### 5. reservations
- `id` (PRIMARY KEY)
- `guest_id` (FOREIGN KEY to users table)
- `table_id` (FOREIGN KEY)
- `reservation_date` (DATE, NOT NULL)
- `reservation_time` (TIME, NOT NULL)
- `party_size` (INTEGER, NOT NULL)
- `duration_minutes` (INTEGER, DEFAULT 120)
- `status` (ENUM: pending, confirmed, seated, completed, cancelled, no_show)
- `special_requests` (TEXT)
- `contact_phone` (VARCHAR)
- `notes` (TEXT)
- `created_at`, `updated_at`

#### 6. orders
- `id` (PRIMARY KEY)
- `order_number` (VARCHAR, UNIQUE, NOT NULL)
- `restaurant_id` (FOREIGN KEY)
- `guest_id` (FOREIGN KEY to users table, NULLABLE)
- `table_id` (FOREIGN KEY, NULLABLE)
- `reservation_id` (FOREIGN KEY, NULLABLE)
- `order_type` (ENUM: dine_in, room_service, takeaway)
- `status` (ENUM: pending, confirmed, preparing, ready, served, completed, cancelled)
- `total_amount` (DECIMAL(10,2), NOT NULL)
- `payment_status` (ENUM: pending, paid, charged_to_room, refunded)
- `payment_method` (ENUM: cash, card, room_charge, digital_wallet)
- `special_instructions` (TEXT)
- `estimated_completion_time` (TIMESTAMP)
- `actual_completion_time` (TIMESTAMP)
- `created_at`, `updated_at`

#### 7. order_items
- `id` (PRIMARY KEY)
- `order_id` (FOREIGN KEY)
- `menu_item_id` (FOREIGN KEY)
- `quantity` (INTEGER, NOT NULL)
- `unit_price` (DECIMAL(10,2), NOT NULL)
- `subtotal` (DECIMAL(10,2), NOT NULL)
- `special_instructions` (TEXT)
- `status` (ENUM: pending, preparing, ready, served)
- `created_at`, `updated_at`

#### 8. restaurant_inventory
- `id` (PRIMARY KEY)
- `restaurant_id` (FOREIGN KEY)
- `item_name` (VARCHAR, NOT NULL)
- `category` (VARCHAR)
- `current_stock` (DECIMAL(10,3))
- `unit_of_measure` (VARCHAR)
- `minimum_threshold` (DECIMAL(10,3))
- `cost_per_unit` (DECIMAL(10,2))
- `supplier_info` (JSON)
- `last_restocked_at` (TIMESTAMP)
- `created_at`, `updated_at`

#### 9. recipes
- `id` (PRIMARY KEY)
- `menu_item_id` (FOREIGN KEY)
- `ingredients` (JSON) // [{item_id, quantity, unit}]
- `instructions` (TEXT)
- `yield_quantity` (INTEGER)
- `prep_time_minutes` (INTEGER)
- `created_at`, `updated_at`

#### 10. kitchen_displays
- `id` (PRIMARY KEY)
- `restaurant_id` (FOREIGN KEY)
- `order_id` (FOREIGN KEY)
- `display_status` (ENUM: new, acknowledged, in_progress, ready)
- `assigned_staff_id` (FOREIGN KEY to users table, NULLABLE)
- `priority` (ENUM: low, normal, high, urgent)
- `notes` (TEXT)
- `started_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP)
- `created_at`, `updated_at`

### Indexes and Performance Optimization

```sql
-- Performance indexes
CREATE INDEX idx_orders_restaurant_date ON orders(restaurant_id, created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_reservations_date_time ON reservations(reservation_date, reservation_time);
CREATE INDEX idx_tables_restaurant_status ON tables(restaurant_id, status);
CREATE INDEX idx_menu_items_category_active ON menu_items(category_id, is_available);
CREATE INDEX idx_kitchen_displays_status ON kitchen_displays(display_status, created_at);
```

### Data Constraints and Triggers

```sql
-- Ensure table capacity validation
ALTER TABLE reservations ADD CONSTRAINT check_party_size 
CHECK (party_size > 0 AND party_size <= (SELECT capacity FROM tables WHERE id = table_id));

-- Auto-generate order numbers
CREATE TRIGGER generate_order_number 
BEFORE INSERT ON orders 
FOR EACH ROW SET NEW.order_number = CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(NEW.id, 6, '0'));

-- Update order total when order items change
CREATE TRIGGER update_order_total 
AFTER INSERT ON order_items 
FOR EACH ROW UPDATE orders SET total_amount = (
    SELECT SUM(subtotal) FROM order_items WHERE order_id = NEW.order_id
) WHERE id = NEW.order_id;
```

## Acceptance Criteria

- [ ] All database tables created with proper structure
- [ ] Foreign key relationships established
- [ ] Indexes created for performance optimization
- [ ] Data validation constraints implemented
- [ ] Triggers for auto-calculations working
- [ ] Database migration scripts created
- [ ] Seed data for testing purposes
- [ ] Database documentation updated
- [ ] Performance testing completed

## Testing Requirements

- [ ] Database integrity tests
- [ ] Performance benchmarks with sample data
- [ ] Migration rollback testing
- [ ] Constraint validation testing
- [ ] Index effectiveness analysis

## Implementation Notes

- Use database transactions for all multi-table operations
- Implement soft deletes for audit trail
- Consider partitioning for large order history tables
- Ensure proper backup and recovery procedures
- Document all database changes and migrations

## Related Issues
- Depends on: Phase 2 completion
- Blocks: Issues #02-15 (all backend development)
