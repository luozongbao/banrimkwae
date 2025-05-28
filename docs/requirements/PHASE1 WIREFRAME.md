# PHASE I WIREFRAME
## User Management and Framework (4-6 weeks)

### Document Information
- **Phase**: Phase I - User Management and Framework
- **Duration**: 4-6 weeks
- **Document Version**: 1.0
- **Last Updated**: May 28, 2025
- **Document Type**: User Interface Wireframes and Style Guide

---

## 1. DESIGN SYSTEM & STYLE GUIDE

### 1.1 Color Palette
**Primary Colors:**
- **Resort Blue**: #2E86AB (Main brand color - represents water/rafts)
- **Forest Green**: #A23B72 (Secondary - represents nature/activities)
- **Warm Orange**: #F18F01 (Accent - represents hospitality/warmth)
- **Sunset Red**: #C73E1D (Action/Alert color)

**Neutral Colors:**
- **Dark Charcoal**: #2D3748 (Primary text)
- **Medium Gray**: #4A5568 (Secondary text)
- **Light Gray**: #E2E8F0 (Borders/dividers)
- **Off White**: #F7FAFC (Background)
- **Pure White**: #FFFFFF (Cards/panels)

**Status Colors:**
- **Success Green**: #48BB78
- **Warning Yellow**: #ED8936
- **Error Red**: #F56565
- **Info Blue**: #4299E1

### 1.2 Typography
**Primary Font**: Inter (Web-safe fallback: Arial, sans-serif)
- **H1**: 32px, Font-weight: 700, Line-height: 1.2
- **H2**: 28px, Font-weight: 600, Line-height: 1.3
- **H3**: 24px, Font-weight: 600, Line-height: 1.4
- **H4**: 20px, Font-weight: 500, Line-height: 1.4
- **Body**: 16px, Font-weight: 400, Line-height: 1.6
- **Small**: 14px, Font-weight: 400, Line-height: 1.5
- **Caption**: 12px, Font-weight: 400, Line-height: 1.4

**Thai Font Support**: Sarabun (Web-safe fallback: Arial Unicode MS)

### 1.3 Spacing System
**Base Unit**: 8px
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

### 1.4 Component Standards
**Buttons:**
- **Primary**: Resort Blue background, white text, 8px border-radius
- **Secondary**: White background, Resort Blue border and text
- **Success**: Success Green background, white text
- **Danger**: Error Red background, white text
- **Height**: 40px (md), 32px (sm), 48px (lg)
- **Padding**: 16px horizontal, 8px vertical

**Form Elements:**
- **Input Height**: 40px
- **Border**: 1px solid Light Gray
- **Border Radius**: 6px
- **Focus**: 2px Resort Blue outline
- **Padding**: 12px horizontal

**Cards:**
- **Background**: Pure White
- **Border**: 1px solid Light Gray
- **Border Radius**: 8px
- **Shadow**: 0 1px 3px rgba(0,0,0,0.1)
- **Padding**: 24px

### 1.5 Icons
**Icon Library**: Heroicons (outline and solid variants)
**Size Standards**: 16px, 20px, 24px, 32px
**Color**: Inherit from parent or Medium Gray default

---

## 2. LAYOUT FRAMEWORK

### 2.1 Grid System
**Container Max-Width**: 1200px
**Breakpoints:**
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px and above

**Grid Columns**: 12-column system
**Gutters**: 16px (mobile), 24px (tablet), 32px (desktop)

### 2.2 Header Layout
```
[Logo] [Navigation Menu]                    [User Profile] [Notifications] [Settings]
                                                                              [Logout]
```

**Height**: 64px
**Background**: Pure White
**Border Bottom**: 1px solid Light Gray
**Shadow**: 0 1px 2px rgba(0,0,0,0.05)

### 2.3 Sidebar Navigation (Desktop)
**Width**: 256px (expanded), 64px (collapsed)
**Background**: Off White
**Border Right**: 1px solid Light Gray

### 2.4 Main Content Area
**Padding**: 24px (mobile), 32px (tablet/desktop)
**Background**: Off White
**Min-Height**: calc(100vh - 64px)

---

## 3. USER AUTHENTICATION WIREFRAMES

