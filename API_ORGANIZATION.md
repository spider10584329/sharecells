# 📁 API Route Organization

## Current Structure
```
src/app/api/
├── agent/
│   └── shared-sheets/
├── auth/
├── cell-data/
├── cells/
├── check-username/
├── register-user/
├── sharesheets/
├── sheet-data/
├── sheets/
├── users/
└── view-preference/
```

## Proposed Structure (For Future Refactoring)

### Option 1: Role-Based Organization
```
src/app/api/
├── admin/
│   ├── sheets/              # Admin sheet management
│   ├── users/               # User management
│   ├── sharesheets/         # Sheet sharing
│   └── fields/              # Field management
├── agent/
│   ├── shared-sheets/       # View shared sheets (✅ Already exists)
│   └── view-preference/     # View settings
├── shared/
│   ├── sheet-data/          # Both admin & agent use
│   ├── cell-data/           # Both admin & agent use
│   └── view-preference/     # Both admin & agent use
└── auth/
    ├── signin/
    ├── register-user/
    └── check-username/
```

### Option 2: Feature-Based Organization (Current - Recommended)
```
src/app/api/
├── agent/
│   └── shared-sheets/       # Agent-specific: List shared sheets
├── auth/
│   ├── signin/              # Authentication
│   ├── register-user/       # User registration
│   └── check-username/      # Username validation
├── sheets/                  # Sheet CRUD (admin-only)
├── sharesheets/             # Sheet sharing (admin-only)
├── users/                   # User management (admin-only)
├── cells/                   # Field/Column management
├── sheet-data/              # Get sheet data (role-aware)
├── cell-data/               # Cell CRUD operations (role-aware)
└── view-preference/         # User preferences (both roles)
```

## API Route Access Matrix

| Route | Admin | Agent | Description |
|-------|-------|-------|-------------|
| **Authentication** |
| `POST /api/auth/signin` | ✅ | ✅ | User login |
| `POST /api/register-user` | ✅ | ✅ | User registration |
| `GET /api/check-username` | ✅ | ✅ | Check username availability |
| **Sheets (Admin Only)** |
| `GET /api/sheets` | ✅ | ❌ | List all sheets |
| `POST /api/sheets` | ✅ | ❌ | Create sheet |
| `GET /api/sheets/[id]` | ✅ | ❌ | Get sheet details |
| `PATCH /api/sheets/[id]` | ✅ | ❌ | Update sheet |
| `DELETE /api/sheets/[id]` | ✅ | ❌ | Delete sheet |
| **Fields (Admin Only)** |
| `GET /api/cells?sheet_id=X` | ✅ | ❌ | List fields for sheet |
| `POST /api/cells` | ✅ | ❌ | Create field |
| `PATCH /api/cells/[id]` | ✅ | ✅ | Update field (width) |
| `DELETE /api/cells/[id]` | ✅ | ❌ | Delete field |
| **Sharing (Admin Only)** |
| `GET /api/sharesheets?sheet_id=X` | ✅ | ❌ | Get shared users |
| `POST /api/sharesheets` | ✅ | ❌ | Share with user |
| `DELETE /api/sharesheets` | ✅ | ❌ | Unshare from user |
| **Users (Admin Only)** |
| `GET /api/users` | ✅ | ❌ | List users |
| `PATCH /api/users/[id]` | ✅ | ❌ | Update user status |
| `DELETE /api/users/[id]` | ✅ | ❌ | Delete user |
| `POST /api/users/[id]/change-password` | ✅ | ❌ | Change password |
| **Sheet Data (Role-Aware)** |
| `GET /api/sheet-data/[id]` | ✅ | ✅ | Get sheet data (filtered by role) |
| **Cell Data (Role-Aware)** |
| `POST /api/cell-data` | ✅ | ✅ | Create/update cell |
| `DELETE /api/cell-data` | ✅ | ✅ | Delete row (own only) |
| **Agent Specific** |
| `GET /api/agent/shared-sheets` | ❌ | ✅ | List shared sheets |
| **Shared Resources** |
| `GET /api/view-preference` | ✅ | ✅ | Get view preference |
| `POST /api/view-preference` | ✅ | ✅ | Save view preference |

## Security Implementation

### Middleware Protection
```typescript
// src/middleware.ts
export const config = {
  matcher: ['/admin/:path*', '/agent/:path*'],
};
```

### API Route Protection Pattern
```typescript
// Every protected route:
const token = request.cookies.get('token')?.value;
if (!token) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
const userRole = decoded.userRole || 'agent';
const isAdmin = userRole === 'admin';

// Admin-only routes:
if (!isAdmin) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Role-Aware Data Filtering
```typescript
// Admin sees all, Agent sees only their own
if (isAdmin) {
  // Query: SELECT * FROM cells WHERE sheet_id = X
  cells = await prisma.$queryRaw`...`;
} else {
  // Query: SELECT * FROM cells WHERE sheet_id = X AND user_id = Y
  cells = await prisma.$queryRaw`... WHERE user_id = ${decoded.userId}`;
}
```

## Route Descriptions

### Authentication Routes
- **`/api/auth/signin`**: Validates credentials, generates JWT token
- **`/api/register-user`**: Creates new user account
- **`/api/check-username`**: Validates username availability

### Admin Routes
- **`/api/sheets`**: Full CRUD for worksheet management
- **`/api/cells`**: Manage fields/columns for worksheets
- **`/api/sharesheets`**: Share/unshare worksheets with users
- **`/api/users`**: User account management

### Agent Routes
- **`/api/agent/shared-sheets`**: Lists worksheets shared with logged-in agent

### Shared Routes (Role-Aware)
- **`/api/sheet-data/[id]`**: Returns filtered data based on user role
- **`/api/cell-data`**: Creates/updates cells with user_id tracking
- **`/api/view-preference`**: Saves user UI preferences

## Best Practices

### ✅ Current Implementation Strengths
1. **Clear separation** of agent-specific routes under `/api/agent/`
2. **Consistent naming** conventions
3. **Role-aware filtering** in shared endpoints
4. **JWT-based authentication** on all protected routes
5. **HTTP status codes** properly used (401, 403, 404, 500)

### 🔄 Future Improvements (Optional)
1. Create `/api/admin/` folder for admin-only routes
2. Move shared routes to `/api/shared/` folder
3. Add API versioning (`/api/v1/`)
4. Implement rate limiting
5. Add request validation middleware
6. Create API documentation with Swagger/OpenAPI

### 📚 Documentation Standards
Each route should have:
- Clear JSDoc comments
- Request/response type definitions
- Error handling patterns
- Example usage in comments

## Current Status: ✅ Well-Organized

The current structure is clean and functional. The agent-specific routes are properly separated, and role-based access control is implemented at the route level. No immediate refactoring needed unless the API grows significantly larger.
