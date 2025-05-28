# PHASE II WIREFRAME
## Accommodation and Activity Management (4-6 weeks)

### Document Information
- **Phase**: Phase II - Accommodation and Activity Management
- **Duration**: 4-6 weeks
- **Document Version**: 1.0
- **Last Updated**: May 28, 2025
- **Document Type**: User Interface Wireframes

---

## 1. ACCOMMODATION MANAGEMENT WIREFRAMES

### 1.1 Accommodation Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Header with Navigation                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ACCOMMODATION MANAGEMENT                                  │
│                                                             │
│  [+ Add Accommodation]  [Import]  [Calendar View] [List]   │
│                                                             │
│  Quick Stats:                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ TOTAL    │ │ OCCUPIED │ │ AVAILABLE│ │ MAINTENANCE│     │
│  │   42     │ │    28    │ │    12    │ │     2     │     │
│  │ Units    │ │  Units   │ │  Units   │ │   Units   │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  Filter: Type:[All ▼] Status:[All ▼] Date:[Today ▼]       │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ID │ Name      │ Type  │ Rooms │ Status    │ Actions  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │R01 │Sunset Raft│ Raft  │ 2/2   │ Occupied  │[👁][✏️]│ │
│  │    │           │       │       │ ⚫        │        │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │R02 │River View │ Raft  │ 1/3   │ Partially │[👁][✏️]│ │
│  │    │Raft       │       │       │ 🔶        │        │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │H01 │Garden     │ House │ 0/4   │ Available │[👁][✏️]│ │
│  │    │House      │       │       │ 🟢        │        │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │H02 │Forest     │ House │ 3/3   │ Occupied  │[👁][✏️]│ │
│  │    │Villa      │       │       │ ⚫        │        │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Add/Edit Accommodation Form
```
┌─────────────────────────────────────────────────────────────┐
│                  ADD NEW ACCOMMODATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BASIC INFORMATION                                         │
│                                                             │
│  ┌─────────────────┐  Accommodation Name: [_____________] │
│  │                 │  Accommodation ID:   [R05________]   │
│  │   [Upload]      │  Type: ⚪ Raft ⚪ House              │
│  │   Photos        │  Description: [____________________] │
│  │                 │              [____________________] │
│  │ [Browse Files]  │              [____________________] │
│  └─────────────────┘                                       │
│                                                             │
│  LOCATION & AMENITIES                                     │
│                                                             │
│  Location: [________________________]                     │
│  Max Occupancy: [___] persons                             │
│                                                             │
│  Amenities:                                               │
│  [✓] Air Conditioning  [✓] WiFi         [ ] Kitchen      │
│  [✓] Private Bathroom  [ ] Balcony      [✓] River View   │
│  [ ] TV               [✓] Mini Fridge   [ ] Workspace    │
│                                                             │
│  PRICING                                                  │
│                                                             │
│  Base Rate (per night): [_______] THB                    │
│  Weekend Rate:          [_______] THB                    │
│  Holiday Rate:          [_______] THB                    │
│                                                             │
│  ROOM CONFIGURATION                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Room # │ Room Type      │ Beds    │ Max Occ │ Rate    │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ 101    │ Master Bedroom │ 1 King  │    2    │ 1500 THB│ │
│  │ 102    │ Single Room    │ 1 Single│    1    │ 800 THB │ │
│  │        │                │         │         │ [Add]   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  [+ Add Room]                                             │
│                                                             │
│  [    Cancel    ]              [    Save Accommodation ] │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Accommodation Detail View
```
┌─────────────────────────────────────────────────────────────┐
│ Header with Navigation                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ← Back to List    SUNSET RAFT (R01)         [Edit] [Book] │
│                                                             │
│  ┌─────────────────┐  Status: ⚫ OCCUPIED                   │
│  │                 │  Type: Floating Raft                 │
│  │   [Photos]      │  Capacity: 4 guests                  │
│  │   Gallery       │  Location: River Section A           │
│  │                 │                                       │
│  │ [< Previous >]  │  Amenities:                          │
│  └─────────────────┘  • River view • WiFi • A/C • Bath    │
│                                                             │
│  CURRENT BOOKING                                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Guest: John & Mary Smith                               │ │
│  │ Check-in: May 25, 2025 | Check-out: May 28, 2025     │ │
│  │ Guests: 2 Adults, 1 Child                             │ │
│  │ Total: 4,500 THB (3 nights)                           │ │
│  │ [View Booking Details]                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ROOM BREAKDOWN                                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Room 101 - Master Bedroom │ Status: Occupied  │ 2 Guests│ │
│  │ Room 102 - Single Room    │ Status: Occupied  │ 1 Guest │ │
│  │ Room 103 - Common Area    │ Status: Available │ -       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  UPCOMING BOOKINGS                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ May 29-31  │ David Johnson    │ 2 Guests │ 3,000 THB   │ │
│  │ Jun 05-07  │ Lisa Chen        │ 4 Guests │ 4,500 THB   │ │
│  │ Jun 15-18  │ Michael Brown    │ 3 Guests │ 5,400 THB   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Booking Management
```
┌─────────────────────────────────────────────────────────────┐
│                      NEW BOOKING                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  GUEST INFORMATION                                         │
│                                                             │
│  ⚪ New Guest  ⚪ Existing Guest                            │
│                                                             │
│  First Name: [________________] Last Name: [______________] │
│  Email:      [________________] Phone:     [______________] │
│  ID/Passport:[________________] Nationality: [____________] │
│                                                             │
│  BOOKING DETAILS                                           │
│                                                             │
│  Accommodation: [Sunset Raft (R01) ▼]                     │
│  Check-in:      [📅 MM/DD/YYYY] Time: [3:00 PM ▼]         │
│  Check-out:     [📅 MM/DD/YYYY] Time: [11:00 AM ▼]        │
│  Nights:        [3] nights                                │
│                                                             │
│  GUESTS                                                    │
│                                                             │
│  Adults: [2 ▼] Children: [1 ▼] Infants: [0 ▼]            │
│                                                             │
│  Special Requests: [_____________________________]        │
│                   [_____________________________]        │
│                                                             │
│  ROOM SELECTION                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ [✓] Room 101 - Master Bedroom    │ 1,500 THB/night    │ │
│  │ [✓] Room 102 - Single Room       │   800 THB/night    │ │
│  │ [ ] Room 103 - Common Area       │   500 THB/night    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  PAYMENT SUMMARY                                          │
│                                                             │
│  Room Charges:     6,900 THB (3 nights)                  │
│  Taxes (7%):         483 THB                             │
│  Service Fee:        200 THB                             │
│  ──────────────────────────                             │
│  Total:           7,583 THB                              │
│                                                             │
│  Deposit Required: [2,000] THB                           │
│  Payment Method: [Cash ▼] [Credit Card ▼] [Transfer ▼]   │
│                                                             │
│  [    Cancel    ]              [    Confirm Booking    ] │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ACTIVITY MANAGEMENT WIREFRAMES

### 2.1 Activity Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Header with Navigation                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ACTIVITY MANAGEMENT                                       │
│                                                             │
│  [+ Add Activity]  [Create Package]  [Schedule] [Reports] │
│                                                             │
│  Quick Stats:                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   FREE   │ │   PAID   │ │ PACKAGES │ │  ACTIVE  │     │
│  │    12    │ │    8     │ │    5     │ │    18    │     │
│  │Activities│ │Activities│ │ Created  │ │  Today   │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  Categories: [All ▼] Type: [All ▼] Status: [Active ▼]     │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Activity Name    │ Type │ Price │ Duration │ Status    │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ 🚣 Kayaking      │ Free │  -    │ 2 hours  │ Active 🟢 │ │
│  │ 🎣 Fishing       │ Paid │500THB │ 3 hours  │ Active 🟢 │ │
│  │ 🥾 Jungle Trek   │ Paid │800THB │ 4 hours  │ Active 🟢 │ │
│  │ 🛟 Swimming      │ Free │  -    │ 1 hour   │ Active 🟢 │ │
│  │ 🍳 Cooking Class │ Paid │1200   │ 2 hours  │ Inactive⚫│ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  TODAY'S SCHEDULE                                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 9:00 AM - Jungle Trek        │ 4/8 participants        │ │
│  │ 2:00 PM - Kayaking           │ 6/10 participants       │ │
│  │ 4:00 PM - Fishing            │ 2/6 participants        │ │
│  │ 7:00 PM - Cooking Class      │ 8/12 participants       │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Create/Edit Activity Form
```
┌─────────────────────────────────────────────────────────────┐
│                     CREATE NEW ACTIVITY                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BASIC INFORMATION                                         │
│                                                             │
│  ┌─────────────────┐  Activity Name: [________________]    │
│  │                 │  Category: [Water Sports ▼]           │
│  │   [Upload]      │  Type: ⚪ Free ⚪ Paid                │
│  │   Photos        │                                       │
│  │                 │  Description: [____________________] │
│  │ [Browse Files]  │              [____________________] │
│  └─────────────────┘              [____________________] │
│                                                             │
│  ACTIVITY DETAILS                                         │
│                                                             │
│  Duration: [___] hours [___] minutes                      │
│  Max Participants: [___] persons                          │
│  Min Age: [___] years                                     │
│  Difficulty Level: ⚪ Easy ⚪ Medium ⚪ Hard               │
│                                                             │
│  PRICING (if paid activity)                               │
│                                                             │
│  Adult Price: [_______] THB                               │
│  Child Price: [_______] THB (under 12)                    │
│  Group Discount: [___]% (5+ people)                      │
│                                                             │
│  REQUIREMENTS & EQUIPMENT                                 │
│                                                             │
│  Required Equipment:                                      │
│  [✓] Provided by resort  [ ] Guest must bring            │
│                                                             │
│  Equipment List: [____________________________]          │
│                 [____________________________]          │
│                                                             │
│  Requirements: [_____________________________]           │
│               [_____________________________]           │
│                                                             │
│  SCHEDULING                                               │
│                                                             │
│  Available Days:                                          │
│  [✓] Monday [✓] Tuesday [✓] Wednesday [✓] Thursday       │
│  [✓] Friday [✓] Saturday [✓] Sunday                      │
│                                                             │
│  Time Slots:                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Start Time  │ End Time    │ Max Participants           │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ 09:00 AM    │ 11:00 AM    │ 8 people      [Remove]    │ │
│  │ 02:00 PM    │ 04:00 PM    │ 8 people      [Remove]    │ │
│  │             │             │               [+ Add Slot] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  [    Cancel    ]              [    Save Activity    ]   │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Activity Package Management
```
┌─────────────────────────────────────────────────────────────┐
│                    CREATE ACTIVITY PACKAGE                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PACKAGE INFORMATION                                       │
│                                                             │
│  Package Name: [Adventure Weekend Package_____________]    │
│  Description: [3-day adventure experience including...]   │
│              [kayaking, jungle trek, and fishing]       │
│                                                             │
│  Package Duration: [3] days                               │
│  Valid From: [📅 MM/DD/YYYY] To: [📅 MM/DD/YYYY]          │
│                                                             │
│  INCLUDED ACTIVITIES                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Activity         │ Regular Price │ Day │ Time │ Action │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ 🚣 Kayaking      │ Free         │ 1   │ 9AM  │[Remove]│ │
│  │ 🥾 Jungle Trek   │ 800 THB      │ 2   │ 9AM  │[Remove]│ │
│  │ 🎣 Fishing       │ 500 THB      │ 3   │ 2PM  │[Remove]│ │
│  │                  │              │     │      │[+ Add] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  [+ Add Activity to Package]                              │
│                                                             │
│  PRICING                                                  │
│                                                             │
│  Total Regular Price: 1,300 THB                          │
│  Package Price:      [1,000] THB                         │
│  Savings:              300 THB (23% discount)            │
│                                                             │
│  BOOKING SETTINGS                                         │
│                                                             │
│  Max Bookings: [___] per day                             │
│  Advance Booking: [3] days required                      │
│  Cancellation: [24] hours before start                   │
│                                                             │
│  [✓] Allow partial booking if activities unavailable      │
│  [ ] Require consecutive days                             │
│                                                             │
│  [    Cancel    ]              [    Create Package    ]  │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Activity Booking Interface (Guest View)
```
┌─────────────────────────────────────────────────────────────┐
│ Header with Navigation                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BOOK ACTIVITIES                                           │
│                                                             │
│  Select Date: [📅 May 28, 2025 ▼]                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                     🚣 KAYAKING                         │ │
│  │                                                         │ │
│  │ Duration: 2 hours | Difficulty: Easy | FREE           │ │
│  │ Explore the river channels and enjoy nature            │ │
│  │                                                         │ │
│  │ Available Times:                                        │ │
│  │ ⚪ 9:00 AM - 11:00 AM (6/10 spots left)               │ │
│  │ ⚪ 2:00 PM - 4:00 PM  (8/10 spots left)               │ │
│  │                                                         │ │
│  │ Participants: Adults [2 ▼] Children [1 ▼]             │ │
│  │                                              [Book Now] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    🥾 JUNGLE TREK                       │ │
│  │                                                         │ │
│  │ Duration: 4 hours | Difficulty: Medium | 800 THB      │ │
│  │ Guided trek through tropical rainforest                │ │
│  │                                                         │ │
│  │ Available Times:                                        │ │
│  │ ⚪ 8:00 AM - 12:00 PM (4/8 spots left)                │ │
│  │ ⚫ 1:00 PM - 5:00 PM  (Fully booked)                  │ │
│  │                                                         │ │
│  │ Participants: Adults [2 ▼] Children [0 ▼]             │ │
│  │ Total: 1,600 THB                        [Book Now]     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                🎯 ADVENTURE PACKAGE                     │ │
│  │                                                         │ │
│  │ 3-day package | Save 300 THB | 1,000 THB              │ │
│  │ Includes: Kayaking + Jungle Trek + Fishing             │ │
│  │                                                         │ │
│  │ Package starts: [📅 May 28, 2025 ▼]                   │ │
│  │ Participants: [2] people                               │ │
│  │ Total: 2,000 THB                        [Book Package] │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. CALENDAR & SCHEDULING VIEWS