### 3.1 Login Page
```
┌─────────────────────────────────────────────────────────────┐
│                    BANRIMKWAE RESORT                        │
│                   Management System                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │               LOGIN TO SYSTEM                   │     │
│    │                                                 │     │
│    │  Email/Username: [________________]             │     │
│    │                                                 │     │
│    │  Password:       [________________] [👁]        │     │
│    │                                                 │     │
│    │  [ ] Remember me                                │     │
│    │                                                 │     │
│    │  [        LOGIN BUTTON        ]                 │     │
│    │                                                 │     │
│    │  Language: [Thai ▼] [English ▼]                │     │
│    │                                                 │     │
│    │  Forgot Password? | Need Help?                  │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Mobile Version:**
```
┌─────────────────────────┐
│    BANRIMKWAE RESORT    │
│   Management System     │
├─────────────────────────┤
│                         │
│  ┌─────────────────┐   │
│  │     LOGIN       │   │
│  │                 │   │
│  │ Username:       │   │
│  │ [_____________] │   │
│  │                 │   │
│  │ Password:       │   │
│  │ [_____________] │   │
│  │                 │   │
│  │ [ ] Remember    │   │
│  │                 │   │
│  │ [    LOGIN    ] │   │
│  │                 │   │
│  │ Lang: [TH▼][EN▼]│   │
│  └─────────────────┘   │
│                         │
└─────────────────────────┘
```

### 3.2 User Profile Page
```
┌─────────────────────────────────────────────────────────────┐
│ Header with Navigation                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USER PROFILE                                              │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │                 │  │  Personal Information           │  │
│  │   [Avatar]      │  │                                 │  │
│  │     Photo       │  │  First Name: [____________]     │  │
│  │                 │  │  Last Name:  [____________]     │  │
│  │ [Change Photo]  │  │  Email:      [____________]     │  │
│  │                 │  │  Phone:      [____________]     │  │
│  └─────────────────┘  │  Department: [____________]     │  │
│                       │  Position:   [____________]     │  │
│  ┌─────────────────┐  │                                 │  │
│  │ Account Settings│  │  [    Save Changes    ]         │  │
│  │                 │  └─────────────────────────────────┘  │
│  │ Change Password │                                       │
│  │ Language Prefs  │  ┌─────────────────────────────────┐  │
│  │ Notifications   │  │  Security Settings              │  │
│  │ Privacy         │  │                                 │  │
│  └─────────────────┘  │  Current Password: [__________] │  │
│                       │  New Password:     [__________] │  │
│                       │  Confirm Password: [__________] │  │
│                       │                                 │  │
│                       │  [  Update Password  ]          │  │
│                       └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. ROLE MANAGEMENT WIREFRAMES

