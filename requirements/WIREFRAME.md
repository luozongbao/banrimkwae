# Banrimkwae Resort Management System - User Interface Wireframes

## 1. Main Dashboard

**Purpose:** Central command center providing real-time overview and quick access to all system functions

**Layout Structure:**
- **Header Navigation Bar:**
  - Banrimkwae Resort logo (left)
  - Main navigation tabs: Dashboard | Reservations | Restaurant | Inventory | Reports | Settings
  - User profile dropdown with role indicator (right)
  - Language selector (TH/EN/CN)
  - Logout button

**Dashboard Content Grid:**

**Top Row - Key Metrics Cards (4 columns):**
- **Today's Occupancy**: XX/YY rooms occupied (percentage circle chart)
- **Revenue Today**: ฿X,XXX (comparison with yesterday)
- **Arrivals Today**: X guests checking in (with timeline)
- **Departures Today**: X guests checking out (with timeline)

**Second Row - Accommodation Status (Full width):**
- **Visual Room Grid**: Interactive layout showing rafts and houses
  - Color-coded room status: Green (Available), Red (Occupied), Yellow (Reserved), Gray (Maintenance)
  - Hover details: Guest name, check-out date, room type
  - Click to access booking details

**Third Row - Split View (2 columns):**
- **Left: Recent Activity Feed**
  - New bookings (last 24 hours)
  - Check-ins/check-outs
  - Restaurant orders
  - Inventory alerts
  - System notifications
  
- **Right: Quick Actions Panel**
  - "Walk-in Check-in" button
  - "New Reservation" button
  - "Restaurant Order" button
  - "Emergency Maintenance" button
  - "Stock Alert Review" button

**Bottom Row - Alerts & Notifications:**
- **Critical Alerts Bar**: Low inventory, maintenance issues, overbookings
- **Weather Widget**: Local weather for guest services
- **Calendar Preview**: Upcoming events and high-occupancy dates
## 2. Booking & Reservation Management

**Purpose:** Comprehensive booking management for rafts and houses with visual availability calendar

**Page Layout:**

**Header Section:**
- **Search & Filter Bar:**
  - Booking number search (auto-complete)
  - Guest name search (with suggestions)
  - Date range picker (check-in/check-out)
  - Accommodation type filter (All/Rafts/Houses)
  - Status filter (All/Confirmed/Checked In/Checked Out/Cancelled)
  - "Reset Filters" and "Apply Filters" buttons

**Main Content Area - Split View:**

**Left Panel (60% width) - Booking List:**
- **Sortable Data Table:**
  - Columns: Booking #, Guest Name, Accommodation/Room, Check-in, Check-out, Nights, Status, Total Amount
  - Row actions: View Details, Edit, Cancel, Print Confirmation
  - Pagination controls at bottom
  - Color-coded status indicators
  - Export to Excel/PDF buttons

**Right Panel (40% width) - Calendar View:**
- **Monthly Calendar Grid:**
  - Visual availability heatmap
  - Date cells showing occupancy percentage
  - Click date to view daily details
  - Drag-and-drop booking modifications
  - Legend for color codes

**Bottom Section - Quick Actions:**
- **"New Reservation" button** (opens modal/new page)
- **"Group Booking" button** for multiple rooms
- **"Repeat Guest" button** for returning customers

**New Booking Modal/Form:**
- **Guest Information Section:**
  - Search existing guest or create new
  - Guest details form (name, contact, ID, preferences)
  - Additional guests/companions

- **Accommodation Selection:**
  - Visual accommodation picker with availability
  - Room type selection with pricing
  - Date picker with real-time availability check
  - Rate plan selection (Standard/Package/Corporate)

- **Booking Details:**
  - Special requests text area
  - Arrival time selection
  - Deposit calculation and payment options
  - Terms and conditions checkbox
  - Save/Confirm buttons
## 3. Restaurant Order Management

**Purpose:** Comprehensive POS system for restaurant orders with guest account integration

**Page Layout - Tab Structure:**

**Tab 1: Order Management**
- **Top Action Bar:**
  - "New Order" button (prominent, different colors for Dine-in/Room Service/Takeaway)
  - Order status filter tabs (All/Pending/Preparing/Ready/Completed)
  - Date range selector
  - Service location filter (Restaurant/Room Service/Pool Bar)

