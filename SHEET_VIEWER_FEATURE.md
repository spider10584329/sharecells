# Excel-Like Sheet Viewer Feature

## Overview
This feature allows users to view and edit sheet data in an Excel/Google Sheets-like interface. When users click on a sheet card or table row, they can see and edit the actual data stored in the sheet.

## Database Structure

### Tables Relationship:
```
sheets (sheet metadata)
  ├── fields (column headers/definitions)
  └── cells (actual data values)
       ├── field_id (links to fields - represents columns)
       └── uuid (groups cells into rows)
```

### How Data is Organized:
- **sheets**: Contains sheet information (id, name, number, etc.)
- **fields**: Defines columns for a sheet
  - `field_id`: Unique identifier for each column
  - `cell_title`: Column header name
  - `cell_content`: Column description
  - `sheet_type`: Data type (1=Static, 2=Dynamic)
- **cells**: Stores actual cell values
  - `field_id`: Which column this cell belongs to
  - `uuid`: Groups cells into rows (all cells with same uuid = one row)
  - `value`: The actual cell content

## Components Created/Modified

### 1. SheetViewer Component
**File:** `src/components/admin/SheetViewer.tsx`

**Features:**
- Excel-like spreadsheet interface
- Click-to-edit cells
- Add/delete rows functionality
- Real-time data updates
- Column headers with descriptions
- Row numbering
- Responsive design

**Key Functions:**
- `fetchSheetData()`: Loads sheet structure and data
- `handleCellClick()`: Enables cell editing
- `handleCellBlur()`: Saves cell value on blur
- `handleKeyDown()`: Save on Enter, cancel on Escape
- `handleAddRow()`: Creates new row with unique UUID
- `handleDeleteRow()`: Removes entire row from database

### 2. API Routes

#### a) `/api/sheet-data/[id]/route.ts`
**Method:** GET
**Purpose:** Fetches complete sheet data including fields and cells

**Response Structure:**
```typescript
{
  sheet: {
    id: number,
    sheet_name: string,
    // ... other sheet properties
  },
  fields: [
    {
      id: number,
      cell_title: string,
      cell_content: string,
      sheet_type: number
    }
  ],
  rows: [
    {
      uuid: string,
      cells: {
        [fieldId]: {
          id: number,
          value: string
        }
      }
    }
  ]
}
```

#### b) `/api/cell-data/route.ts`
**Methods:** POST, DELETE

**POST - Update/Create Cell:**
```typescript
{
  sheet_id: number,
  field_id: number,
  uuid: string,
  value: string
}
```

**DELETE - Remove Row:**
Query params: `?uuid={rowUuid}&sheet_id={sheetId}`

### 3. Updated Components

#### SheetCard (`SheetCard.tsx`)
- Added `onView` prop
- Made card clickable to view sheet data
- Settings and delete buttons use `stopPropagation()`

#### SheetTable (`SheetTable.tsx`)
- Added `onView` prop
- Made table rows clickable to view sheet data
- Settings and delete buttons use `stopPropagation()`

#### SheetGrid (`SheetGrid.tsx`)
- Added `onView` prop
- Passes `onView` to SheetCard components

#### Admin Page (`page.tsx`)
- Added `viewingSheetId` and `viewingSheetName` state
- Added `handleViewSheet()` function
- Added `closeSheetViewer()` function
- Conditional rendering: SheetViewer → SheetSettingsPanel → Grid/Table

## User Flow

### Viewing a Sheet:
1. User sees sheets in card or table view
2. User clicks on any sheet
3. Excel-like viewer opens in the same area as settings panel
4. User can see all columns (fields) and rows (cells)

### Editing Data:
1. Click on any cell to edit
2. Type new value
3. Press Enter or click outside to save
4. Data is immediately saved to database

### Adding Rows:
1. Click "Add Row" button
2. New empty row appears at bottom
3. Click cells to add data
4. Each cell auto-saves when edited

### Deleting Rows:
1. Click delete icon (trash) in Actions column
2. Entire row is removed from database
3. UI updates immediately

### Closing Viewer:
1. Click X button in top-right
2. Returns to sheet list (card or table view)

## Technical Details

### UUID System:
- Each row has a unique UUID
- Format: `row-{timestamp}-{random}`
- All cells in a row share the same UUID
- Allows flexible row management

### Cell Updates:
- **Existing cells**: UPDATE query
- **New cells**: INSERT query
- Auto-detects based on existing cell data

### State Management:
- Local state for immediate UI updates
- API calls for persistence
- Optimistic UI updates for better UX

### Responsive Design:
- Horizontal scrolling for many columns
- Fixed column widths (min-w-[150px])
- Sticky header
- Mobile-friendly layout

## Styling

### Excel-Like Features:
✅ Grid layout with borders
✅ Header row with gray background
✅ Row numbering column
✅ Hover effects on rows
✅ Editable cells with focus styling
✅ Column headers with descriptions
✅ Action buttons per row
✅ Scrollable content area

### Color Scheme:
- Headers: Gray background (`bg-gray-100`)
- Cells: White with hover (`hover:bg-gray-50`)
- Editing: Blue border (`border-blue-500`)
- Actions: Red for delete, gray for neutral
- Empty cells: Italic gray placeholder

## Performance Considerations

1. **Data Loading**: Single API call fetches all data
2. **Cell Updates**: Individual updates per cell (not batch)
3. **Row Operations**: Separate API calls for add/delete
4. **State Updates**: Local state updates before API calls

## Future Enhancements

Potential improvements:
- [ ] Batch cell updates
- [ ] Undo/Redo functionality
- [ ] Cell formatting options
- [ ] Data validation rules
- [ ] Formula support
- [ ] Column resizing
- [ ] Cell merging
- [ ] Export to CSV/Excel
- [ ] Keyboard navigation (arrow keys)
- [ ] Copy/paste support
- [ ] Cell selection (drag to select multiple)
- [ ] Sort by column
- [ ] Filter rows
- [ ] Search functionality

## Usage Example

```typescript
// In parent component
const [viewingSheetId, setViewingSheetId] = useState<number | null>(null);
const [viewingSheetName, setViewingSheetName] = useState('');

const handleViewSheet = (sheetId: number, sheetName: string) => {
  setViewingSheetId(sheetId);
  setViewingSheetName(sheetName);
};

// Render
{viewingSheetId && (
  <SheetViewer
    sheetId={viewingSheetId}
    sheetName={viewingSheetName}
    onClose={() => setViewingSheetId(null)}
  />
)}
```

## Complete Flow Diagram

```
User Action → Component → API → Database
─────────────────────────────────────────
Click Sheet → handleViewSheet() → GET /api/sheet-data/[id] → SELECT from fields & cells
Click Cell  → handleCellClick() → (local state update)
Save Cell   → handleCellBlur() → POST /api/cell-data → INSERT/UPDATE cells
Add Row     → handleAddRow() → (local state update with UUID)
Delete Row  → handleDeleteRow() → DELETE /api/cell-data → DELETE from cells WHERE uuid
```

## Installation Complete ✅

All files have been created and integrated. The feature is ready to use!
