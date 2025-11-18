# 📂 Complete API Directory Structure

## Visual Directory Tree

```
src/app/api/
│
├── 👨‍💼 admin/                      [Admin-Only Routes - Aliases for Documentation]
│   ├── sheets/
│   │   ├── route.ts              ➜ Alias to /api/sheets
│   │   └── [id]/
│   │       └── route.ts          ➜ Alias to /api/sheets/[id]
│   ├── users/
│   │   ├── route.ts              ➜ Alias to /api/users
│   │   └── [id]/
│   │       ├── route.ts          ➜ Alias to /api/users/[id]
│   │       └── change-password/
│   │           └── route.ts      ➜ Alias to /api/users/[id]/change-password
│   ├── sharesheets/
│   │   └── route.ts              ➜ Alias to /api/sharesheets
│   └── fields/
│       ├── route.ts              ➜ Alias to /api/cells
│       └── [id]/
│           └── route.ts          ➜ Alias to /api/cells/[id]
│
├── 👤 agent/                       [Agent-Only Routes]
│   └── shared-sheets/
│       └── route.ts              ✅ GET: List worksheets shared with agent
│
├── 🔐 auth/                        [Authentication Routes]
│   └── signin/
│       └── route.ts              ✅ POST: User login
│
├── 📝 check-username/              [Username Validation]
│   └── route.ts                  ✅ GET: Check if username is available
│
├── 👥 register-user/               [User Registration]
│   └── route.ts                  ✅ POST: Create new user account
│
├── 📊 sheets/                      [Worksheet Management - Admin Only]
│   ├── route.ts                  ✅ GET: List sheets, POST: Create sheet
│   └── [id]/
│       └── route.ts              ✅ GET: Sheet details, PATCH: Update, DELETE: Delete
│
├── 🔗 sharesheets/                 [Sheet Sharing - Admin Only]
│   └── route.ts                  ✅ GET: List shared users
│                                 ✅ POST: Share with user
│                                 ✅ DELETE: Unshare from user
│
├── 👤 users/                       [User Management - Admin Only]
│   ├── route.ts                  ✅ GET: List users
│   └── [id]/
│       ├── route.ts              ✅ PATCH: Update status, DELETE: Delete user
│       └── change-password/
│           └── route.ts          ✅ POST: Change user password
│
├── 📋 cells/                       [Field/Column Management]
│   ├── route.ts                  ✅ GET: List fields, POST: Create field
│   └── [id]/
│       └── route.ts              ✅ PATCH: Update field, DELETE: Delete field
│
├── 📄 sheet-data/                  [Sheet Data - Role-Aware]
│   └── [id]/
│       └── route.ts              ✅ GET: Fetch sheet data (filtered by role)
│
├── 💾 cell-data/                   [Cell Operations - Role-Aware]
│   └── route.ts                  ✅ POST: Create/update cell
│                                 ✅ DELETE: Delete row
│
└── ⚙️ view-preference/             [UI Preferences - Both Roles]
    └── route.ts                  ✅ GET: Get preference, POST: Save preference
```

## Route Categories

### 1. 👨‍💼 Admin Routes (Admin Only)

#### Worksheets
- **GET** `/api/admin/sheets` or `/api/sheets`
  - List all worksheets
  - Returns: id, sheet_name, sheet_number, created_at, shareCount

- **POST** `/api/admin/sheets` or `/api/sheets`
  - Create new worksheet
  - Body: `{ sheet_name: string, sheet_number: number }`

- **GET** `/api/admin/sheets/[id]` or `/api/sheets/[id]`
  - Get worksheet details
  - Returns: sheet info, fields, cells

- **PATCH** `/api/admin/sheets/[id]` or `/api/sheets/[id]`
  - Update worksheet
  - Body: `{ sheet_name?: string, sheet_number?: number }`

- **DELETE** `/api/admin/sheets/[id]` or `/api/sheets/[id]`
  - Delete worksheet and all associated data

#### Users
- **GET** `/api/admin/users` or `/api/users`
  - List all users under admin's management
  - Returns: id, username, isActive, isPasswordRequest