- **Main Order List:**
  - **Card-based Layout** (not table) for touch-friendly interface:
    - Order #, Table/Room, Guest Name, Order Type
    - Status badge with color coding
    - Order time and estimated completion
    - Total amount and payment status
    - Quick action buttons: View Details, Update Status, Print Receipt

**Tab 2: Kitchen Display System**
- **Order Queue Dashboard:**
  - Active orders in preparation sequence
  - Timer displays for each order
  - Item-level preparation status
  - Priority indicators (Normal/High/Urgent)
  - Staff assignment tracking

**New Order Interface:**

**Step 1: Order Type & Location**
- **Service Type Selection:**
  - Large buttons for: Dine-in, Room Service, Takeaway, Pool Service
  - Table/Room number selection (visual picker for dine-in)
  - Guest lookup and linking for room charges

**Step 2: Menu Item Selection**
- **Category Navigation (Left Sidebar):**
  - Menu categories with item counts
  - Search bar for quick item lookup
  - Dietary filter options (Vegetarian, Gluten-free, etc.)

- **Item Grid (Main Area):**
  - Card layout with item images
  - Name, description, price clearly displayed
  - Customization options (spice level, modifications)
  - Quick quantity selector
  - "Add to Order" buttons

**Step 3: Order Review & Checkout**
- **Order Summary Panel:**
  - Line items with quantities and modifications
  - Subtotal, tax, service charge breakdown
  - Special instructions text area
  - Payment method selection
  - Customer signature capture (if required)

**Mobile/Tablet Optimizations:**
- Touch-friendly button sizes
- Swipe gestures for order status updates
- Voice input for special instructions
- QR code generation for order tracking
## 4. Inventory Management

**Purpose:** Comprehensive stock management for restaurant and resort operations with automated tracking and alerts

**Page Layout - Tab Structure:**

**Tab 1: Stock Overview**

**Header Section:**
- **Alert Bar**: Critical low stock warnings (red banner)
- **Action Buttons**: "Add New Item", "Record Transaction", "Generate Purchase Order", "Stock Take"
- **Quick Filters**: Category dropdown, Status filter (All/Low Stock/Out of Stock/Overstocked), Search bar

**Main Content - Three-Column Layout:**

**Left Panel (25%) - Category Navigation:**
- **Category Tree View:**
  - Food & Beverages
    - Fresh Ingredients
    - Dry Goods
    - Beverages (Alcoholic)
    - Beverages (Non-Alcoholic)
  - Hotel Amenities
    - Room Supplies
    - Bathroom Amenities
    - Cleaning Supplies
  - Operations
    - Kitchen Equipment
    - Maintenance Supplies
  - **Active item counts per category**
  - **Low stock indicators (red dots)**

**Center Panel (50%) - Inventory List:**
- **Card-based Item Display:**
  - Item image/icon (left)
  - Item name and description
  - Current quantity with progress bar
  - Unit cost and total value
  - Last updated timestamp
  - Status badge (Normal/Low/Critical/Out)
  - Quick action buttons: "Add Stock", "Use Stock", "Edit Details"
- **Sorting Options**: Name, Quantity, Value, Last Updated, Status
- **Pagination with item count display**

**Right Panel (25%) - Item Details & Quick Actions:**
- **Selected Item Information:**
  - Full item details
  - Stock level chart (last 30 days)
  - Supplier information
  - Average consumption rate
  - Reorder suggestions
- **Quick Transaction Form:**
  - Transaction type selector
  - Quantity input
  - Reference/notes field
  - "Record Transaction" button

**Tab 2: Transactions History**

**Transaction Log Interface:**
- **Filter Bar:**
  - Date range picker
  - Transaction type filter (All/Purchase/Usage/Adjustment/Wastage)
  - User filter (who recorded the transaction)
  - Item/category filter

- **Transaction Timeline:**
  - Chronological list of all inventory movements
  - Color-coded transaction types
  - Details: Date/time, user, item, quantity change, balance after
  - Reference links (order numbers, purchase orders)
  - Search and export functionality

**Tab 3: Suppliers & Purchase Orders**

**Supplier Management:**
- **Supplier List with contact details**
- **Purchase Order creation and tracking**
- **Supplier performance metrics**
- **Order templates for regular purchases**