### 3.1 Master Calendar View
```
┌─────────────────────────────────────────────────────────────┐
│ Header with Navigation                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RESORT CALENDAR                                           │
│                                                             │
│  [< May 2025 >]    View: [Month ▼] [Week] [Day]           │
│                                                             │
│  ┌─ Sun ─┬─ Mon ─┬─ Tue ─┬─ Wed ─┬─ Thu ─┬─ Fri ─┬─ Sat ─┐ │
│  │   1   │   2   │   3   │   4   │   5   │   6   │   7   │ │
│  │       │       │       │       │       │       │       │ │
│  ├───────┼───────┼───────┼───────┼───────┼───────┼───────┤ │
│  │   8   │   9   │  10   │  11   │  12   │  13   │  14   │ │
│  │       │       │       │       │       │       │       │ │
│  ├───────┼───────┼───────┼───────┼───────┼───────┼───────┤ │
│  │  15   │  16   │  17   │  18   │  19   │  20   │  21   │ │
│  │       │       │       │       │       │       │       │ │
│  ├───────┼───────┼───────┼───────┼───────┼───────┼───────┤ │
│  │  22   │  23   │  24   │  25   │  26   │  27   │ [28]  │ │
│  │       │       │       │       │       │       │ 🏨🎯  │ │
│  ├───────┼───────┼───────┼───────┼───────┼───────┼───────┤ │
│  │  29   │  30   │  31   │       │       │       │       │ │
│  │ 🏨    │ 🎯🎣  │       │       │       │       │       │ │
│  └───────┴───────┴───────┴───────┴───────┴───────┴───────┘ │
│                                                             │
│  Legend: 🏨 Accommodations 🎯 Activities 🎣 Special Events  │
│                                                             │
│  Today's Summary (May 28):                                │
│  • 28/42 accommodations occupied                          │
│  • 6 activities scheduled                                 │
│  • 45 total guests participating                          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Daily Schedule View
```
┌─────────────────────────────────────────────────────────────┐
│  DAILY SCHEDULE - MAY 28, 2025                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [< Previous Day]           [Today]           [Next Day >] │
│                                                             │
│  ┌─────────┬─────────────────────────────────────────────┐  │
│  │ 6:00 AM │                                             │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │ 7:00 AM │ 🍳 Breakfast Service (Restaurant)           │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │ 8:00 AM │ 🥾 Jungle Trek (8/8 booked)                │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │ 9:00 AM │ 🚣 Kayaking Session 1 (6/10 booked)        │  │
│  │         │ 📋 Check-in: Smith Family (R01)            │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │10:00 AM │                                             │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │11:00 AM │ 📋 Check-out: Johnson Family (H02)         │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │12:00 PM │ 🍽️ Lunch Service                            │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │ 1:00 PM │                                             │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │ 2:00 PM │ 🚣 Kayaking Session 2 (8/10 booked)        │  │
│  │         │ 🎣 Fishing Trip (2/6 booked)               │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │ 3:00 PM │ 📋 Check-in: Chen Family (R02)             │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │ 4:00 PM │                                             │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │ 5:00 PM │                                             │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │ 6:00 PM │ 🍽️ Dinner Service                           │  │
│  ├─────────┼─────────────────────────────────────────────┤  │
│  │ 7:00 PM │ 🍳 Cooking Class (8/12 booked)              │  │
│  └─────────┴─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. GUEST INTERFACE WIREFRAMES

