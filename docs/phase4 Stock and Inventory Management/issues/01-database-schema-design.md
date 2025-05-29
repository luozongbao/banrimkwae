# Issue #01: Database Schema Design for Inventory Management

## Priority: High
## Estimated Duration: 4-5 days
## Phase: 4 - Stock/Inventory Management
## Dependencies: Phase 3 completion, Restaurant inventory foundation

## Overview
Design and implement comprehensive database schema for the resort's unified inventory management system. This includes stock tracking for restaurant supplies, accommodation amenities, activity equipment, and maintenance materials across all resort locations.

## Technical Requirements

### 1. Core Inventory Tables

#### inventory_items Table
```sql
CREATE TABLE inventory_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_th VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_th TEXT,
    category_id BIGINT NOT NULL,
    subcategory_id BIGINT,
    unit_of_measure ENUM('kg', 'g', 'l', 'ml', 'pieces', 'boxes', 'bottles', 'cans', 'bags', 'rolls') NOT NULL,
    barcode VARCHAR(100),
    current_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    reserved_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
    reorder_level DECIMAL(10,3) NOT NULL,
    max_stock_level DECIMAL(10,3),
    purchase_price DECIMAL(10,2),
    average_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    location_id BIGINT NOT NULL,
    storage_requirements TEXT,
    shelf_life_days INT,
    track_expiry BOOLEAN DEFAULT FALSE,
    track_serial BOOLEAN DEFAULT FALSE,
    track_batch BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT NOT NULL,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES inventory_categories(id),
    FOREIGN KEY (subcategory_id) REFERENCES inventory_categories(id),
    FOREIGN KEY (location_id) REFERENCES storage_locations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    
    INDEX idx_sku (sku),
    INDEX idx_barcode (barcode),
    INDEX idx_category (category_id),
    INDEX idx_location (location_id),
    INDEX idx_stock_level (current_stock, reorder_level),
    INDEX idx_active_items (is_active)
);
```

#### inventory_categories Table
```sql
CREATE TABLE inventory_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_th VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_th TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES inventory_categories(id),
    INDEX idx_parent (parent_id),
    INDEX idx_sort (sort_order)
);
```

#### storage_locations Table
```sql
CREATE TABLE storage_locations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_th VARCHAR(100) NOT NULL,
    location_type ENUM('main_storage', 'kitchen', 'bar', 'housekeeping', 'maintenance', 'activity_center') NOT NULL,
    parent_location_id BIGINT,
    address TEXT,
    capacity DECIMAL(10,2),
    temperature_controlled BOOLEAN DEFAULT FALSE,
    min_temperature DECIMAL(5,2),
    max_temperature DECIMAL(5,2),
    humidity_controlled BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    manager_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_location_id) REFERENCES storage_locations(id),
    FOREIGN KEY (manager_id) REFERENCES users(id),
    INDEX idx_type (location_type),
    INDEX idx_active (is_active)
);
```

### 2. Stock Movement and Transaction Tables

#### inventory_movements Table
```sql
CREATE TABLE inventory_movements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT NOT NULL,
    movement_type ENUM('purchase', 'sale', 'adjustment', 'transfer_in', 'transfer_out', 'waste', 'return', 'consumption') NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2),
    total_value DECIMAL(12,2),
    before_stock DECIMAL(10,3) NOT NULL,
    after_stock DECIMAL(10,3) NOT NULL,
    reference_type ENUM('purchase_order', 'sale_order', 'transfer', 'adjustment', 'consumption') NOT NULL,
    reference_id BIGINT NOT NULL,
    batch_number VARCHAR(50),
    serial_number VARCHAR(100),
    expiry_date DATE,
    location_id BIGINT NOT NULL,
    notes TEXT,
    performed_by BIGINT NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT,
    approved_at TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    FOREIGN KEY (location_id) REFERENCES storage_locations(id),
    FOREIGN KEY (performed_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    
    INDEX idx_item_date (item_id, performed_at),
    INDEX idx_movement_type (movement_type),
    INDEX idx_reference (reference_type, reference_id),
    INDEX idx_location_date (location_id, performed_at)
);
```

#### stock_adjustments Table
```sql
CREATE TABLE stock_adjustments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    adjustment_number VARCHAR(20) UNIQUE NOT NULL,
    item_id BIGINT NOT NULL,
    adjustment_type ENUM('damage', 'loss', 'found', 'count_correction', 'expiry', 'transfer_correction') NOT NULL,
    quantity_before DECIMAL(10,3) NOT NULL,
    quantity_adjusted DECIMAL(10,3) NOT NULL,
    quantity_after DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2),
    total_value_impact DECIMAL(12,2),
    reason TEXT NOT NULL,
    supporting_documents JSON,
    requires_approval BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'pending_approval', 'approved', 'rejected') DEFAULT 'draft',
    created_by BIGINT NOT NULL,
    approved_by BIGINT,
    adjustment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    
    INDEX idx_item_date (item_id, adjustment_date),
    INDEX idx_status (status),
    INDEX idx_approval_required (requires_approval, status)
);
```

### 3. Purchase Order Management Tables

#### purchase_orders Table
```sql
CREATE TABLE purchase_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(20) UNIQUE NOT NULL,
    supplier_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status ENUM('draft', 'sent', 'confirmed', 'partially_received', 'completed', 'cancelled') DEFAULT 'draft',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 7,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    terms TEXT,
    notes TEXT,
    delivery_location_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    approved_by BIGINT,
    received_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (delivery_location_id) REFERENCES storage_locations(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (received_by) REFERENCES users(id),
    
    INDEX idx_po_number (po_number),
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    INDEX idx_expected_delivery (expected_delivery_date)
);
```