**New Item Modal/Form:**
- **Basic Information:**
  - Item name (required)
  - Category selection (dropdown)
  - Description/notes
  - Item image upload
  
- **Inventory Details:**
  - Unit of measurement (dropdown: kg, liter, piece, box, etc.)
  - Current quantity
  - Minimum stock level (for alerts)
  - Maximum stock level (for ordering)
  - Standard cost price
  
- **Supplier Information:**
  - Primary supplier selection
  - Supplier item code/SKU
  - Lead time (days)
  - Order multiple (minimum order quantity)

**Stock Transaction Modal:**
- **Transaction Header:**
  - Large transaction type buttons (Purchase/Usage/Adjustment/Wastage)
  - Date and time (defaulted to now, editable)
  - Reference number field (optional)

- **Item Selection:**
  - Searchable item picker with autocomplete
  - Current stock level display
  - Recent transaction history

- **Quantity and Details:**
  - Quantity input with unit display
  - Running balance calculation
  - Notes/reason field (required for adjustments/wastage)
  - Photo upload (for wastage documentation)

**Mobile Optimizations:**
- **Touch-friendly item cards**
- **Swipe gestures for quick actions**
- **Barcode scanning for item identification**
- **Voice input for transaction notes**
## 5. Reports & Analytics

**Purpose:** Comprehensive reporting and business intelligence for operational decision-making

**Page Layout - Dashboard Style:**

**Header Section:**
- **Report Type Selector:**
  - Quick access buttons: "Occupancy", "Revenue", "F&B", "Inventory", "Guest", "Financial"
  - Date range picker (preset options: Today, Yesterday, This Week, This Month, Custom)
  - Export options: PDF, Excel, CSV, Print
  - "Schedule Report" button for automated reporting

**Main Content - Grid Layout:**

**Top Row - Key Performance Indicators (KPI Cards):**
- **Occupancy Rate**: XX% with trend arrow and comparison period
- **Average Daily Rate (ADR)**: ฿X,XXX with month-over-month change
- **Revenue Per Available Room (RevPAR)**: ฿XXX with target comparison
- **Guest Satisfaction**: X.X/5.0 with recent review summary

**Second Row - Visual Analytics (2 columns):**

**Left: Revenue Analysis (60% width)**
- **Revenue Trend Chart:**
  - Line chart showing daily/weekly/monthly revenue
  - Multiple data series: Room Revenue, F&B Revenue, Total Revenue
  - Toggle between absolute values and percentages
  - Hover details with breakdown

**Right: Occupancy Heatmap (40% width)**
- **Calendar Heatmap:**
  - Visual representation of occupancy by date
  - Color intensity based on occupancy percentage
  - Click-through to daily details
  - Seasonal pattern identification

**Third Row - Detailed Analytics Tabs:**

**Tab 1: Occupancy Reports**
- **Accommodation Performance Table:**
  - Columns: Accommodation Name, Type, Occupancy %, Revenue, ADR, RevPAR
  - Sortable and filterable
  - Room-level drill-down capability
  - Comparison with previous periods

- **Booking Pattern Analysis:**
  - Lead time analysis (how far in advance bookings are made)
  - Length of stay distribution
  - Day-of-week patterns
  - Seasonal trends

**Tab 2: Revenue Reports**
- **Revenue Breakdown:**
  - Pie chart: Room Revenue vs F&B Revenue vs Services
  - Revenue by source (Direct, OTA, Walk-in)
  - Revenue by guest type (Domestic, International)
  - Payment method analysis

- **Profit Analysis:**
  - Gross profit margins by revenue stream
  - Cost analysis integration
  - Budget vs actual comparisons

**Tab 3: Food & Beverage Reports**
- **Menu Performance:**
  - Best-selling items table with quantities and revenue
  - Item profitability analysis
  - Category performance comparison
  - Time-based sales patterns (breakfast, lunch, dinner)

- **Service Analysis:**
  - Average order value trends
  - Service location performance (restaurant vs room service)
  - Customer preferences and dietary trend analysis

**Tab 4: Inventory Reports**
- **Stock Level Summary:**
  - Current stock values by category
  - Low stock alerts and recommendations
  - Inventory turnover rates
  - Wastage analysis with cost impact