### 4.1 Guest Accommodation Booking
```
┌─────────────────────────────────────────────────────────────┐
│ BANRIMKWAE RESORT - GUEST PORTAL                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BOOK YOUR STAY                                            │
│                                                             │
│  Check-in: [📅 May 28, 2025] Check-out: [📅 May 31, 2025] │
│  Guests: Adults [2 ▼] Children [1 ▼] Infants [0 ▼]        │
│                                          [Search Available] │
│                                                             │
│  AVAILABLE ACCOMMODATIONS                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🏡 GARDEN HOUSE (H01)                    1,800 THB/night│ │
│  │                                                         │ │
│  │ [Image] 4 Rooms • Max 8 guests • Garden view          │ │
│  │         WiFi • A/C • Kitchen • Private bathroom        │ │
│  │                                                         │ │
│  │ Available rooms: 4/4 | 3 nights = 5,400 THB          │ │
│  │                                          [Select >]    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🛟 RIVER VIEW RAFT (R02)                2,200 THB/night│ │
│  │                                                         │ │
│  │ [Image] 3 Rooms • Max 6 guests • River view           │ │
│  │         WiFi • A/C • Mini fridge • Unique experience   │ │
│  │                                                         │ │
│  │ Available rooms: 2/3 | 3 nights = 6,600 THB          │ │
│  │                                          [Select >]    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🌅 SUNSET RAFT (R01)                    2,500 THB/night│ │
│  │                                                         │ │
│  │ [Image] 2 Rooms • Max 4 guests • Premium river view   │ │
│  │         WiFi • A/C • Balcony • Sunset viewing          │ │
│  │                                                         │ │
│  │ ⚫ FULLY BOOKED                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Guest Activity Booking
```
┌─────────────────────────────────────────────────────────────┐
│ BANRIMKWAE ACTIVITIES - GUEST PORTAL                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DISCOVER ACTIVITIES                                       │
│                                                             │
│  Filter: [All Categories ▼] [All Types ▼] Date: [Today ▼] │
│                                                             │
│  🎯 FEATURED PACKAGES                                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🏞️ ADVENTURE WEEKEND                                   │ │
│  │ 3 days of activities • Save 300 THB • 1,000 THB       │ │
│  │ Includes: Kayaking + Jungle Trek + Fishing             │ │
│  │                                          [Book Package] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  🚣 WATER ACTIVITIES                                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ KAYAKING                                   FREE         │ │
│  │ 2 hours • Easy difficulty                              │ │
│  │ Available: 9AM-11AM (6 spots), 2PM-4PM (8 spots)     │ │
│  │                                              [Book Now] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ FISHING TRIP                             500 THB        │ │
│  │ 3 hours • All skill levels                             │ │
│  │ Available: 2PM-5PM (4 spots left)                     │ │
│  │                                              [Book Now] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  🥾 LAND ACTIVITIES                                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ JUNGLE TREK                              800 THB        │ │
│  │ 4 hours • Medium difficulty                            │ │
│  │ Available: 8AM-12PM (4 spots left)                    │ │
│  │                                              [Book Now] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  MY BOOKINGS                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Tomorrow 9:00 AM - Kayaking (FREE)                     │ │
│  │ Tomorrow 2:00 PM - Fishing Trip (500 THB)              │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. MOBILE RESPONSIVE DESIGNS

