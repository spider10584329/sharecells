# 📋 ShareCells - Complete Workflow Guide

## 🎯 System Overview

ShareCells is a collaborative worksheet management system where:
- **Administrators** create worksheets, define fields, and share them with users
- **Regular Users (Agents)** work on shared worksheets with their own isolated data
- Each user's data is completely separate, but admins can view all users' work

---

## 🔧 Complete Setup and Testing Guide

### Phase 1: Admin Setup

#### Step 1: Create User Accounts (Admin Only)
1. **Login as Admin** with your administrator credentials
2. Navigate to **"Users"** from the left sidebar
3. You'll see the user management page
4. **Note**: Users are created through the registration system (not shown in this interface)
5. You can:
   - **View all users** under your management
   - **Activate/Deactivate** user accounts
   - **Change passwords** for users
   - **Delete users** if needed

#### Step 2: Create a Worksheet
1. Navigate to **"Worksheets"** from the left sidebar
2. Click the **"Add Sheet"** button (top right)
3. Enter a sheet name (e.g., "Sales Tracker", "Inventory Log")
4. Click **"Add"** to create the sheet

#### Step 3: Configure Fields (Columns)
1. Click the **gear/settings icon** on any worksheet card
2. This opens the **Sheet Settings Panel** with three tabs:
   - **Sheet Info**: Edit sheet name and number
   - **Fields**: Manage columns/fields
   - **Share Users**: Share with users

3. **Go to "Fields" tab** and add columns:
   - Click **"Add Field"** button
   - Enter field name (e.g., "Product Name", "Quantity", "Date")
   - Choose field type:
     - **Static**: One value per user for the entire sheet (e.g., "User Location")
     - **Dynamic**: Different value in each row (e.g., "Product Name")
   - Click **"Add"** to create the field
   - Repeat for all needed columns

4. **Example Field Configuration**:
   ```
   Field Name         | Type    | Purpose
   ------------------|---------|----------------------------------
   Location          | Static  | User's office location (once per user)
   Department        | Static  | User's department (once per user)
   Product Name      | Dynamic | Different per row
   Quantity          | Dynamic | Different per row
   Date              | Dynamic | Different per row
   Notes             | Dynamic | Different per row
   ```

#### Step 4: Share Worksheet with Users
1. Still in the **Sheet Settings Panel**, go to **"Share Users"** tab
2. Click the **"Share with Users"** button
3. A dropdown appears showing all available users
4. Use the search box to filter users
5. Click on a user to share the sheet with them
6. Repeat for all users who need access
7. You'll see the list of shared users below
8. You can **remove access** by clicking the "Remove" button next to any user

#### Step 5: Close Settings
- Click the **X** button to close the settings panel
- Your worksheet is now configured and shared!

---

### Phase 2: User/Agent Workflow

#### Step 1: Login as Regular User
1. **Logout** from the admin account
2. **Login** with a regular user (agent) account
3. You'll see the agent dashboard

#### Step 2: View Shared Worksheets
1. Navigate to **"Worksheets"** (should be default page)
2. You'll see all worksheets shared with you by the administrator
3. Each card shows:
   - Sheet name
   - Sheet number
   - Who shared it (admin name)
   - Creation date
4. **View Options**:
   - **Card View**: Grid of worksheet cards (default)
   - **Table View**: Detailed table format
   - Toggle between views using the icons in the top right