- **Purchase Analysis:**
  - Supplier performance metrics
  - Cost trend analysis
  - Purchase order efficiency
  - Seasonal procurement patterns

**Tab 5: Guest Analytics**
- **Guest Demographics:**
  - Nationality breakdown with revenue contribution
  - Age group analysis
  - Repeat guest statistics
  - Guest lifetime value analysis

- **Guest Behavior Patterns:**
  - Average length of stay by guest type
  - Spending patterns (accommodation vs F&B)
  - Seasonal visit preferences
  - Satisfaction trends

**Custom Report Builder:**
- **Drag-and-drop report builder interface**
- **Field selection from available data sources**
- **Custom filters and groupings**
- **Chart type selection (bar, line, pie, table)**
- **Save custom reports for future use**

**Report Scheduling:**
- **Automated report generation**
- **Email distribution lists**
- **Frequency options (daily, weekly, monthly)**
- **Custom report templates**

**Mobile-Optimized Views:**
- **Simplified KPI dashboard for mobile devices**
- **Touch-friendly chart interactions**
- **Swipe navigation between report sections**
- **Offline report viewing capability**
## 6. User Management & System Administration

**Purpose:** Comprehensive user account management, role-based access control, and system administration

**Page Layout - Multi-Tab Interface:**

**Tab 1: User Accounts**

**Header Section:**
- **Action Bar:**
  - "Add New User" button (prominent primary button)
  - "Import Users" button (CSV/Excel import)
  - "Export User List" button
  - Active/Inactive user toggle filter
  - Search bar with advanced filters (name, role, department)

**Main Content - Split View:**

**Left Panel (70%) - User List:**
- **User Cards Layout** (preferred over table for visual appeal):
  - User avatar/profile picture
  - Full name and username
  - Role badge with color coding
  - Department/position
  - Status indicator (Active/Inactive/Locked)
  - Last login timestamp
  - Quick actions: Edit, Reset Password, Toggle Status, View Audit Log

- **List Controls:**
  - Sort options: Name, Role, Last Login, Created Date
  - Pagination with user count display
  - Bulk actions selection for multiple users

**Right Panel (30%) - User Details & Quick Actions:**
- **Selected User Profile:**
  - Full user information display
  - Recent activity summary
  - Login history (last 10 logins)
  - Permission summary
  - Quick action buttons

**Add/Edit User Modal:**
- **Personal Information Section:**
  - Profile picture upload
  - First name and last name (required)
  - Email address (required, unique)
  - Phone number
  - Employee ID (if applicable)
  - Department selection

- **Account Details:**
  - Username (required, unique)
  - Temporary password generation
  - Role assignment (dropdown with role descriptions)
  - Account status (Active/Inactive)
  - Force password change on first login checkbox

- **Additional Settings:**
  - Language preference
  - Timezone selection
  - Email notification preferences
  - Multi-factor authentication setup

**Tab 2: Roles & Permissions**

**Role Management Interface:**

**Left Side - Role List:**
- **Role Cards with User Counts:**
  - Role name and description
  - Number of assigned users
  - Permission count
  - System/custom role indicator
  - Actions: Edit, Clone, Delete (if custom)

**Right Side - Permission Matrix:**
- **Visual Permission Grid:**
  - Modules as columns (Booking, Restaurant, Inventory, Reports, etc.)
  - Actions as rows (Create, Read, Update, Delete, Approve, etc.)
  - Checkboxes for permission assignment
  - Color-coded permission levels (Full, Partial, None)
  - Save/Cancel buttons for changes

**Predefined Roles:**
- **System Administrator**: Full system access
- **Hotel Manager**: All hotel operations, reporting
- **Front Desk Agent**: Booking management, guest services
- **Restaurant Manager**: F&B operations, menu management
- **Kitchen Staff**: Order management, inventory usage
- **Housekeeping**: Room status, maintenance requests
- **Accountant**: Financial reports, billing management

**Custom Role Creation:**
- **Role Builder Interface:**
  - Role name and description fields
  - Copy from existing role option
  - Granular permission selection
  - Preview of role capabilities
  - User assignment during creation

**Tab 3: System Settings**

**Configuration Sections:**

**General Settings:**
- **Business Information:**
  - Resort name and logo upload
  - Contact information
  - Business registration details
  - Tax identification numbers