### 5.1 Mobile Accommodation Dashboard
```
┌─────────────────────────┐
│ ☰ ACCOMMODATIONS   👤  │
├─────────────────────────┤
│                         │
│ [+ Add] [📅] [👁️] [⚙️] │
│                         │
│ Stats:                  │
│ ┌────┬────┬────┬────┐  │
│ │ 42 │ 28 │ 12 │ 2  │  │
│ │Tot │Occ │Ava │Mai │  │
│ └────┴────┴────┴────┘  │
│                         │
│ ┌─────────────────────┐ │
│ │ R01 - Sunset Raft   │ │
│ │ Type: Raft          │ │
│ │ Status: 🔴 Occupied │ │
│ │ Rooms: 2/2          │ │
│ │ [👁️] [✏️] [📊]      │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ H01 - Garden House  │ │
│ │ Type: House         │ │
│ │ Status: 🟢 Available│ │
│ │ Rooms: 0/4          │ │
│ │ [👁️] [✏️] [📊]      │ │
│ └─────────────────────┘ │
│                         │
│ [Load More...]          │
└─────────────────────────┘
```

### 5.2 Mobile Activity Management
```
┌─────────────────────────┐
│ ☰ ACTIVITIES      👤   │
├─────────────────────────┤
│                         │
│ [+ Add] [📦] [📅] [📊] │
│                         │
│ Today's Schedule:       │
│ ┌─────────────────────┐ │
│ │ 9:00 AM             │ │
│ │ 🥾 Jungle Trek      │ │
│ │ 4/8 participants    │ │
│ │ [Manage]            │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ 2:00 PM             │ │
│ │ 🚣 Kayaking         │ │
│ │ 6/10 participants   │ │
│ │ [Manage]            │ │
│ └─────────────────────┘ │
│                         │
│ All Activities:         │
│ [Free ▼] [Active ▼]    │
│                         │
│ ┌─────────────────────┐ │
│ │ 🚣 Kayaking         │ │
│ │ Free • 2h • Active  │ │
│ │ [Edit] [Schedule]   │ │
│ └─────────────────────┘ │
│                         │
│ [Show More...]          │
└─────────────────────────┘
```

