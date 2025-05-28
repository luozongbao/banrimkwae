# PHASE IV WIREFRAME
## Stock/Inventory Management (4-6 weeks)

### Document Information
- **Phase**: Phase IV - Stock/Inventory Management
- **Duration**: 4-6 weeks
- **Document Version**: 1.0
- **Last Updated**: May 28, 2025
- **Document Type**: User Interface Wireframes and System Design

---

## 1. DESIGN CONSISTENCY

### 1.1 Design System Reference
This phase follows the established design system from Phase I:
- **Color Palette**: Resort Blue (#2E86AB), Forest Green (#A23B72), Warm Orange (#F18F01)
- **Typography**: Inter font family with Thai support (Sarabun)
- **Spacing**: 8px base unit system
- **Components**: Consistent with established UI component library
- **Navigation**: Follows the main navigation structure established in previous phases

### 1.2 Role-Based Access Control
**Inventory Access Levels:**
- **Admin**: Full access to all inventory functions and settings
- **Manager**: Full operational access, limited administrative functions
- **Officer**: Standard inventory operations, some reporting access
- **Staff**: Basic inventory viewing and simple transactions
- **Guest**: No access to inventory management

---

## 2. INVENTORY DASHBOARD

### 2.1 Main Inventory Dashboard
**Purpose**: Central hub for all inventory management activities
**Access**: Manager, Officer, Admin roles

**Page Components:**
- **Header Section**:
  - Page title: "Inventory Management" (Thai: "การจัดการสต็อก")
  - Current date/time display
  - Quick action buttons: "Add Stock", "New Purchase Order", "Stock Take"
  - User profile dropdown with role indicator

- **Key Metrics Cards** (4-card grid):
  - **Total Inventory Value**: Current total stock value in THB
  - **Low Stock Items**: Count of items below reorder threshold
  - **Pending Orders**: Number of outstanding purchase orders
  - **Today's Transactions**: Number of stock movements today

- **Quick Actions Panel**:
  - Recent stock movements (last 10 transactions)
  - Low stock alerts with item names and current quantities
  - Pending approvals (if user has approval permissions)
  - Quick links to frequently used functions

- **Stock Status Overview**:
  - Real-time inventory levels by category
  - Color-coded status indicators (green: good stock, yellow: low stock, red: out of stock)
  - Category breakdown: Restaurant Supplies, Room Amenities, Maintenance, Activity Equipment

- **Navigation Sidebar**:
  - Inventory Overview
  - Stock Management
  - Purchase Orders
  - Suppliers
  - Stock Movements
  - Reports
  - Settings

### 2.2 Mobile Dashboard
**Responsive Design for Tablets/Mobile**:
- Collapsible navigation menu
- Stacked metrics cards (2x2 grid on tablet, single column on mobile)
- Simplified quick actions panel
- Touch-optimized buttons and controls
- Swipe gestures for navigation between sections

---

## 3. STOCK MANAGEMENT

### 3.1 Stock Items List
**Purpose**: Comprehensive view and management of all inventory items
**Access**: All inventory users (view permissions vary by role)

**Page Layout**:
- **Search and Filter Section**:
  - Search bar with placeholder: "Search items by name, SKU, or category..."
  - Filter dropdowns: Category, Status (In Stock/Low Stock/Out of Stock), Supplier
  - Sort options: Name, SKU, Category, Stock Level, Last Updated
  - View toggles: List View / Card View

- **Items Table/Grid**:
  - **List View Columns**:
    - Item image thumbnail
    - Item Name (Thai/English)
    - SKU/Product Code
    - Category
    - Current Stock
    - Reorder Level
    - Unit Price
    - Total Value
    - Last Updated
    - Actions (Edit, View History, Quick Adjust)
  
  - **Card View** (for mobile):
    - Item image
    - Item name and SKU
    - Stock level with visual indicator
    - Quick action buttons

- **Bulk Actions**:
  - Select multiple items checkbox
  - Bulk operations: Update Prices, Export to Excel, Bulk Stock Adjustment
  - Import functionality for stock updates via CSV/Excel

- **Stock Level Indicators**:
  - Green: Stock level above reorder point
  - Yellow: Stock level at or near reorder point
  - Red: Stock level below reorder point or out of stock
  - Visual progress bars showing stock percentage

### 3.2 Add/Edit Stock Item
**Purpose**: Create new inventory items or modify existing ones
**Access**: Manager, Officer, Admin roles

**Form Layout**:
- **Basic Information Section**:
  - Item Name (Thai)
  - Item Name (English)
  - SKU/Product Code (auto-generated option)
  - Barcode (with barcode scanner integration option)
  - Category dropdown (with option to add new category)
  - Description (Thai/English)
  - Item image upload (multiple images supported)

- **Stock Information Section**:
  - Unit of Measurement (pieces, kg, liters, etc.)
  - Current Stock Quantity
  - Reorder Level (minimum stock threshold)
  - Maximum Stock Level
  - Storage Location
  - Shelf Life / Expiry Date (for applicable items)

- **Pricing Information Section**:
  - Purchase Price (last purchase cost)
  - Average Cost (calculated automatically)
  - Selling Price (if applicable)
  - Currency (THB default)

- **Supplier Information Section**:
  - Primary Supplier dropdown
  - Alternative Suppliers (multiple selection)
  - Supplier Product Code
  - Lead Time (days)

- **Advanced Settings Section**:
  - Is Active toggle
  - Track Expiry Dates toggle
  - Serial Number Tracking toggle
  - Batch/Lot Tracking toggle
  - Auto-reorder toggle

**Form Validation**:
- Required field indicators
- Real-time validation messages
- Duplicate SKU checking
- Price format validation

### 3.3 Stock Adjustment
**Purpose**: Record stock adjustments for various reasons
**Access**: Officer, Manager, Admin roles

**Adjustment Form**:
- **Item Selection**:
  - Search and select item (with autocomplete)
  - Current stock display
  - Item image and details

- **Adjustment Details**:
  - Adjustment Type dropdown: (Damage, Loss, Found, Correction, Transfer)
  - Quantity Adjustment (+/- input)
  - New Stock Level (calculated automatically)
  - Reason for Adjustment (required text field)
  - Reference Number (optional)
  - Adjustment Date (defaults to current date)

- **Approval Workflow**:
  - Adjustments above certain threshold require manager approval
  - Approval status indicator
  - Comments section for approver

**Batch Adjustment**:
- Upload CSV file for multiple adjustments
- Template download link
- Preview before processing
- Error handling and validation results

---

## 4. PURCHASE ORDERS

### 4.1 Purchase Orders List
**Purpose**: Manage all purchase orders from creation to delivery
**Access**: Manager, Officer, Admin roles

**Page Layout**:
- **Filter and Search**:
  - Search by PO number, supplier, or items
  - Status filter: Draft, Sent, Confirmed, Partially Received, Completed, Cancelled
  - Date range filter
  - Supplier filter

- **Purchase Orders Table**:
  - PO Number (clickable for details)
  - Supplier Name
  - Order Date
  - Expected Delivery Date
  - Total Amount (THB)
  - Status badge
  - Items Count
  - Actions: View, Edit, Print, Receive, Cancel

- **Status Indicators**:
  - Draft: Gray badge
  - Sent: Blue badge
  - Confirmed: Yellow badge
  - Partially Received: Orange badge
  - Completed: Green badge
  - Cancelled: Red badge

### 4.2 Create Purchase Order
**Purpose**: Create new purchase orders for stock replenishment
**Access**: Manager, Officer, Admin roles

**Multi-Step Form**:

**Step 1: Supplier and Basic Info**
- Supplier selection dropdown
- PO Date (defaults to current date)
- Expected Delivery Date
- Reference Number (optional)
- Notes/Comments

**Step 2: Items Selection**
- Search and add items interface
- Low stock items suggestions
- Auto-populate based on reorder levels
- Item details display: current stock, reorder level, last purchase price

**Step 3: Order Details**
- Items table with columns:
  - Item Name
  - Current Stock
  - Order Quantity
  - Unit Price
  - Line Total
  - Actions (Remove, Edit Quantity)
- Add more items button
- Discount section (percentage or fixed amount)
- Tax calculation
- Total amount calculation

**Step 4: Review and Submit**
- Order summary
- Terms and conditions
- Delivery instructions
- Contact information
- Submit options: Save as Draft, Send to Supplier, Print

### 4.3 Receive Purchase Order
**Purpose**: Record receipt of ordered items and update stock levels
**Access**: Officer, Manager, Admin roles

**Receiving Interface**:
- **Order Information Display**:
  - PO number and supplier details
  - Order date and expected delivery date
  - Total ordered vs. received summary

- **Items Receiving Table**:
  - Item Name and SKU
  - Ordered Quantity
  - Received Quantity (editable input)
  - Unit Price
  - Line Total
  - Expiry Date (for applicable items)
  - Batch/Lot Number (if tracked)
  - Condition dropdown: Good, Damaged, Expired

- **Receiving Summary**:
  - Total items ordered vs. received
  - Partial delivery handling
  - Damage report section
  - Receiving notes
  - Received by (staff name)
  - Receiving date and time

- **Stock Update Preview**:
  - Before and after stock levels
  - Location assignment for received items
  - Automatic stock value calculations

---

## 5. SUPPLIER MANAGEMENT

### 5.1 Suppliers List
**Purpose**: Manage supplier information and relationships
**Access**: Manager, Admin roles

**Suppliers Table**:
- Supplier Name (Thai/English)
- Contact Person
- Phone Number
- Email Address
- Category (Food, Beverages, Maintenance, etc.)
- Active Status
- Last Order Date
- Total Orders (count)
- Actions: View, Edit, Deactivate

**Supplier Quick Actions**:
- Add New Supplier button
- Export supplier list
- Import suppliers from Excel
- Bulk email functionality

### 5.2 Supplier Profile
**Purpose**: Detailed supplier information and transaction history
**Access**: Manager, Admin roles

**Profile Layout**:
- **Basic Information**:
  - Company name and logo
  - Contact details
  - Address information
  - Tax ID and business registration
  - Payment terms
  - Delivery terms

- **Performance Metrics**:
  - On-time delivery percentage
  - Order accuracy rate
  - Average delivery time
  - Total purchase value (YTD)
  - Number of orders

- **Recent Orders**:
  - List of recent purchase orders
  - Order status and delivery performance
  - Link to order details

- **Products Supplied**:
  - List of items supplied by this vendor
  - Pricing history
  - Lead times for each product

**Contact Management**:
- Multiple contact persons
- Communication history
- Email and phone integration

---

## 6. STOCK MOVEMENTS & TRANSACTIONS

### 6.1 Stock Movement History
**Purpose**: Track all stock movements and transactions
**Access**: All inventory users (view permissions vary)

**Movement Log Table**:
- Date and Time
- Transaction Type (Purchase, Sale, Adjustment, Transfer)
- Item Name and SKU
- Quantity (+/-)
- Unit Price
- Total Value
- Reference (PO number, adjustment ID, etc.)
- User/Staff member
- Notes/Reason
- Before/After Stock Levels

**Filter Options**:
- Date range selection
- Transaction type filter
- Item/category filter
- User filter
- Value range filter

**Export Options**:
- Export to Excel
- Export to PDF
- Print movement report

### 6.2 Stock Transfer
**Purpose**: Transfer stock between locations or departments
**Access**: Officer, Manager, Admin roles

**Transfer Form**:
- **Transfer Details**:
  - Transfer Date
  - From Location dropdown
  - To Location dropdown
  - Transfer Type: Internal, Department Transfer, Location Transfer
  - Reference Number
  - Reason for Transfer

- **Items Transfer**:
  - Item selection with stock availability check
  - Transfer quantity input
  - Available stock display
  - Batch/serial number tracking (if applicable)

- **Approval Process**:
  - Transfers above threshold require approval
  - Digital signature or approval workflow
  - Notification to receiving department

---

## 7. INVENTORY ANALYTICS & REPORTS

### 7.1 Inventory Reports Dashboard
**Purpose**: Visual analytics and reporting hub
**Access**: Manager, Admin roles; limited access for Officer

**Dashboard Layout**:
- **Key Performance Indicators**:
  - Inventory Turnover Rate
  - Stock Accuracy Percentage
  - Average Days of Stock
  - Dead Stock Value
  - Fast/Slow Moving Items

- **Visual Charts**:
  - Stock Value by Category (pie chart)
  - Stock Movement Trends (line chart)
  - Top 10 Fast-Moving Items (bar chart)
  - Supplier Performance (dashboard)
  - Monthly Consumption Patterns

- **Quick Reports**:
  - Low Stock Report
  - Overstock Report
  - Expiry Date Report
  - Stock Valuation Report
  - Supplier Performance Report

### 7.2 Stock Valuation Report
**Purpose**: Financial reporting for inventory value and costing
**Access**: Manager, Admin roles

**Report Parameters**:
- Valuation Date selection
- Category filter
- Location filter
- Valuation Method: FIFO, LIFO, Weighted Average

**Report Content**:
- Item-wise stock valuation
- Category-wise breakdown
- Total inventory value
- Cost analysis comparison
- Month-over-month value changes

**Export Options**:
- PDF for presentation
- Excel for further analysis
- CSV for system integration

### 7.3 Consumption Analysis
**Purpose**: Analyze usage patterns and forecast needs
**Access**: Manager, Admin roles

**Analysis Components**:
- **Usage Trends**:
  - Monthly/weekly consumption patterns
  - Seasonal variation analysis
  - Department-wise consumption
  - Peak usage periods identification

- **Forecasting**:
  - Predictive analytics for stock requirements
  - Seasonal adjustment factors
  - Reorder point optimization suggestions
  - Economic order quantity recommendations

- **Performance Metrics**:
  - Stock turnover by category
  - Carrying cost analysis
  - Stockout frequency
  - Supplier lead time analysis

---

## 8. INTEGRATION POINTS

### 8.1 Restaurant Integration
**Automatic Stock Updates**:
- Recipe-based stock deduction when orders are processed
- Real-time inventory updates from restaurant POS
- Menu item availability based on ingredient stock
- Automatic reorder triggers for restaurant supplies

**Integration Features**:
- Recipe management with ingredient mapping
- Portion control and waste tracking
- Cost of goods sold calculations
- Menu engineering support

### 8.2 Accommodation Integration
**Room Amenities Management**:
- Housekeeping supply tracking per room
- Automatic deduction for room amenities usage
- Laundry and cleaning supply consumption
- Maintenance supply allocation

**Integration Features**:
- Room-wise amenity tracking
- Housekeeping supply checklists
- Preventive maintenance stock allocation
- Guest amenity preference tracking

### 8.3 Activity Integration
**Equipment and Supply Management**:
- Activity equipment availability checking
- Safety equipment tracking and maintenance
- Activity supply consumption monitoring
- Equipment booking and allocation

**Integration Features**:
- Equipment maintenance scheduling
- Safety compliance tracking
- Activity package supply requirements
- Equipment lifecycle management

---

## 9. MOBILE INVENTORY APP DESIGN

### 9.1 Mobile Dashboard
**Responsive Design for Staff Mobile App**:

**Dashboard Screen**:
- Simplified metrics cards (2x2 grid)
- Quick action floating action button (FAB)
- Recent movements list (scrollable)
- Low stock alerts with notification badges
- Search bar at top

**Navigation**:
- Bottom tab navigation: Dashboard, Items, Orders, Scan, Profile
- Hamburger menu for additional options
- Quick access to barcode scanner

### 9.2 Barcode Scanning Interface
**Purpose**: Quick stock operations using mobile device camera

**Scanning Features**:
- QR Code and barcode scanning
- Item lookup and details display
- Quick stock adjustment entry
- Inventory counting support
- Photo capture for damage documentation

**Offline Capability**:
- Cache critical data for offline access
- Queue transactions for sync when online
- Offline inventory counting support
- Data validation upon reconnection

### 9.3 Stock Taking Module
**Purpose**: Facilitate physical inventory counts

**Counting Interface**:
- Location-based counting workflows
- Item scanning and quantity entry
- Discrepancy highlighting
- Progress tracking
- Team collaboration features

**Count Management**:
- Count sheet generation
- Multiple counter assignment
- Variance analysis
- Approval workflow
- Stock adjustment creation

---

## 10. SYSTEM SETTINGS & CONFIGURATION

### 10.1 Inventory Settings
**Purpose**: Configure system parameters and business rules
**Access**: Admin role only

**Configuration Options**:
- **Default Settings**:
  - Default currency (THB)
  - Default units of measurement
  - Automatic SKU generation rules
  - Default reorder levels by category
  - Stock valuation methods

- **Approval Workflows**:
  - Purchase order approval limits
  - Stock adjustment approval thresholds
  - Multi-level approval chains
  - Notification settings

- **Integration Settings**:
  - Restaurant POS integration parameters
  - Barcode scanner configuration
  - Email notification templates
  - Report generation schedules

### 10.2 User Permissions
**Purpose**: Configure role-based access to inventory functions

**Permission Matrix**:
- **Admin**: Full access to all functions
- **Manager**: All operational functions, limited admin settings
- **Officer**: Standard operations, cannot modify critical settings
- **Staff**: View and basic transaction entry only

**Specific Permissions**:
- View inventory levels
- Create/edit items
- Process purchase orders
- Perform stock adjustments
- Access financial reports
- Modify system settings
- Approve transactions

---

## 11. API ENDPOINTS & DATABASE INTEGRATION

### 11.1 API Structure
**RESTful API Endpoints for Inventory Module**:

**Items Management**:
- `GET /api/inventory/items` - List all items with filters
- `POST /api/inventory/items` - Create new item
- `PUT /api/inventory/items/{id}` - Update item
- `DELETE /api/inventory/items/{id}` - Deactivate item
- `GET /api/inventory/items/{id}/movements` - Item movement history

**Stock Operations**:
- `POST /api/inventory/adjustments` - Record stock adjustment
- `POST /api/inventory/transfers` - Create stock transfer
- `GET /api/inventory/stock-levels` - Current stock levels
- `POST /api/inventory/stock-count` - Submit physical count

**Purchase Orders**:
- `GET /api/inventory/purchase-orders` - List purchase orders
- `POST /api/inventory/purchase-orders` - Create purchase order
- `PUT /api/inventory/purchase-orders/{id}/receive` - Receive items
- `GET /api/inventory/purchase-orders/{id}/pdf` - Generate PO PDF

### 11.2 Database Schema Extensions
**New Tables for Phase IV**:

**inventory_items**:
- id, sku, name_en, name_th, category_id, description
- unit_of_measure, reorder_level, max_level, current_stock
- purchase_price, average_cost, selling_price
- is_active, track_expiry, track_serial
- created_at, updated_at

**inventory_movements**:
- id, item_id, transaction_type, quantity, unit_price
- reference_type, reference_id, notes, user_id
- before_stock, after_stock, created_at

**purchase_orders**:
- id, po_number, supplier_id, order_date, expected_date
- status, total_amount, discount, tax, notes
- created_by, approved_by, received_by
- created_at, updated_at

**purchase_order_items**:
- id, purchase_order_id, item_id, quantity_ordered
- quantity_received, unit_price, line_total
- expiry_date, batch_number, condition

**suppliers**:
- id, name_en, name_th, contact_person, phone, email
- address, tax_id, payment_terms, delivery_terms
- is_active, created_at, updated_at

---

## 12. TESTING & QUALITY ASSURANCE

### 12.1 User Acceptance Testing Scenarios
**Critical User Journeys**:

1. **Complete Stock Replenishment Cycle**:
   - Identify low stock items
   - Create purchase order
   - Send to supplier
   - Receive and verify items
   - Update stock levels

2. **Stock Adjustment Workflow**:
   - Perform physical count
   - Identify discrepancies
   - Record adjustments with reasons
   - Approval process
   - Stock level updates

3. **Integration Testing**:
   - Restaurant order creates stock deduction
   - Accommodation amenity usage tracking
   - Activity equipment allocation
   - Cross-module data consistency

### 12.2 Performance Testing Requirements
**Load Testing Scenarios**:
- 50 concurrent users performing stock operations
- Barcode scanning response times < 2 seconds
- Report generation under 30 seconds
- Mobile app offline/online sync performance
- Database query optimization for large datasets

---

## 13. TRAINING & DOCUMENTATION

### 13.1 User Training Materials
**Staff Training Components**:
- Basic inventory concepts and terminology
- System navigation and core functions
- Barcode scanning and mobile app usage
- Stock counting procedures
- Purchase order processing
- Emergency procedures and troubleshooting

**Training Delivery**:
- Interactive demo sessions
- Hands-on practice exercises
- Video tutorials (Thai language)
- Quick reference cards
- FAQ documentation

### 13.2 System Documentation
**Technical Documentation**:
- API documentation with examples
- Database schema and relationships
- Integration configuration guides
- Troubleshooting procedures
- Backup and recovery processes

**User Documentation**:
- Step-by-step user guides
- Role-specific workflow documentation
- Report interpretation guides
- Mobile app user manual
- System administration guide

---

## 14. SUCCESS METRICS & KPIs

### 14.1 System Performance Metrics
**Operational Efficiency**:
- Reduction in stockout incidents (target: 80% reduction)
- Inventory accuracy improvement (target: 98%+)
- Purchase order processing time reduction (target: 50%)
- Stock movement tracking accuracy (target: 100%)

**Financial Impact**:
- Inventory carrying cost optimization
- Reduced food waste in restaurant operations
- Improved supplier negotiation leverage
- Better cash flow management

### 14.2 User Adoption Metrics
**Staff Engagement**:
- Daily active users of inventory system
- Mobile app usage rates
- Training completion rates
- User satisfaction scores
- Feature utilization rates

**Business Process Improvement**:
- Time savings in inventory management
- Error reduction in stock transactions
- Improved supplier relationship management
- Enhanced decision-making through reporting

---

This comprehensive wireframe document provides the foundation for implementing a robust stock and inventory management system that integrates seamlessly with the existing resort management modules while maintaining the established design consistency and user experience standards.

The system addresses the resort's critical stock management challenges through automated tracking, intelligent reordering, comprehensive reporting, and seamless integration with restaurant, accommodation, and activity operations. The mobile-first approach ensures staff can manage inventory efficiently from anywhere on the resort property, while role-based access controls maintain security and operational integrity.