### 4.1 Role Management Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Header with Navigation                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ROLE MANAGEMENT                                           │
│                                                             │
│  [+ Create New Role]              [Search Roles: ________] │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Role Name    │ Description      │ Users │ Actions      │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ Admin        │ Full system     │   3   │ [Edit] [Del] │ │
│  │              │ access          │       │              │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ Manager      │ Department      │   8   │ [Edit] [Del] │ │
│  │              │ management      │       │              │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ Staff        │ Basic operations│  25   │ [Edit] [Del] │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ Guest        │ Guest interface │ 150   │ [Edit] [Del] │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Create/Edit Role Modal
```
┌─────────────────────────────────────────────────────────────┐
│                    CREATE NEW ROLE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Role Name: [________________________]                     │
│                                                             │
│  Description: [_______________________]                    │
│               [_______________________]                    │
│                                                             │
│  PERMISSIONS:                                              │
│                                                             │
│  ┌─ USER MANAGEMENT                                        │
│  │  [✓] View Users        [✓] Create Users                │
│  │  [✓] Edit Users        [ ] Delete Users                │
│  └─                                                        │
│                                                             │
│  ┌─ ACCOMMODATION MANAGEMENT                               │
│  │  [✓] View Bookings     [ ] Create Bookings             │
│  │  [ ] Edit Bookings     [ ] Cancel Bookings             │
│  └─                                                        │
│                                                             │
│  ┌─ ACTIVITY MANAGEMENT                                    │
│  │  [✓] View Activities   [ ] Manage Activities           │
│  │  [ ] Book Activities   [ ] Cancel Activities           │
│  └─                                                        │
│                                                             │
│  ┌─ RESTAURANT MANAGEMENT                                  │
│  │  [ ] View Orders       [ ] Create Orders               │
│  │  [ ] Edit Menu         [ ] Manage Kitchen              │
│  └─                                                        │
│                                                             │
│  ┌─ INVENTORY MANAGEMENT                                   │
│  │  [ ] View Stock        [ ] Update Stock                │
│  │  [ ] Manage Suppliers  [ ] Generate Reports            │
│  └─                                                        │
│                                                             │
│  ┌─ REPORTING                                              │
│  │  [ ] View Reports      [ ] Generate Reports            │
│  │  [ ] Export Data       [ ] System Analytics            │
│  └─                                                        │
│                                                             │
│  [    Cancel    ]              [    Save Role    ]        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. USER MANAGEMENT WIREFRAMES

### 5.1 User Management Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Header with Navigation                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  USER MANAGEMENT                                           │
│                                                             │
│  [+ Add New User]    [Import Users]    [Export Users]     │
│                                                             │
│  Search: [_______________] Role: [All ▼] Status: [All ▼]  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Avatar│ Name         │ Email        │ Role    │ Status │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ [👤] │ John Smith   │ john@br.com  │ Admin   │ Active │ │
│  │      │              │              │         │ [•][✓] │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ [👤] │ Jane Doe     │ jane@br.com  │ Manager │ Active │ │
│  │      │              │              │         │ [•][✓] │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ [👤] │ Bob Wilson   │ bob@br.com   │ Staff   │ Inactive│ │
│  │      │              │              │         │ [•][✗] │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  Showing 1-10 of 156 users        [< Previous] [Next >]   │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Add/Edit User Form
```
┌─────────────────────────────────────────────────────────────┐
│                      ADD NEW USER                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  PERSONAL INFORMATION                 │
│  │                 │                                       │
│  │   [Upload]      │  First Name: [________________]       │
│  │   Photo         │  Last Name:  [________________]       │
│  │                 │  Email:      [________________]       │
│  │ [Browse File]   │  Phone:      [________________]       │
│  └─────────────────┘                                       │
│                                                             │
│  ACCOUNT INFORMATION                                       │
│                                                             │
│  Username:   [________________]                            │
│  Password:   [________________]  [Generate Random]         │
│  Confirm:    [________________]                            │
│                                                             │
│  ROLE & PERMISSIONS                                        │
│                                                             │
│  Primary Role: [Manager ▼]                                │
│  Department:   [Front Office ▼]                           │
│  Position:     [________________]                          │
│  Start Date:   [MM/DD/YYYY]                               │
│                                                             │
│  ADDITIONAL SETTINGS                                       │
│                                                             │
│  [✓] Send welcome email                                    │
│  [✓] Require password change on first login               │
│  [ ] Account expires on: [MM/DD/YYYY]                     │
│                                                             │
│  NOTIFICATIONS                                             │
│                                                             │
│  [✓] Email notifications                                   │
│  [✓] SMS notifications                                     │
│  [ ] Push notifications                                    │
│                                                             │
│  [    Cancel    ]              [    Create User    ]      │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. ADMIN SETTINGS WIREFRAMES

### 6.1 System Settings Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Header with Navigation                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SYSTEM SETTINGS                                           │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │                 │  │  GENERAL SETTINGS               │  │
│  │ Quick Settings  │  │                                 │  │
│  │                 │  │  Resort Name: [Banrimkwae     ] │  │
│  │ • General       │  │  Address:     [_______________] │  │
│  │ • Security      │  │              [_______________] │  │
│  │ • Backup        │  │  Phone:       [_______________] │  │
│  │ • Notifications │  │  Email:       [_______________] │  │
│  │ • Integrations  │  │  Website:     [_______________] │  │
│  │ • Maintenance   │  │                                 │  │
│  │                 │  │  Time Zone:   [Asia/Bangkok ▼] │  │
│  └─────────────────┘  │  Language:    [Thai ▼]         │  │
│                       │  Currency:    [THB ▼]          │  │
│                       │                                 │  │
│                       │  [    Save Settings    ]       │  │
│                       └─────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  SECURITY SETTINGS                                     │ │
│  │                                                         │ │
│  │  Password Policy:                                      │ │
│  │  [✓] Minimum 8 characters                             │ │
│  │  [✓] Require uppercase letters                        │ │
│  │  [✓] Require numbers                                  │ │
│  │  [✓] Require special characters                       │ │
│  │                                                         │ │
│  │  Session Timeout: [30 minutes ▼]                      │ │
│  │  Max Login Attempts: [5 attempts ▼]                   │ │
│  │                                                         │ │
│  │  [✓] Enable two-factor authentication                 │ │
│  │  [✓] Log user activities                              │ │
│  │                                                         │ │
│  │  [    Update Security    ]                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. RESPONSIVE DESIGN PATTERNS

