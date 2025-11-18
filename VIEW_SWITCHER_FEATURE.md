# View Switcher Feature

## Overview
This feature allows users to toggle between **Card View** and **Table View** for displaying worksheets. The user's preference is stored in the database and persisted across sessions.

## Components Created/Modified

### 1. API Route: `/api/view-preference`
**File:** `src/app/api/view-preference/route.ts`

**Endpoints:**
- **GET**: Fetches the user's current view preference
- **POST**: Saves the user's view preference

**Database Table:** `sheet_view`
- `id` - Primary key
- `manager_id` - User ID (stored as string)
- `view_type` - 0 for Card view, 1 for Table view

### 2. SheetTable Component
**File:** `src/components/admin/SheetTable.tsx`

A new component that displays worksheets in a table format with columns:
- # (Sheet Number)
- Sheet Name
- Shared Users
- Created Date
- Actions (Settings & Delete)

### 3. WorkSheetsHeader Component (Updated)
**File:** `src/components/admin/WorkSheetsHeader.tsx`

**Changes:**
- Added dropdown menu on View Mode button click
- Dropdown shows "Card" and "Table" options
- Active view is highlighted in blue
- Dropdown closes when clicking outside

### 4. Admin Page (Updated)
**File:** `src/app/admin/page.tsx`

**Changes:**
- Fetches view preference on component mount
- Switches between `SheetGrid` (card view) and `SheetTable` (table view)
- Saves view preference to database when user changes view
- Shows loading spinner while fetching initial preference
- Shows toast notification on view change

## User Flow

1. User clicks on the View Mode icon (dashboard icon)
2. Dropdown menu appears with "Card" and "Table" options
3. User selects desired view
4. View preference is saved to database
5. Display changes to selected view
6. Toast notification confirms the change
7. On next visit, user's preferred view is automatically loaded

## Database Schema

```sql
CREATE TABLE sheet_view (
  id INT PRIMARY KEY AUTO_INCREMENT,
  manager_id VARCHAR(255) NOT NULL,
  view_type INT DEFAULT 0
);
```

## View Types
- `0` = Card View (default)
- `1` = Table View

## Features
✅ Persistent view preference per user
✅ Smooth transition between views
✅ Loading state while fetching preference
✅ Toast notifications for user feedback
✅ Dropdown closes on outside click
✅ Active view highlighted in dropdown
✅ Responsive design for both views