#### Step 3: Open and Work on a Worksheet
1. Click **"Open Sheet"** button on any worksheet
2. The worksheet opens in spreadsheet view
3. You'll see:
   - All fields (columns) configured by the admin
   - Only YOUR data rows (not other users' data)
   - An **"Add Row"** button

#### Step 4: Add Your First Row
1. Click **"Add Row"** button (top left)
2. A new row appears at the bottom
3. Click any cell to start editing
4. **For Static Fields**:
   - These fields are **only editable in your first row**
   - Examples: Your location, your department, your name
   - In rows 2, 3, 4+, these fields are **gray and read-only**
   - They show empty (the value from row 1 applies to all your rows)

5. **For Dynamic Fields**:
   - These are editable in every row
   - Examples: Product name, quantity, date, notes

#### Step 5: Data Entry Tips
- **Tab Key**: Move to next editable cell (skips read-only static fields)
- **Shift+Tab**: Move to previous editable cell
- **Enter**: Save cell and exit editing
- **Escape**: Cancel editing without saving
- **Auto-Add Row**: When you Tab from the last cell in the last row, a new row is automatically created

#### Step 6: Column Width Adjustment
1. **Hover** over the column border in the header
2. You'll see a **resize cursor**
3. **Click and drag** to adjust column width
4. Widths are **automatically saved** to the database
5. Your custom widths persist when you reopen the sheet

#### Step 7: Delete Rows
1. Each row has a **delete button** (trash icon) in the Actions column
2. Click to delete the row
3. You can **only delete your own rows**

---

### Phase 3: Admin Oversight

#### View All Users' Work
1. **Login as Admin**
2. Open any worksheet
3. You'll see **ALL records from ALL users**, organized by user
4. **Additional Columns** appear for admin:
   - **User**: Shows which user created each record
   - **Created At**: Shows timestamp of record creation
5. Records are **sorted by user** so you can see each user's work grouped together
6. The row number shows the sequential order

#### Admin Data Entry
1. Admin can also **add their own rows**
2. Admin rows have **user_id = NULL** in the database
3. These show as **"Admin"** in the User column
4. Admin can only delete admin-created rows (not user rows)

---

## 🔑 Key Concepts Explained

### Static vs Dynamic Fields

**Static Fields (sheet_type = 1)**
- Purpose: Data that's the same across all rows for a specific user
- Examples: User name, location, department, office number
- Behavior:
  - Editable ONLY in the first row for each user
  - Grayed out and read-only in rows 2, 3, 4, etc.
  - Tab key automatically skips these in non-first rows
- Database: Value stored once but applies to all rows for that user

**Dynamic Fields (sheet_type = 2)**
- Purpose: Data that changes in every row
- Examples: Product name, quantity, date, description
- Behavior:
  - Editable in every row
  - Each row can have different values
- Database: Separate value stored for each row

### User Data Isolation

**For Regular Users:**
- See ONLY their own rows
- Cannot see admin's rows
- Cannot see other users' rows
- user_id field in database = their user ID

**For Admins:**
- See ALL rows from ALL users
- Rows organized by user
- Can distinguish between:
  - Admin rows (user_id = NULL, shows "Admin")
  - User rows (user_id = specific user ID, shows username)

### Column Width Persistence

- Column widths stored in `fields.cell_content` field
- Default width: 150 pixels
- Adjustments saved automatically on resize
- Loaded when sheet is opened
- Shared across all users (not user-specific)

---

## 📊 Database Structure

### Key Tables

**sheets**
- id, sheet_name, sheet_number, manager_id, created_at
- Stores worksheet definitions

**fields**
- id, sheet_id, cell_title, cell_content (stores width), sheet_type
- Defines columns for each worksheet
- sheet_type: 1 = static, 2 = dynamic

**cells**
- id, sheet_id, field_id, uuid (row ID), value, user_id, created_at
- Stores actual data values
- user_id: NULL for admin, specific user ID for regular users

**sharesheets**
- id, sheet_id, user_id, manager_id, created_at
- Tracks which sheets are shared with which users

**users**
- id, username, password, manager_id, isActive
- User account information

---

## 🎨 User Interface Features

### Admin View
- ✅ Create/edit/delete worksheets
- ✅ Configure fields with static/dynamic types
- ✅ Share worksheets with users
- ✅ View all users' work organized by user
- ✅ Card and Table view modes
- ✅ User and timestamp columns in spreadsheet
- ✅ Full CRUD operations

### Agent View
- ✅ View only shared worksheets
- ✅ Card and Table view modes
- ✅ See who shared each worksheet
- ✅ Open and edit worksheets
- ✅ Add/delete own rows
- ✅ Tab navigation with smart field skipping
- ✅ Column width adjustment
- ✅ Data isolation (only see own records)

---

## 🚀 Getting Started Checklist

### First Time Setup
- [ ] Admin creates user accounts (via registration)
- [ ] Admin activates user accounts in Users page
- [ ] Admin creates first worksheet
- [ ] Admin configures fields (mix of static and dynamic)
- [ ] Admin shares worksheet with users
- [ ] Users login and verify they see the shared sheet
- [ ] Users add their first row and fill in static fields
- [ ] Users add more rows (static fields auto-skip)
- [ ] Admin verifies they can see all users' work

### Daily Operations
- [ ] Users login and navigate to "My Worksheets"
- [ ] Users open shared worksheets
- [ ] Users add/edit/delete their data rows
- [ ] Admin monitors progress by viewing all users' work
- [ ] Admin can create additional worksheets as needed

---

## 💡 Best Practices

### For Administrators
1. **Plan your fields carefully** before sharing
2. Use **static fields** for user-specific constants (location, department)
3. Use **dynamic fields** for row-specific data (products, quantities, dates)
4. **Share worksheets** only with users who need access
5. **Monitor user activity** via the User and Created At columns
6. **Adjust column widths** to fit your data before sharing

### For Regular Users
1. **Fill in static fields carefully** in your first row (they apply to all your rows)
2. Use **Tab key** for fast data entry
3. **Adjust column widths** to see full data
4. **Delete wrong entries** immediately using the delete button
5. **Logout properly** when done

---

## 🐛 Troubleshooting

### "No shared worksheets" message
- ✅ Verify admin has shared the sheet with your account
- ✅ Try logging out and back in
- ✅ Contact admin to verify sharing

### Cannot edit a field
- ✅ Check if it's a static field in row 2+ (read-only by design)
- ✅ Verify you're in the first row if it's a static field
- ✅ Try clicking directly on the cell

### Not seeing other users' data
- ✅ This is correct behavior for regular users (data isolation)
- ✅ Only admin can see all users' data

### Column widths not saving
- ✅ Make sure you release the mouse after dragging
- ✅ Check console for any API errors
- ✅ Try refreshing the page to verify it saved

---

## 🎯 Success Metrics

Your system is working correctly when:
- ✅ Admins can create, configure, and share worksheets
- ✅ Users see only shared worksheets
- ✅ Users see only their own data rows
- ✅ Static fields are editable only in first row per user
- ✅ Tab navigation skips read-only fields
- ✅ Admin sees all users' work organized by user
- ✅ Column widths persist across sessions
- ✅ Data is properly isolated between users

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Verify database connections
3. Check browser console for errors
4. Verify JWT token is valid
5. Ensure proper user roles (admin vs agent)

---

**System Ready!** Your ShareCells collaborative worksheet system is fully configured and ready for use! 🎉