### 7.1 Mobile Navigation
```
┌─────────────────────────┐
│ ☰ BANRIMKWAE    👤 🔔  │
├─────────────────────────┤
│                         │
│ ┌─────────────────────┐ │
│ │ Main Content Area   │ │
│ │                     │ │
│ │                     │ │
│ │                     │ │
│ │                     │ │
│ │                     │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
└─────────────────────────┘
```

**Hamburger Menu Expanded:**
```
┌─────────────────────────┐
│ ✕ BANRIMKWAE    👤 🔔  │
├─────────────────────────┤
│ 🏠 Dashboard            │
│ 👥 Users                │
│ 🏨 Accommodation        │
│ 🎯 Activities           │
│ 🍽️ Restaurant           │
│ 📦 Inventory            │
│ 📊 Reports              │
│ ⚙️ Settings             │
│ 🚪 Logout               │
├─────────────────────────┤
│                         │
│                         │
└─────────────────────────┘
```

### 7.2 Tablet Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Navigation                            [Profile] [🔔] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │ Sidebar         │  │ Main Content                    │  │
│  │ Navigation      │  │                                 │  │
│  │                 │  │                                 │  │
│  │ • Dashboard     │  │  Content adapts to available   │  │
│  │ • Users         │  │  space, forms stack vertically │  │
│  │ • Roles         │  │  on smaller screens             │  │
│  │ • Settings      │  │                                 │  │
│  │                 │  │                                 │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. INTERACTION PATTERNS

### 8.1 Loading States
**Page Loading:**
```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [Loading Spinner]                       │
│                                                             │
│                   Loading content...                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Button Loading:**
```
[  ⟳  Saving...  ] (disabled state)
```

### 8.2 Error States
**Form Validation:**
```
Email: [invalid.email] ← Email format is invalid
Password: [****] ← Password must be at least 8 characters
```

**Page Error:**
```
┌─────────────────────────────────────────────────────────────┐
│                         ⚠️                                  │
│                                                             │
│                 Something went wrong                        │
│             Please try again or contact support            │
│                                                             │
│                    [Try Again]                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Success Feedback
**Toast Notifications:**
```
┌─────────────────────────────────┐
│ ✅ User created successfully!   │
└─────────────────────────────────┘
```

---

## 9. ACCESSIBILITY CONSIDERATIONS

### 9.1 Keyboard Navigation
- Tab order follows logical flow
- All interactive elements focusable
- Skip links for main content
- Escape key closes modals/dropdowns

### 9.2 Screen Reader Support
- Semantic HTML structure
- ARIA labels for complex components
- Alternative text for images
- Status announcements for dynamic content

### 9.3 Visual Accessibility
- Color contrast ratio minimum 4.5:1
- Focus indicators visible and clear
- Text resizable up to 200%
- No information conveyed by color alone

---

## 10. TECHNICAL IMPLEMENTATION NOTES

### 10.1 CSS Framework
**Recommended**: Tailwind CSS or custom CSS following the design system

### 10.2 JavaScript Components
**Required Interactions:**
- Form validation
- Modal dialogs
- Dropdown menus
- Tab navigation
- Data tables with sorting
- Password strength indicators

### 10.3 API Integration Points
**Authentication:**
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/user

**User Management:**
- GET /api/users
- POST /api/users
- PUT /api/users/{id}
- DELETE /api/users/{id}

**Role Management:**
- GET /api/roles
- POST /api/roles
- PUT /api/roles/{id}
- DELETE /api/roles/{id}

---

**End of Phase I Wireframe Document**