- **PATCH** `/api/admin/users/[id]` or `/api/users/[id]`
  - Update user status
  - Body: `{ isActive: boolean }`

- **DELETE** `/api/admin/users/[id]` or `/api/users/[id]`
  - Delete user account

- **POST** `/api/admin/users/[id]/change-password` or `/api/users/[id]/change-password`
  - Change user password
  - Body: `{ newPassword: string }`

#### Sharing
- **GET** `/api/admin/sharesheets?sheet_id=X` or `/api/sharesheets?sheet_id=X`
  - Get list of users sheet is shared with
  - Returns: Array of sharesheet records

- **POST** `/api/admin/sharesheets` or `/api/sharesheets`
  - Share worksheet with user
  - Body: `{ sheet_id: number, user_id: number }`

- **DELETE** `/api/admin/sharesheets?sheet_id=X&user_id=Y` or `/api/sharesheets?sheet_id=X&user_id=Y`
  - Remove user's access to worksheet

#### Fields/Columns
- **GET** `/api/admin/fields?sheet_id=X` or `/api/cells?sheet_id=X`
  - List fields for a worksheet
  - Returns: id, cell_title, cell_content (width), sheet_type

- **POST** `/api/admin/fields` or `/api/cells`
  - Create new field
  - Body: `{ sheet_id: number, cell_title: string, sheet_type: 1|2 }`

- **PATCH** `/api/admin/fields/[id]` or `/api/cells/[id]`
  - Update field (name or width)
  - Body: `{ cell_title?: string, cell_content?: string }`

- **DELETE** `/api/admin/fields/[id]` or `/api/cells/[id]`
  - Delete field

---

### 2. 👤 Agent Routes (Agent Only)

#### Shared Worksheets
- **GET** `/api/agent/shared-sheets`
  - List worksheets shared with logged-in agent
  - Automatically filters by user_id from JWT
  - Returns: id, sheet_name, sheet_number, created_at, manager_name

---

### 3. 🔐 Authentication Routes (Public/Both)

- **POST** `/api/auth/signin`
  - User login
  - Body: `{ username: string, password: string }`
  - Returns: JWT token, user info, role

- **POST** `/api/register-user`
  - Create new user account
  - Body: `{ username: string, password: string, manager_id: number }`

- **GET** `/api/check-username?username=X`
  - Check username availability
  - Returns: `{ available: boolean }`

---

### 4. 🔄 Shared Routes (Role-Aware)

#### Sheet Data
- **GET** `/api/sheet-data/[id]`
  - Fetch worksheet data with cells
  - **Admin**: Returns all users' data with username column
  - **Agent**: Returns only their own data
  - Filtered at SQL level

#### Cell Operations
- **POST** `/api/cell-data`
  - Create or update cell value
  - Body: `{ sheet_id: number, field_id: number, uuid: string, value: string }`
  - **Admin**: Sets user_id = NULL
  - **Agent**: Sets user_id = current user

- **DELETE** `/api/cell-data?uuid=X&sheet_id=Y`
  - Delete row
  - **Admin**: Can delete admin rows only (user_id IS NULL)
  - **Agent**: Can delete own rows only (user_id = current user)

#### UI Preferences
- **GET** `/api/view-preference`
  - Get user's view preference
  - Returns: `{ view_type: 0|1 }` (0 = card, 1 = table)

- **POST** `/api/view-preference`
  - Save view preference
  - Body: `{ view_type: 0|1 }`

---

## Security Matrix

