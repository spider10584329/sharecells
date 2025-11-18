# 📋 Sheet API Endpoints - Separated by Authority

## ✅ New Structure

### 🔐 Admin-Only Endpoints
**Location:** `/api/admin/sheets/[id]/route.ts`

These endpoints require **admin authentication** and are used for administrative operations:

#### `GET /api/admin/sheets/[id]`
- **Purpose:** Fetch sheet metadata (admin-only operations)
- **Access:** Admin must own the sheet
- **Used by:** SheetSettingsPanel.tsx (admin components)
- **Returns:** Sheet metadata (id, manager_id, sheet_number, sheet_name, created_at)

#### `PATCH /api/admin/sheets/[id]`
- **Purpose:** Update sheet properties (name, number)
- **Access:** Admin only, must own the sheet
- **Used by:** SheetSettingsPanel.tsx
- **Operations:** 
  - Update sheet_name
  - Update sheet_number
  - Validate unique sheet names

#### `DELETE /api/admin/sheets/[id]`
- **Purpose:** Delete sheet and ALL related data
- **Access:** Admin only, must own the sheet
- **Cascading Deletes:**
  1. ✅ All cells (admin + all users)
  2. ✅ All fields (columns)
  3. ✅ All sharesheets (sharing relationships)
  4. ✅ The sheet itself

---

### 🔄 Shared (Role-Aware) Endpoints
**Location:** `/api/shared/sheets/[id]/route.ts`

These endpoints work for **both admin and agents** with role-aware access control:

#### `GET /api/shared/sheets/[id]`
- **Purpose:** Fetch sheet metadata (role-aware)
- **Access:** 
  - **Admin:** Must own the sheet (`manager_id` match)
  - **Agent:** Must have sheet shared with them (via `sharesheets` table)
- **Returns:** Sheet metadata
- **Use Cases:**
  - Agent viewing shared sheets
  - General sheet information retrieval
  - Cross-role sheet access

---

## 📊 Comparison Table

| Endpoint | Location | Admin Access | Agent Access | Purpose |
|----------|----------|--------------|--------------|---------|
| `GET /api/admin/sheets/[id]` | `/admin/` | ✅ Own sheets | ❌ None | Admin operations |
| `PATCH /api/admin/sheets/[id]` | `/admin/` | ✅ Own sheets | ❌ None | Update sheet |
| `DELETE /api/admin/sheets/[id]` | `/admin/` | ✅ Own sheets | ❌ None | Delete sheet |
| `GET /api/shared/sheets/[id]` | `/shared/` | ✅ Own sheets | ✅ Shared sheets | Read sheet info |

---

## 🔍 Access Control Logic

### Admin Endpoints
```typescript
// Admin must be authenticated AND own the sheet
const decoded = verifyToken(token);
if (!decoded || decoded.role !== 'admin') {
  return 401 // Unauthorized
}

const sheet = await prisma.sheets.findUnique({ 
  where: { id: sheetId } 
});

if (sheet.manager_id !== decoded.userId) {
  return 403 // Forbidden
}
```

### Shared Endpoints
```typescript
// Role-aware access
const isAdmin = decoded.role === 'admin';

if (isAdmin) {
  // Admin: Direct ownership check
  sheet = await prisma.$queryRaw`
    SELECT * FROM sheets 
    WHERE id = ${sheetId} AND manager_id = ${userId}
  `;
} else {
  // Agent: Check sharing relationship
  sheet = await prisma.$queryRaw`
    SELECT s.* FROM sheets s
    INNER JOIN sharesheets ss ON s.id = ss.sheet_id
    WHERE s.id = ${sheetId} AND ss.user_id = ${userId}
  `;
}
```

---

## 🎯 Benefits of Separation

1. **Clear Responsibility**
   - Admin endpoints for management operations
   - Shared endpoints for data access

2. **Better Security**
   - Admin operations isolated from user operations
   - Explicit access control per endpoint

3. **Easier Maintenance**
   - Role-specific logic separated
   - Clear which endpoints serve which role

4. **Better API Organization**
   - `/admin/` = Administrative operations
   - `/shared/` = Cross-role data access
   - `/agent/` = Agent-specific operations

---

## 📝 Migration Notes

### Component Updates Needed

**If components use GET for read-only operations:**
```typescript
// OLD (admin-only)
fetch(`/api/admin/sheets/${sheetId}`)

// NEW (role-aware)
fetch(`/api/shared/sheets/${sheetId}`)
```

**Admin-specific operations (PATCH, DELETE) stay the same:**
```typescript
// Still use admin endpoint for modifications
fetch(`/api/admin/sheets/${sheetId}`, { method: 'PATCH' })
fetch(`/api/admin/sheets/${sheetId}`, { method: 'DELETE' })
```

---

## ✅ Complete Separation Achieved

- ✅ Admin GET endpoint in `/admin/sheets/[id]`
- ✅ Shared GET endpoint in `/shared/sheets/[id]`
- ✅ Admin PATCH endpoint in `/admin/sheets/[id]`
- ✅ Admin DELETE endpoint in `/admin/sheets/[id]`
- ✅ Role-aware access control
- ✅ Proper cascading deletes
- ✅ Clear authority boundaries

The backend sheet reading is now properly separated by authority level! 🎉