#### purchase_order_items Table
```sql
CREATE TABLE purchase_order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity_ordered DECIMAL(10,3) NOT NULL,
    quantity_received DECIMAL(10,3) DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    received_date DATE,
    quality_status ENUM('good', 'damaged', 'expired', 'rejected') DEFAULT 'good',
    notes TEXT,
    
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    
    INDEX idx_po_item (purchase_order_id, item_id),
    INDEX idx_received_status (quantity_received, quality_status)
);
```

### 4. Supplier Management Tables

#### suppliers Table
```sql
CREATE TABLE suppliers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    supplier_code VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    tax_id VARCHAR(20),
    payment_terms VARCHAR(100),
    lead_time_days INT DEFAULT 7,
    minimum_order_value DECIMAL(10,2) DEFAULT 0,
    category_specialization JSON,
    delivery_days JSON, -- ["monday", "wednesday", "friday"]
    rating DECIMAL(3,2) DEFAULT 0, -- 0 to 5.00
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_supplier_code (supplier_code),
    INDEX idx_active (is_active),
    INDEX idx_rating (rating)
);
```

#### supplier_items Table
```sql
CREATE TABLE supplier_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    supplier_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    supplier_sku VARCHAR(50),
    current_price DECIMAL(10,2) NOT NULL,
    minimum_order_quantity DECIMAL(10,3) DEFAULT 1,
    lead_time_days INT DEFAULT 7,
    is_primary_supplier BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_price_update DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    UNIQUE KEY unique_supplier_item (supplier_id, item_id),
    INDEX idx_primary_supplier (item_id, is_primary_supplier),
    INDEX idx_price_update (last_price_update)
);
```

### 5. Integration Tables

#### recipe_ingredients Table (Extension from Phase 3)
```sql
ALTER TABLE recipe_ingredients 
ADD COLUMN inventory_item_id BIGINT,
ADD FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id),
ADD INDEX idx_inventory_item (inventory_item_id);
```

#### consumption_tracking Table
```sql
CREATE TABLE consumption_tracking (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    consumption_type ENUM('restaurant_order', 'room_amenity', 'activity_equipment', 'maintenance') NOT NULL,
    reference_id BIGINT NOT NULL, -- order_id, reservation_id, activity_id, etc.
    item_id BIGINT NOT NULL,
    quantity_consumed DECIMAL(10,3) NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(12,2),
    consumption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location_id BIGINT NOT NULL,
    performed_by BIGINT,
    
    FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    FOREIGN KEY (location_id) REFERENCES storage_locations(id),
    FOREIGN KEY (performed_by) REFERENCES users(id),
    
    INDEX idx_consumption_type (consumption_type, reference_id),
    INDEX idx_item_date (item_id, consumption_date),
    INDEX idx_location_date (location_id, consumption_date)
);
```

## Data Migration and Seeding

### 1. Category Seeding
```sql
INSERT INTO inventory_categories (name_en, name_th, description_en) VALUES
('Restaurant Supplies', 'อุปกรณ์ร้านอาหาร', 'Food ingredients and restaurant consumables'),
('Room Amenities', 'สิ่งอำนวยความสะดวกในห้อง', 'Guest room supplies and amenities'),
('Activity Equipment', 'อุปกรณ์กิจกรรม', 'Equipment for resort activities'),
('Maintenance Supplies', 'อุปกรณ์บำรุงรักษา', 'Maintenance and repair supplies'),
('Cleaning Supplies', 'อุปกรณ์ทำความสะอาด', 'Cleaning and housekeeping supplies'),
('Safety Equipment', 'อุปกรณ์ความปลอดภัย', 'Safety and security equipment');
```

### 2. Storage Location Seeding
```sql
INSERT INTO storage_locations (code, name_en, name_th, location_type) VALUES
('MAIN-001', 'Main Storage Warehouse', 'คลังสินค้าหลัก', 'main_storage'),
('KITCHEN-001', 'Main Kitchen Storage', 'คลังครัวหลัก', 'kitchen'),
('BAR-001', 'Bar Storage', 'คลังบาร์', 'bar'),
('HOUSE-001', 'Housekeeping Storage', 'คลังแม่บ้าน', 'housekeeping'),
('MAINT-001', 'Maintenance Storage', 'คลังซ่อมบำรุง', 'maintenance'),
('ACTIV-001', 'Activity Center Storage', 'คลังศูนย์กิจกรรม', 'activity_center');
```

## Success Criteria
- [ ] All inventory tables created with proper relationships
- [ ] Indexes optimized for common query patterns
- [ ] Foreign key constraints properly implemented
- [ ] Data migration from Phase 3 restaurant inventory completed
- [ ] Sample data seeded for testing
- [ ] Database performance benchmarks met
- [ ] Backup and recovery procedures tested

## Implementation Notes
- Design supports multi-location inventory tracking
- Implements audit trail for all stock movements
- Supports both serial number and batch tracking
- Optimized for real-time stock level queries
- Prepared for integration with existing restaurant system
- Includes approval workflow for high-value adjustments

## Deliverables
1. Complete database schema SQL scripts
2. Migration scripts from existing systems
3. Seed data for initial setup
4. Database documentation and ER diagrams
5. Performance optimization queries
6. Backup and maintenance procedures

## Testing Requirements
- [ ] Schema validation and constraint testing
- [ ] Performance testing with large datasets
- [ ] Data integrity testing
- [ ] Migration testing with sample data
- [ ] Index optimization validation
- [ ] Concurrent access testing
