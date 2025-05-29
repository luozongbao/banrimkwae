# Issue #001: Phase 2 Database Schema Design

## Priority: High
## Estimated Duration: 5 days
## Dependencies: Phase 1 User Management System

---

## Description
Design and implement the complete database schema for Phase 2 Accommodation and Activity Management system. This includes creating all necessary tables, relationships, and indexes to support the accommodation booking system and activity management features.

## Acceptance Criteria

### 1. Accommodation Tables
- [x] `accommodations` table with proper fields
- [x] `accommodation_types` lookup table (Raft, House)
- [x] `rooms` table with dynamic room configuration
- [x] `room_types` lookup table (Master Bedroom, Single Room, etc.)
- [x] Foreign key relationships properly established
- [x] Proper indexes for performance optimization

### 2. Booking Tables
- [x] `bookings` table for accommodation reservations
- [x] `booking_rooms` junction table for room assignments
- [x] `guests` table for guest information
- [x] Proper constraints to prevent booking conflicts
- [x] Status tracking for bookings (confirmed, checked-in, checked-out, cancelled)

### 3. Activity Tables
- [x] `activities` table for activity catalog
- [x] `activity_categories` lookup table (Water Sports, Land Activities, etc.)
- [x] `activity_schedules` table for time slot management
- [x] `activity_bookings` table for guest activity reservations
- [x] `activity_packages` table for bundled activity deals
- [x] `package_activities` junction table

### 4. Data Integrity
- [x] Foreign key constraints properly defined
- [x] Check constraints for business rules
- [x] Unique constraints where appropriate
- [x] NOT NULL constraints for required fields
- [x] Default values set where appropriate

### 5. Performance Optimization
- [x] Primary indexes on all primary keys
- [x] Foreign key indexes for join performance
- [x] Composite indexes for common query patterns
- [x] Indexes on date fields for availability queries

## Technical Requirements

### Database Engine
- MySQL 8.0+ or MariaDB 10.5+
- InnoDB storage engine for ACID compliance
- UTF8MB4 character set for Thai language support

### Schema Files
```
database/
├── migrations/
│   ├── 001_create_accommodation_types_table.php
│   ├── 002_create_accommodations_table.php
│   ├── 003_create_room_types_table.php
│   ├── 004_create_rooms_table.php
│   ├── 005_create_guests_table.php
│   ├── 006_create_bookings_table.php
│   ├── 007_create_booking_rooms_table.php
│   ├── 008_create_activity_categories_table.php
│   ├── 009_create_activities_table.php
│   ├── 010_create_activity_schedules_table.php
│   ├── 011_create_activity_bookings_table.php
│   ├── 012_create_activity_packages_table.php
│   └── 013_create_package_activities_table.php
├── seeders/
│   ├── AccommodationTypeSeeder.php
│   ├── RoomTypeSeeder.php
│   └── ActivityCategorySeeder.php
└── schema.sql
```

## Key Tables Structure

### accommodations
```sql
- id (primary key)
- accommodation_type_id (foreign key)
- name (varchar 100)
- code (varchar 20, unique)
- description (text)
- location (varchar 255)
- max_occupancy (int)
- base_rate (decimal 10,2)
- weekend_rate (decimal 10,2)
- holiday_rate (decimal 10,2)
- amenities (json)
- images (json)
- status (enum: active, inactive, maintenance)
- created_at, updated_at
```

### rooms
```sql
- id (primary key)
- accommodation_id (foreign key)
- room_type_id (foreign key)
- room_number (varchar 10)
- max_occupancy (int)
- rate_per_night (decimal 10,2)
- amenities (json)
- status (enum: available, occupied, maintenance, out_of_order)
- created_at, updated_at
```

### bookings
```sql
- id (primary key)
- guest_id (foreign key)
- accommodation_id (foreign key)
- check_in_date (date)
- check_out_date (date)
- check_in_time (time)
- check_out_time (time)
- adults (int)
- children (int)
- infants (int)
- total_amount (decimal 10,2)
- deposit_amount (decimal 10,2)
- payment_status (enum: pending, partial, paid, refunded)
- booking_status (enum: confirmed, checked_in, checked_out, cancelled)
- special_requests (text)
- created_at, updated_at
```

### activities
```sql
- id (primary key)
- activity_category_id (foreign key)
- name (varchar 100)
- description (text)
- type (enum: free, paid)
- duration_hours (int)
- duration_minutes (int)
- max_participants (int)
- min_age (int)
- difficulty_level (enum: easy, medium, hard)
- adult_price (decimal 10,2)
- child_price (decimal 10,2)
- group_discount_percentage (decimal 5,2)
- equipment_provided (boolean)
- equipment_list (text)
- requirements (text)
- images (json)
- status (enum: active, inactive)
- created_at, updated_at
```

## Validation Rules

### Business Logic Constraints
1. Check-out date must be after check-in date
2. Room occupancy cannot exceed room max_occupancy
3. Activity booking cannot exceed max_participants
4. Guest age must meet activity min_age requirement
5. Booking dates cannot be in the past
6. Room cannot be double-booked for overlapping dates

### Data Validation
1. Email format validation for guests
2. Phone number format validation
3. Positive values for rates and prices
4. Valid date ranges for bookings
5. Valid time formats for schedules

## Testing Requirements

### Unit Tests
- [ ] Test all model relationships
- [ ] Test validation rules
- [ ] Test business logic constraints
- [ ] Test data integrity rules

### Integration Tests
- [ ] Test booking conflict prevention
- [ ] Test availability calculations
- [ ] Test complex queries with joins
- [ ] Test transaction rollbacks

## Documentation
- [ ] Database schema documentation
- [ ] Relationship diagrams (ERD)
- [ ] Data dictionary with field descriptions
- [ ] Migration guide from development to production
- [ ] Backup and restore procedures

## Implementation Notes

### Phase 2 Specific Requirements
1. Support for 2 accommodation types: Rafts and Houses
2. Variable room configuration per accommodation unit
3. Real-time availability tracking
4. Activity scheduling with time slot management
5. Package deals for bundled activities
6. Foundation for billing integration (Phase 3)

### Performance Considerations
1. Use database views for complex availability queries
2. Implement caching for frequently accessed data
3. Use stored procedures for complex business logic
4. Optimize queries with proper indexing strategy

### Security Considerations
1. Encrypt sensitive guest information
2. Use prepared statements to prevent SQL injection
3. Implement audit trails for booking changes
4. Secure database connections with SSL