---

## 6. DATA INTEGRATION POINTS

### 6.1 Required APIs for Phase II
**Accommodation Management:**
- GET /api/accommodations - List all accommodations
- POST /api/accommodations - Create new accommodation
- PUT /api/accommodations/{id} - Update accommodation
- DELETE /api/accommodations/{id} - Delete accommodation
- GET /api/accommodations/{id}/availability - Check availability
- POST /api/bookings - Create new booking
- GET /api/bookings - List bookings
- PUT /api/bookings/{id} - Update booking
- DELETE /api/bookings/{id} - Cancel booking

**Activity Management:**
- GET /api/activities - List all activities
- POST /api/activities - Create new activity
- PUT /api/activities/{id} - Update activity
- DELETE /api/activities/{id} - Delete activity
- GET /api/activities/schedule - Get activity schedule
- POST /api/activity-bookings - Book activity
- GET /api/packages - List activity packages
- POST /api/packages - Create activity package

### 6.2 Database Integration Points
**New Tables Required:**
- accommodations
- accommodation_types
- rooms
- room_types
- bookings
- booking_rooms
- guests
- activities
- activity_categories
- activity_schedules
- activity_bookings
- activity_packages
- package_activities

### 6.3 Billing Integration Hooks
**For Phase III Restaurant Integration:**
- booking_id linked to bills table
- guest_id linked to charges
- activity charges automatically added to guest bills
- accommodation charges calculated and added to bills

---

**End of Phase II Wireframe Document**
