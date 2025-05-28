# PHASE 3 WIREFRAME
## Restaurant Management System

### Document Information
- **Project**: Banrimkwae Resort Management System
- **Phase**: Phase 3 - Restaurant Management (4-6 weeks)
- **Document Version**: 1.0
- **Last Updated**: May 28, 2025
- **Document Type**: Wireframe Documentation

---

## 1. PHASE OVERVIEW

### 1.1 Phase Scope
**Restaurant Management System** includes:
- Comprehensive menu management system
- Order processing for dine-in and room service
- Guest billing integration (charge to room)
- Kitchen order management and workflow
- Table management and reservations
- Restaurant-specific reporting and analytics
- Basic inventory tracking for restaurant supplies

### 1.2 Key Features
1. **Menu Management**: Dynamic menu creation with categories, pricing, and availability
2. **Order Processing**: Multi-channel ordering (dine-in, room service, mobile)
3. **Billing Integration**: Seamless charging to guest accommodation bills
4. **Kitchen Management**: Order workflow and status tracking
5. **Table Management**: Reservation system and table status tracking
6. **Inventory Foundation**: Basic restaurant inventory tracking

---

## 2. DESIGN SYSTEM CONTINUATION

### 2.1 Restaurant-Specific Colors
Building on the established design system:
- **Primary**: Resort Blue (#2E86AB)
- **Secondary**: Forest Green (#A23B72)
- **Accent**: Warm Orange (#F18F01)
- **Restaurant Red**: #D32F2F (for urgent orders, alerts)
- **Kitchen Yellow**: #FBC02D (for order status, preparation)
- **Success Green**: #388E3C (for completed orders)

### 2.2 Restaurant Icons
- **Menu**: utensils, chef-hat, food-items
- **Orders**: shopping-cart, clock, check-circle
- **Kitchen**: fire, timer, bell
- **Tables**: table, chair, map-pin
- **Billing**: credit-card, receipt, calculator

---

## 3. RESTAURANT MANAGEMENT WIREFRAMES

### 3.1 Restaurant Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] Banrimkwae Resort - Restaurant Management      [Profile▼] │
├─────────────────────────────────────────────────────────────────┤
│ [Dashboard] [Menu] [Orders] [Tables] [Kitchen] [Reports]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─── TODAY'S OVERVIEW ──────────────────────────────────────┐   │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │   │
│ │ │ 🍽️ 47   │ │ ⏱️ 8    │ │ 💰 12,450│ │ 📊 Revenue     │ │   │
│ │ │Orders   │ │Pending  │ │THB      │ │ Today          │ │   │
│ │ │Today    │ │Orders   │ │Today    │ │ ▄▄█▄▄█▄       │ │   │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─── ACTIVE ORDERS ────────────────────────────────────────┐   │
│ │ Order #001 | Table 5    | 2 items | 🟡 Preparing | 15:30 │   │
│ │ Order #002 | Room 101   | 3 items | 🔴 Urgent    | 15:25 │   │
│ │ Order #003 | Table 12   | 1 item  | 🟢 Ready     | 15:20 │   │
│ │ [View All Orders]                                        │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─── TABLE STATUS ─────────────────────────────────────────┐   │
│ │ 🟢 Available: 8 | 🟡 Occupied: 12 | 🔴 Reserved: 3     │   │
│ │ [View Table Map]                                         │   │
│ └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Menu Management Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Menu Management                                    [+ Add Item]  │
├─────────────────────────────────────────────────────────────────┤
│ Categories: [All] [Appetizers] [Main] [Desserts] [Beverages]    │
│ ┌─ Search ──────┐ [🔍]  Sort: [Name ▼] Filter: [Available ▼]   │
│ │               │                                              │
│ └───────────────┘                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ APPETIZERS ──────────────────────────────────────────────┐   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ [📷] Som Tam Thai        🟢 Available   [Edit] [❌] │  │   │
│ │ │      Classic papaya salad with lime     THB 120    │  │   │
│ │ │      Prep: 10min | Allergens: Fish sauce          │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ [📷] Spring Rolls        🟡 Low Stock   [Edit] [❌] │  │   │
│ │ │      Fresh vegetable rolls with sauce   THB 80     │  │   │
│ │ │      Prep: 5min | Allergens: None                 │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ MAIN COURSES ────────────────────────────────────────────┐   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ [📷] Pad Thai            🟢 Available   [Edit] [❌] │  │   │
│ │ │      Traditional stir-fried noodles     THB 180    │  │   │
│ │ │      Prep: 15min | Allergens: Peanuts, Egg       │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Add/Edit Menu Item Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ ✕                     Add New Menu Item                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Item Name (Thai): ┌─────────────────────────────────────────┐   │
│                   │ ผัดไทย                                   │   │
│                   └─────────────────────────────────────────┘   │
│                                                                 │
│ Item Name (EN):   ┌─────────────────────────────────────────┐   │
│                   │ Pad Thai                                │   │
│                   └─────────────────────────────────────────┘   │
│                                                                 │
│ Category:         ┌─ Main Courses ──────────────────────▼─┐   │
│                   └─────────────────────────────────────────┘   │
│                                                                 │
│ Description:      ┌─────────────────────────────────────────┐   │
│                   │ Traditional Thai stir-fried rice       │   │
│                   │ noodles with tamarind, fish sauce,     │   │
│                   │ dried shrimp, tofu, and bean sprouts   │   │
│                   └─────────────────────────────────────────┘   │
│                                                                 │
│ Price (THB):      ┌─────────┐    Preparation Time: ┌────────┐   │
│                   │ 180     │                      │ 15 min │   │
│                   └─────────┘                      └────────┘   │
│                                                                 │
│ Allergens:        ☑ Peanuts  ☑ Egg  ☐ Dairy  ☐ Gluten         │
│                   ☐ Shellfish ☐ Fish ☐ Soy                     │
│                                                                 │
│ Image Upload:     [📁 Choose File] padthai.jpg                 │
│                                                                 │
│ Status:           ● Available  ○ Unavailable  ○ Seasonal       │
│                                                                 │
│ Inventory Link:   ┌─ Link to Ingredients ──────────────▼─┐     │
│                   └─────────────────────────────────────────┘   │
│                                                                 │
│                    [Cancel]              [Save Item]           │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Order Management Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Order Management                             [+ New Order]      │
├─────────────────────────────────────────────────────────────────┤
│ Filter: [All Orders ▼] [Today ▼] [Dine-in ▼] Status: [All ▼]   │
│ ┌─ Search Order ──────┐ [🔍]                                    │
│ │                     │                                        │
│ └─────────────────────┘                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ PENDING ORDERS ──────────────────────────────────────────┐   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ #ORD-001 | Table 5      | 15:30 | 🔴 URGENT       │  │   │
│ │ │ • Pad Thai x1 (Special: No peanuts)                │  │   │
│ │ │ • Som Tam x1                                       │  │   │
│ │ │ Total: THB 300 | Guest: Walk-in | [View] [Edit]   │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ #ORD-002 | Room 101     | 15:25 | 🟡 PREPARING    │  │   │
│ │ │ • Green Curry x2                                   │  │   │
│ │ │ • Jasmine Rice x2                                  │  │   │
│ │ │ • Thai Tea x2                                      │  │   │
│ │ │ Total: THB 520 | Guest: Smith, J. | [View] [Edit] │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ COMPLETED ORDERS ────────────────────────────────────────┐   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ #ORD-003 | Table 12     | 15:20 | 🟢 SERVED       │  │   │
│ │ │ • Mango Sticky Rice x1                             │  │   │
│ │ │ Total: THB 120 | Guest: Walk-in | [Receipt]       │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 New Order Creation Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Create New Order                                      [✕ Close] │
├─────────────────────────────────────────────────────────────────┤
│ Order Type: ● Dine-in  ○ Room Service  ○ Takeaway              │
│                                                                 │
│ Table/Room: ┌─ Select Table/Room ─────────────────────▼─┐       │
│             └───────────────────────────────────────────┘       │
│                                                                 │
│ Guest Info: ┌─ Link to Guest Account ────────────────▼─┐        │
│             └───────────────────────────────────────────┘       │
│             Or: [📝 Guest Name] [📞 Phone] [Walk-in]           │
├─────────────────────────────────────────────────────────────────┤
│ ┌─ MENU SELECTION ─────────────────────────┐ ┌─ ORDER CART ──┐ │
│ │ Category: [All ▼]                        │ │               │ │
│ │ ┌─ Search ──────────┐ [🔍]               │ │ Items: 2      │ │
│ │ │                   │                   │ │ Total: 300 THB│ │
│ │ └───────────────────┘                   │ │               │ │
│ │                                         │ │ ┌───────────┐ │ │
│ │ ┌─ Pad Thai ─────────┐ [+ Add]          │ │ │Pad Thai x1│ │ │
│ │ │ THB 180            │                  │ │ │THB 180   │ │ │
│ │ │ Prep: 15min        │                  │ │ │[- Edit +] │ │ │
│ │ └────────────────────┘                  │ │ └───────────┘ │ │
│ │                                         │ │ ┌───────────┐ │ │
│ │ ┌─ Som Tam ──────────┐ [+ Add]          │ │ │Som Tam x1 │ │ │
│ │ │ THB 120            │                  │ │ │THB 120   │ │ │
│ │ │ Prep: 10min        │                  │ │ │[- Edit +] │ │ │
│ │ └────────────────────┘                  │ │ └───────────┘ │ │
│ │                                         │ │               │ │
│ │ ┌─ Green Curry ──────┐ [+ Add]          │ │ Special Notes:│ │
│ │ │ THB 220            │                  │ │ ┌───────────┐ │ │
│ │ │ Prep: 20min        │                  │ │ │No peanuts │ │ │
│ │ └────────────────────┘                  │ │ │           │ │ │
│ └─────────────────────────────────────────┘ │ └───────────┘ │ │
│                                             └───────────────┘ │
│                                                                 │
│                    [Cancel]           [Create Order]           │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Kitchen Management Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Kitchen Management                              [🔄 Refresh]    │
├─────────────────────────────────────────────────────────────────┤
│ Status Filter: [All] [New] [Preparing] [Ready] [Served]         │
│ Priority: [All] [Urgent] [Normal] [Low]                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ NEW ORDERS ──────────────────────────────────────────────┐   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ #001 | Table 5 | 15:30 | 🔴 URGENT | Est: 25min    │  │   │
│ │ │ • Pad Thai x1 (No peanuts)                         │  │   │
│ │ │ • Som Tam x1                                       │  │   │
│ │ │ [🍳 Start Cooking]                                 │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ IN PREPARATION ──────────────────────────────────────────┐   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ #002 | Room 101 | 15:25 | ⏱️ 12min left          │  │   │
│ │ │ • Green Curry x2 (Cooking)                         │  │   │
│ │ │ • Jasmine Rice x2 (Ready)                          │  │   │
│ │ │ • Thai Tea x2 (Pending)                            │  │   │
│ │ │ [✅ Mark Ready] [⏰ Add Time]                       │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ READY FOR SERVICE ───────────────────────────────────────┐   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ #003 | Table 12 | 15:20 | 🟢 Ready 3min ago       │  │   │
│ │ │ • Mango Sticky Rice x1                             │  │   │
│ │ │ [🚚 Mark Served] [🔔 Notify Server]                │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.7 Table Management Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Table Management                              [🗓️ Reservations] │
├─────────────────────────────────────────────────────────────────┤
│ Floor: [Main Floor ▼] View: [Map] [List] Time: [Current: 15:35] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ TABLE MAP ───────────────────────────────────────────────┐   │
│ │                                                           │   │
│ │  [T1]🟢  [T2]🔴  [T3]🟡    Kitchen    [T10]🟢 [T11]🟡   │   │
│ │    2      4       2         🍳         4       6        │   │
│ │                                                           │   │
│ │  [T4]🟢  [T5]🟡  [T6]🟢              [T12]🔴 [T13]🟢   │   │
│ │    4      6       4                     8       2        │   │
│ │                                                           │   │
│ │  [T7]🟢  [T8]🟢  [T9]🔴     Bar       [T14]🟡 [T15]🟢   │   │
│ │    2      2       4         🍹         4       6        │   │
│ │                                                           │   │
│ │ Legend: 🟢 Available 🟡 Occupied 🔴 Reserved             │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ TABLE STATUS SUMMARY ────────────────────────────────────┐   │
│ │ Available: 8 tables (24 seats)                            │   │
│ │ Occupied: 6 tables (22 guests) Avg duration: 45min        │   │
│ │ Reserved: 3 tables (12 seats) Next: 16:00                 │   │
│ │ [📋 Manage Reservations] [🧹 Table Cleanup Queue]        │   │
│ └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.8 Reservation Management Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Table Reservations                           [+ New Reservation] │
├─────────────────────────────────────────────────────────────────┤
│ Date: [📅 Today: May 28, 2025] View: [Day] [Week] [Month]       │
│ Status: [All] [Confirmed] [Pending] [Cancelled]                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ TODAY'S RESERVATIONS ────────────────────────────────────┐   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ 16:00 | Table 2 (4 guests) | Smith Family          │  │   │
│ │ │ Phone: +66-xxx-xxxx | Confirmed                    │  │   │
│ │ │ Special: Birthday celebration                       │  │   │
│ │ │ [✅ Check-in] [📝 Edit] [❌ Cancel]                 │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ 18:30 | Table 12 (8 guests) | Thai Wedding Party   │  │   │
│ │ │ Phone: +66-xxx-xxxx | Confirmed                    │  │   │
│ │ │ Special: Vegetarian options required               │  │   │
│ │ │ [✅ Check-in] [📝 Edit] [❌ Cancel]                 │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ │ ┌─────────────────────────────────────────────────────┐  │   │
│ │ │ 19:00 | Table 5 (6 guests) | Johnson Group         │  │   │
│ │ │ Phone: +66-xxx-xxxx | Pending Confirmation         │  │   │
│ │ │ Special: Allergy to seafood                        │  │   │
│ │ │ [✅ Confirm] [📝 Edit] [❌ Cancel]                  │  │   │
│ │ └─────────────────────────────────────────────────────┘  │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ TOMORROW'S RESERVATIONS ─────────────────────────────────┐   │
│ │ 12:00 | Table 8 (2 guests) | Anderson, M.              │   │
│ │ 19:30 | Table 15 (6 guests) | Lee Family                │   │
│ │ [View All Tomorrow's Reservations]                       │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.9 Billing Integration Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Restaurant Billing & Guest Charges                             │
├─────────────────────────────────────────────────────────────────┤
│ Guest: [Smith, John] Room: [101] Check-in: [May 26, 2025]      │
│ Current Bill Status: [Open] Total Charges: [THB 2,450]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ RESTAURANT CHARGES ───────────────────────────────────────┐   │
│ │ Date     | Time  | Order # | Items           | Amount     │   │
│ │ ---------|-------|---------|-----------------|----------   │   │
│ │ May 26   | 19:30 | #001    | Dinner (2 pax)  | THB 850   │   │
│ │ May 27   | 08:00 | #045    | Breakfast       | THB 320   │   │
│ │ May 27   | 12:30 | #067    | Lunch           | THB 480   │   │
│ │ May 28   | 15:25 | #089    | Room Service    | THB 520   │   │
│ │                                                            │   │
│ │ Restaurant Subtotal:                        THB 2,170     │   │
│ │ Service Charge (10%):                       THB 217       │   │
│ │ VAT (7%):                                   THB 152       │   │
│ │ Total Restaurant Charges:                   THB 2,539     │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ QUICK ACTIONS ────────────────────────────────────────────┐   │
│ │ [💳 Charge New Item] [🧾 View Full Bill] [📄 Print Bill] │   │
│ │ [✉️ Email Bill] [🏨 Transfer to Lobby] [💰 Process Payment]│   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ PAYMENT OPTIONS ──────────────────────────────────────────┐   │
│ │ ○ Charge to Room (Default)                                 │   │
│ │ ○ Cash Payment                                             │   │
│ │ ○ Credit Card                                              │   │
│ │ ○ Mobile Payment (PromptPay)                               │   │
│ └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. GUEST INTERFACE WIREFRAMES

### 4.1 Guest Restaurant Menu (Mobile/Tablet)
```
┌─────────────────────────────────────────┐
│ 🏨 Banrimkwae Restaurant      [🛒 Cart] │
├─────────────────────────────────────────┤
│ Welcome, John Smith (Room 101)          │
│ Order Type: ●Room Service ○Table Service│
├─────────────────────────────────────────┤
│ ┌─ Categories ─────────────────────────┐ │
│ │[🥗Appetizers][🍛Main][🍰Desserts]    │ │
│ │[☕Beverages][🍜Specials][🌶️Spicy]    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─ Search ──────────┐ [🔍] [Filter▼]   │
│ │                   │                  │
│ └───────────────────┘                  │
│                                         │
│ ┌─ FEATURED TODAY ───────────────────┐   │
│ │ [📷] Pad Thai Special               │   │
│ │      Our chef's signature dish     │   │
│ │      🌟🌟🌟🌟🌟 (4.8/5)           │   │
│ │      THB 180        [+ Add to Cart]│   │
│ └─────────────────────────────────────┘   │
│                                         │
│ ┌─ APPETIZERS ─────────────────────────┐ │
│ │ [📷] Som Tam Thai        THB 120    │ │
│ │      Classic papaya salad           │ │
│ │      🌶️🌶️ Spicy | 10min          │ │
│ │      [+ Add] [ℹ️ Info]              │ │
│ │ ─────────────────────────────────── │ │
│ │ [📷] Spring Rolls        THB 80     │ │
│ │      Fresh vegetable rolls          │ │
│ │      🌱 Vegetarian | 5min          │ │
│ │      [+ Add] [ℹ️ Info]              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cart: 2 items | THB 300] [💳 Checkout]│
└─────────────────────────────────────────┘
```

### 4.2 Guest Order Tracking Interface
```
┌─────────────────────────────────────────┐
│ 🏨 Order Status          [🔄 Refresh]  │
├─────────────────────────────────────────┤
│ Order #089 | Room Service | 15:25       │
│ Estimated Delivery: 16:10 (45 minutes)  │
├─────────────────────────────────────────┤
│                                         │
│ ┌─ ORDER PROGRESS ─────────────────────┐ │
│ │ ✅ Order Received     [15:25]        │ │
│ │ ✅ Payment Confirmed  [15:26]        │ │
│ │ 🔄 Kitchen Preparing  [15:30]        │ │
│ │ ⏳ Quality Check      [Pending]      │ │
│ │ ⏳ Out for Delivery   [Pending]      │ │
│ │ ⏳ Delivered          [Pending]      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─ YOUR ORDER ──────────────────────────┐ │
│ │ • Green Curry (Medium Spicy) x2      │ │
│ │   Special: Extra vegetables          │ │
│ │ • Jasmine Rice x2                    │ │
│ │ • Thai Iced Tea x2                   │ │
│ │ ─────────────────────────────────── │ │
│ │ Subtotal:              THB 460      │ │
│ │ Service Charge (10%):  THB 46       │ │
│ │ VAT (7%):              THB 32       │ │
│ │ Total:                 THB 538      │ │
│ │ Payment: Charged to Room 101        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Special Instructions:                   │
│ "Please deliver quietly, baby sleeping" │
│                                         │
│ [📞 Call Restaurant] [❌ Cancel Order] │
│ [🏨 Back to Main Menu]                 │
└─────────────────────────────────────────┘
```

---

## 5. RESTAURANT INVENTORY WIREFRAMES

### 5.1 Restaurant Inventory Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ Restaurant Inventory Management            [📦 Stock Management] │
├─────────────────────────────────────────────────────────────────┤
│ ┌─── INVENTORY OVERVIEW ──────────────────────────────────────┐   │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │   │
│ │ │ 📦 247  │ │ ⚠️ 12   │ │ 🔴 3    │ │ 📊 Usage       │ │   │
│ │ │Items    │ │Low Stock│ │Critical │ │ Today          │ │   │
│ │ │in Stock │ │Alerts   │ │Level    │ │ ▄▄█▄▄█▄       │ │   │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─── CRITICAL ALERTS ─────────────────────────────────────────┐   │
│ │ 🔴 Rice (Jasmine) - Only 2kg left (Min: 10kg)              │   │
│ │ 🔴 Fish Sauce - Only 0.5L left (Min: 2L)                   │   │
│ │ ⚠️ Coconut Milk - 8 cans left (Min: 20 cans)              │   │
│ │ [📋 Generate Purchase Order] [✉️ Notify Manager]           │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─── TODAY'S CONSUMPTION ─────────────────────────────────────┐   │
│ │ Rice: -5kg | Vegetables: -12kg | Meat: -8kg | Oil: -2L     │   │
│ │ [📊 View Detailed Report]                                   │   │
│ └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Recipe Management Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Recipe Management                              [+ Add Recipe]    │
├─────────────────────────────────────────────────────────────────┤
│ Link Menu Items to Ingredients for Automatic Stock Deduction    │
│ ┌─ Search Recipe ──────┐ [🔍] Category: [All ▼] [Main ▼]       │
│ │                      │                                        │
│ └──────────────────────┘                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─ PAD THAI RECIPE ──────────────────────────────────────────┐   │
│ │ Menu Item: Pad Thai (THB 180) | Portions: 1 serving        │   │
│ │                                                             │   │
│ │ Ingredients Required:                                       │   │
│ │ • Rice Noodles (dried)     150g   [Stock: 25kg ✅]        │   │
│ │ • Vegetable Oil            30ml   [Stock: 5L ✅]          │   │
│ │ • Garlic (minced)          10g    [Stock: 2kg ✅]         │   │
│ │ • Eggs                     2 pcs  [Stock: 50 pcs ✅]      │   │
│ │ • Bean Sprouts             50g    [Stock: 3kg ✅]         │   │
│ │ • Tamarind Paste           15ml   [Stock: 500ml ✅]       │   │
│ │ • Fish Sauce               10ml   [Stock: 0.5L ⚠️]        │   │
│ │ • Palm Sugar               10g    [Stock: 1kg ✅]         │   │
│ │ • Peanuts (crushed)        15g    [Stock: 2kg ✅]         │   │
│ │ • Lime                     1/4 pc [Stock: 20 pcs ✅]      │   │
│ │                                                             │   │
│ │ Cost per serving: THB 45 | Profit Margin: 75%              │   │
│ │ [📝 Edit Recipe] [📊 Cost Analysis] [🔗 Link Suppliers]   │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─ GREEN CURRY RECIPE ───────────────────────────────────────┐   │
│ │ Menu Item: Green Curry (THB 220) | Portions: 1 serving     │   │
│ │ • Green Curry Paste        30g    [Stock: 1kg ✅]         │   │
│ │ • Coconut Milk             200ml  [Stock: 8 cans ⚠️]      │   │
│ │ • Chicken Breast           150g   [Stock: 5kg ✅]         │   │
│ │ • Thai Eggplant            100g   [Stock: 2kg ✅]         │   │
│ │ Cost per serving: THB 68 | Profit Margin: 69%              │   │
│ │ [📝 Edit Recipe] [📊 Cost Analysis]                        │   │
│ └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. RESTAURANT REPORTING WIREFRAMES

### 6.1 Restaurant Performance Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ Restaurant Reports & Analytics          [📅 Date Range: Today ▼]│
├─────────────────────────────────────────────────────────────────┤
│ ┌─── SALES OVERVIEW ──────────────────────────────────────────┐   │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │   │
│ │ │ 💰12,450│ │ 🍽️ 47   │ │ 👥 73   │ │ 📈 Revenue     │ │   │
│ │ │THB Today│ │Orders   │ │Customers│ │ Trend          │ │   │
│ │ │+15%     │ │+8%      │ │+12%     │ │ ▄▆█▄▆█▄       │ │   │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─── TOP PERFORMING ITEMS ────────────────────────────────────┐   │
│ │ 1. Pad Thai          │ 12 orders │ THB 2,160 │ 🔥 Hot    │   │
│ │ 2. Green Curry       │ 8 orders  │ THB 1,760 │ ⭐ Popular│   │
│ │ 3. Som Tam           │ 10 orders │ THB 1,200 │ 📈 Rising │   │
│ │ 4. Mango Sticky Rice │ 6 orders  │ THB 720   │ 🍰 Sweet  │   │
│ │ [📊 View Detailed Item Analysis]                            │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─── HOURLY SALES PATTERN ────────────────────────────────────┐   │
│ │     📊 Orders by Hour                                       │   │
│ │ 15│    ██                                                   │   │
│ │ 10│    ██  ██                                               │   │
│ │  5│ ██ ██  ██ ██                                            │   │
│ │  0│ ─────────────────────────────────────                   │   │
│ │   6  8 10 12 14 16 18 20 22                                │   │
│ │ Peak Hours: 12:00-14:00, 18:00-20:00                       │   │
│ └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Financial Reporting Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Restaurant Financial Reports    [📅 Period: This Month ▼] [📄] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─── REVENUE BREAKDOWN ───────────────────────────────────────┐   │
│ │ Total Revenue:          THB 347,580                         │   │
│ │ • Dine-in:             THB 234,650 (67.5%)                 │   │
│ │ • Room Service:        THB 89,340 (25.7%)                  │   │
│ │ • Takeaway:            THB 23,590 (6.8%)                   │   │
│ │                                                             │   │
│ │ Service Charges:        THB 34,758 (10%)                   │   │
│ │ VAT Collected:          THB 24,331 (7%)                    │   │
│ │ Net Revenue:            THB 288,491                         │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─── COST ANALYSIS ───────────────────────────────────────────┐   │
│ │ Cost of Goods Sold:     THB 104,657 (36.3%)                │   │
│ │ • Ingredients:         THB 87,240                          │   │
│ │ • Packaging:           THB 8,970                           │   │
│ │ • Supplies:            THB 8,447                           │   │
│ │                                                             │   │
│ │ Operating Expenses:     THB 89,340 (31.0%)                 │   │
│ │ • Staff Wages:         THB 65,000                          │   │
│ │ • Utilities:           THB 12,890                          │   │
│ │ • Maintenance:         THB 11,450                          │   │
│ │                                                             │   │
│ │ Gross Profit:          THB 94,494 (32.7%)                  │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─── COMPARATIVE ANALYSIS ────────────────────────────────────┐   │
│ │ vs Last Month:          +12.5% (THB 38,730)                │   │
│ │ vs Same Month Last Year: +8.7% (THB 27,890)               │   │
│ │ Average Daily Revenue:   THB 12,450                        │   │
│ │ Best Day: May 15        THB 18,950                         │   │
│ │ [📊 Detailed Daily Breakdown] [📈 Trend Analysis]          │   │
│ └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. MOBILE RESPONSIVE DESIGN

### 7.1 Restaurant Dashboard Mobile
```
┌─────────────────────────────────┐
│ ☰ Restaurant Management    [👤] │
├─────────────────────────────────┤
│ ┌─ TODAY'S STATS ─────────────┐ │
│ │ Orders: 47  Revenue: 12,450 │ │
│ │ Pending: 8  Served: 39      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ QUICK ACTIONS ─────────────┐ │
│ │ [📝 New Order] [🍽️ Menu]    │ │
│ │ [🍳 Kitchen]   [🏠 Tables]   │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ URGENT ORDERS ─────────────┐ │
│ │ #001 | T5 | 🔴 15:30        │ │
│ │ Pad Thai, Som Tam           │ │
│ │ [View] [Kitchen]            │ │
│ │ ─────────────────────────── │ │
│ │ #002 | R101 | 🟡 15:25      │ │
│ │ Green Curry x2              │ │
│ │ [View] [Kitchen]            │ │
│ └─────────────────────────────┘ │
│                                 │
│ [📊 Reports] [⚙️ Settings]     │
└─────────────────────────────────┘
```

### 7.2 Kitchen Management Mobile
```
┌─────────────────────────────────┐
│ 🍳 Kitchen Orders          [🔄] │
├─────────────────────────────────┤
│ Filter: [All▼] [New] [Preparing]│
├─────────────────────────────────┤
│ ┌─ NEW (2) ───────────────────┐ │
│ │ #001 🔴 Table 5    15:30    │ │
│ │ • Pad Thai (No peanuts)     │ │
│ │ • Som Tam                   │ │
│ │ Est: 25min [START COOKING]  │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ PREPARING (3) ─────────────┐ │
│ │ #002 ⏱️ Room 101   15:25     │ │
│ │ • Green Curry x2 (12min)    │ │
│ │ • Rice x2 ✅               │ │
│ │ • Thai Tea x2 (Pending)     │ │
│ │ [MARK READY] [+TIME]        │ │
│ │ ─────────────────────────── │ │
│ │ #003 ⏱️ Table 8    15:15     │ │
│ │ • Pad See Ew (5min)         │ │
│ │ [MARK READY]                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ READY (1) ─────────────────┐ │
│ │ #004 🟢 Table 12   15:20     │ │
│ │ • Mango Sticky Rice         │ │
│ │ Ready 3min ago              │ │
│ │ [MARK SERVED] [NOTIFY]      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## 8. DATA INTEGRATION & APIs

### 8.1 Database Tables Required
```sql
-- Restaurant Management Tables
restaurants
- id, name, location, status, settings

menu_categories  
- id, restaurant_id, name, display_order, status

menu_items
- id, category_id, name_th, name_en, description
- price, preparation_time, image_url, allergens
- status, inventory_linked

orders
- id, order_number, guest_id, room_number, table_id
- order_type, total_amount, status, special_notes
- created_at, completed_at

order_items
- id, order_id, menu_item_id, quantity, unit_price
- special_instructions, status

tables
- id, restaurant_id, table_number, capacity
- location, status, current_order_id

reservations
- id, table_id, guest_name, phone, party_size
- reservation_date, special_requests, status

restaurant_inventory
- id, item_name, current_stock, minimum_level
- unit, cost_per_unit, supplier_id, last_updated

recipes
- id, menu_item_id, ingredient_id, quantity_needed
- unit, cost_impact

inventory_transactions
- id, item_id, transaction_type, quantity
- reference_order_id, created_at, notes
```

### 8.2 API Endpoints
```javascript
// Restaurant Management APIs
GET    /api/restaurant/dashboard
GET    /api/restaurant/menu
POST   /api/restaurant/menu/items
PUT    /api/restaurant/menu/items/{id}
DELETE /api/restaurant/menu/items/{id}

// Order Management APIs  
GET    /api/restaurant/orders
POST   /api/restaurant/orders
PUT    /api/restaurant/orders/{id}/status
GET    /api/restaurant/orders/{id}

// Kitchen Management APIs
GET    /api/kitchen/orders
PUT    /api/kitchen/orders/{id}/start
PUT    /api/kitchen/orders/{id}/ready
PUT    /api/kitchen/orders/{id}/served

// Table Management APIs
GET    /api/restaurant/tables
PUT    /api/restaurant/tables/{id}/status
GET    /api/restaurant/reservations
POST   /api/restaurant/reservations

// Billing Integration APIs
GET    /api/billing/guest/{guest_id}/charges
POST   /api/billing/charges
GET    /api/billing/guest/{guest_id}/total

// Inventory APIs
GET    /api/restaurant/inventory
PUT    /api/restaurant/inventory/{id}/stock
GET    /api/restaurant/recipes
POST   /api/restaurant/recipes

// Reporting APIs
GET    /api/restaurant/reports/daily
GET    /api/restaurant/reports/financial
GET    /api/restaurant/reports/items
```

### 8.3 Integration Points
1. **Guest Management System**: Link restaurant orders to guest accounts
2. **Accommodation System**: Room service delivery and billing integration  
3. **Payment System**: Process payments and charge to room bills
4. **Inventory System**: Automatic stock deduction based on recipe consumption
5. **Reporting System**: Financial and operational reporting integration
6. **Mobile App**: Real-time order tracking and menu browsing

---

## 9. TECHNICAL IMPLEMENTATION NOTES

### 9.1 Real-time Features
- **Order Status Updates**: WebSocket connections for live kitchen updates
- **Table Status**: Real-time table availability and reservation status
- **Inventory Alerts**: Live stock level monitoring and automatic alerts
- **Kitchen Display**: Live order queue with timing and priority updates

### 9.2 Performance Optimization
- **Menu Caching**: Cache menu items and categories for fast loading
- **Image Optimization**: Compressed food images with lazy loading
- **Database Indexing**: Optimized queries for order and inventory lookups
- **Mobile Optimization**: Lightweight mobile interfaces for staff devices

### 9.3 Security Considerations
- **Role-based Access**: Kitchen staff vs. management vs. waitstaff permissions
- **Order Validation**: Prevent unauthorized order modifications
- **Payment Security**: Secure handling of guest billing information
- **Audit Logging**: Track all order changes and financial transactions

### 9.4 Thai Localization
- **Menu Translation**: Thai and English menu item names and descriptions
- **Currency Display**: THB formatting with proper decimal handling
- **Date/Time**: Thai timezone and cultural date preferences
- **Receipt Printing**: Thai language receipt templates

---

## 10. TESTING & QUALITY ASSURANCE

### 10.1 Functional Testing
- Menu management CRUD operations
- Order workflow from creation to completion
- Kitchen order processing and status updates
- Table management and reservation system
- Billing integration with guest accounts
- Inventory deduction and alert system

### 10.2 Performance Testing
- Order processing under peak dining hours
- Multiple simultaneous kitchen operations
- Real-time updates across multiple devices
- Mobile app responsiveness during busy periods

### 10.3 Integration Testing
- Guest billing system integration
- Accommodation room service delivery
- Inventory system automatic deductions
- Payment processing and error handling

### 10.4 User Acceptance Testing
- Kitchen staff workflow efficiency
- Waitstaff order management usability
- Guest mobile ordering experience
- Management reporting accuracy

---

## 11. DEPLOYMENT & TRAINING

### 11.1 Deployment Strategy
- **Phase 3A**: Menu management and basic ordering (Week 1-2)
- **Phase 3B**: Kitchen workflow and table management (Week 3-4)  
- **Phase 3C**: Billing integration and inventory foundation (Week 5-6)
- **Phase 3D**: Mobile optimization and reporting (Week 6)

### 11.2 Staff Training Requirements
- **Kitchen Staff**: Order display system, status updates, timing management
- **Waitstaff**: Order taking, table management, guest billing
- **Management**: Menu management, reporting, inventory monitoring
- **Guest Services**: Mobile app assistance, room service coordination

### 11.3 Success Metrics
- Order processing time reduction by 30%
- Kitchen efficiency improvement by 25%
- Guest satisfaction with ordering process > 4.5/5
- Staff adoption rate > 90% within 2 weeks
- Integration accuracy with billing system > 99%

---

**End of Phase 3 Wireframe Document**