- **Operational Settings:**
  - Default check-in/check-out times
  - Timezone configuration
  - Currency settings
  - Language preferences
  - Date/time format settings

**Security Settings:**
- **Password Policy:**
  - Minimum password length
  - Character requirements
  - Password expiration policy
  - Login attempt limits
  - Account lockout duration

- **Access Control:**
  - Session timeout settings
  - IP address restrictions
  - Multi-factor authentication requirements
  - API access controls

**Integration Settings:**
- **Third-party Connections:**
  - OTA channel configurations
  - Payment gateway settings
  - Email service configuration
  - SMS service setup
  - Cloud storage connections

**Tab 4: Audit & Activity Logs**

**System Monitoring Interface:**

**Activity Dashboard:**
- **Real-time Activity Feed:**
  - Recent user actions (last 24 hours)
  - System events and alerts
  - Failed login attempts
  - Permission changes
  - Data modifications

**Audit Log Search:**
- **Advanced Filtering:**
  - Date range selector
  - User selection (dropdown with search)
  - Action type filter (Login, Create, Update, Delete, etc.)
  - Module filter (Booking, Restaurant, Inventory, etc.)
  - IP address filter

- **Detailed Log Entries:**
  - Timestamp with timezone
  - User information
  - Action performed
  - Entity affected (booking ID, room number, etc.)
  - Before/after values (for updates)
  - IP address and browser information
  - Export functionality

**Security Monitoring:**
- **Security Events:**
  - Failed login attempts
  - Password changes
  - Permission modifications
  - Suspicious activity alerts
  - System access outside business hours

**System Health:**
- **Performance Metrics:**
  - Database query performance
  - System response times
  - Error rates and patterns
  - Storage usage statistics
  - Backup status and history

**Mobile Administration:**
- **Simplified mobile interface for critical administrative tasks**
- **Push notifications for system alerts**
- **Quick user account toggles (activate/deactivate)**
- **Emergency access management**

**Backup & Recovery:**
- **Data Backup Configuration:**
  - Automated backup scheduling
  - Backup verification status
  - Recovery point objectives
  - Cloud backup settings
  - Manual backup initiation

## 7. Mobile Application Views

**Purpose:** Touch-optimized interfaces for tablets and mobile devices used by staff

**Key Mobile Interfaces:**

**Mobile Dashboard:**
- **Card-based layout optimized for touch**
- **Large, finger-friendly buttons**
- **Critical information at-a-glance**
- **Offline functionality for basic operations**

**Quick Check-in/Check-out:**
- **Streamlined guest processing**
- **QR code scanning for booking verification**
- **Digital signature capture**
- **Photo ID capture and storage**

**Housekeeping Module:**
- **Room status updates**
- **Maintenance request submission**
- **Task completion tracking**
- **Photo documentation for issues**

**Restaurant POS Mobile:**
- **Order taking with offline capability**
- **Kitchen communication**
- **Payment processing**
- **Receipt printing/digital delivery**

**Inventory Mobile:**
- **Barcode scanning for stock management**
- **Quick stock level updates**
- **Photo documentation for deliveries**
- **Supplier contact integration**

## Design Guidelines & Standards

**Visual Design Principles:**
- **Consistent color scheme**: Primary blue (#2563EB), Secondary green (#059669), Alert red (#DC2626)
- **Typography**: Clean, readable fonts with appropriate sizing for different screen sizes
- **Icons**: Consistent icon library (Feather Icons or Heroicons)
- **Spacing**: 8px grid system for consistent spacing
- **Buttons**: Clear hierarchy with primary, secondary, and tertiary button styles

**Accessibility Standards:**
- **WCAG 2.1 AA compliance**
- **Keyboard navigation support**
- **Screen reader compatibility**
- **Color contrast ratios meeting accessibility standards**
- **Alternative text for all images**

**Responsive Design:**
- **Mobile-first approach**
- **Breakpoints**: Mobile (320px+), Tablet (768px+), Desktop (1024px+), Large (1440px+)
- **Touch-friendly interactions on all devices**
- **Optimized loading for various network conditions**

**Performance Considerations:**
- **Lazy loading for images and large datasets**
- **Progressive enhancement**
- **Offline functionality for critical operations**
- **Fast page transitions and minimal loading states**