| Route | Admin | Agent | Public | Notes |
|-------|-------|-------|--------|-------|
| `/api/admin/*` | ✅ | ❌ | ❌ | Alias routes for documentation |
| `/api/agent/*` | ❌ | ✅ | ❌ | Agent-specific functionality |
| `/api/auth/*` | ✅ | ✅ | ✅ | Authentication endpoints |
| `/api/sheets` | ✅ | ❌ | ❌ | Admin worksheet management |
| `/api/users` | ✅ | ❌ | ❌ | Admin user management |
| `/api/sharesheets` | ✅ | ❌ | ❌ | Admin sharing control |
| `/api/cells` | ✅ | ✅* | ❌ | *Agents can only PATCH width |
| `/api/sheet-data` | ✅ | ✅ | ❌ | Role-aware filtering |
| `/api/cell-data` | ✅ | ✅ | ❌ | Role-aware user_id tracking |
| `/api/view-preference` | ✅ | ✅ | ❌ | Personal UI settings |

---

## Implementation Notes

### Admin Alias Routes
The `/api/admin/*` routes are **alias routes** that re-export the actual implementations from their original locations. This provides:
- ✅ Better developer experience (clear separation)
- ✅ Self-documenting API structure
- ✅ No code duplication
- ✅ Easy to understand which routes are admin-only

Example:
```typescript
// /api/admin/sheets/route.ts
export { GET, POST } from '../../sheets/route';
```

### JWT Token Structure
```typescript
interface JWTPayload {
  userId: number;      // Database user ID
  username: string;    // User's username
  userRole: string;    // 'admin' or 'agent'
}
```

### Role Verification Pattern
Every protected route follows this pattern:
```typescript
const token = request.cookies.get('token')?.value;
if (!token) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
const isAdmin = decoded.userRole === 'admin';

// Admin-only routes:
if (!isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Data Isolation Pattern
Role-aware routes use SQL-level filtering:
```typescript
if (isAdmin) {
  cells = await prisma.$queryRaw`
    SELECT c.*, u.username 
    FROM cells c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.sheet_id = ${sheetId}
    ORDER BY COALESCE(c.user_id, 0) ASC
  `;
} else {
  cells = await prisma.$queryRaw`
    SELECT * FROM cells
    WHERE sheet_id = ${sheetId} AND user_id = ${userId}
  `;
}
```

---

## HTTP Status Codes Used

- **200 OK**: Successful GET/POST/PATCH/DELETE
- **400 Bad Request**: Missing required fields, validation errors
- **401 Unauthorized**: No token or invalid token
- **403 Forbidden**: Valid token but insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side errors

---

## Database Tables Reference

### Core Tables
- **users**: User accounts (id, username, password, manager_id, isActive)
- **sheets**: Worksheets (id, sheet_name, sheet_number, manager_id, created_at)
- **fields**: Columns (id, sheet_id, cell_title, cell_content, sheet_type)
- **cells**: Data (id, sheet_id, field_id, uuid, value, user_id, created_at)
- **sharesheets**: Sharing (id, sheet_id, user_id, manager_id, created_at)
- **sheet_view**: UI preferences (id, manager_id, view_type)

### Relationships
```
users (1) ----< (N) sheets [manager_id]
sheets (1) ----< (N) fields [sheet_id]
sheets (1) ----< (N) cells [sheet_id]
fields (1) ----< (N) cells [field_id]
sheets (1) ----< (N) sharesheets [sheet_id]
users (1) ----< (N) sharesheets [user_id]
users (1) ----< (N) cells [user_id]
```

---

## Quick Reference

### Admin Tasks
```bash
# Create worksheet
POST /api/sheets
{ "sheet_name": "Sales Tracker", "sheet_number": 1 }

# Add field
POST /api/cells
{ "sheet_id": 1, "cell_title": "Product Name", "sheet_type": 2 }

# Share with user
POST /api/sharesheets
{ "sheet_id": 1, "user_id": 5 }

# View all data
GET /api/sheet-data/1
```

### Agent Tasks
```bash
# List shared sheets
GET /api/agent/shared-sheets

# Open sheet (role-aware, shows only own data)
GET /api/sheet-data/1

# Add/update cell
POST /api/cell-data
{ "sheet_id": 1, "field_id": 2, "uuid": "1", "value": "Laptop" }

# Delete row
DELETE /api/cell-data?uuid=1&sheet_id=1
```

---

**Structure Complete!** 🎉 The API is now well-organized, documented, and easy to navigate.
