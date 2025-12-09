# Sheet-Specific API Access Feature

## Overview
This feature allows customers to retrieve data from specific sheets using the API, instead of always retrieving all sheets.

## Changes Made

### 1. API Route Enhancement (`/api/sharecells`)
**File**: `src/app/api/sharecells/route.ts`

#### New Optional Parameter
- `sheet_id` (optional) - When provided, returns data only from the specified sheet

#### API Behavior
- **Without sheet_id**: Returns all sheets (backward compatible with existing implementations)
- **With sheet_id**: Returns only the specified sheet
  - Validates that the sheet exists and belongs to the customer
  - Returns 404 error if sheet doesn't exist or doesn't belong to customer

#### API Examples
```bash
# Get all sheets
GET /api/sharecells?customer_id=1&apikey=your-api-key

# Get specific sheet
GET /api/sharecells?customer_id=1&apikey=your-api-key&sheet_id=5
```

### 2. Admin API Key Page Enhancement
**File**: `src/app/admin/apikey/page.tsx`

#### New Features
1. **Sheet Dropdown Selector**
   - Shows "All Sheets" option (default)
   - Lists all available sheets for the customer
   - Dynamically updates the API URL based on selection

2. **Dynamic API URL**
   - Automatically updates to include `sheet_id` parameter when a specific sheet is selected
   - Shows placeholder text when no sheet is selected

3. **CSV Export**
   - Downloads data based on the selected sheet filter
   - Exports all sheets or specific sheet based on selection

4. **Enhanced Documentation**
   - Added API parameter documentation
   - Clear explanation of optional sheet_id parameter

## Technical Details

### Validation
- `customer_id`: Required, must be valid integer
- `apikey`: Required, must match customer's API key
- `sheet_id`: Optional, if provided must be valid integer and must belong to the customer

### Error Responses
```json
// Missing sheet_id parameter (400)
{
  "error": "Invalid sheet_id",
  "message": "sheet_id must be a valid number"
}

// Sheet not found or unauthorized (404)
{
  "error": "Sheet not found",
  "message": "The specified sheet_id does not exist or does not belong to this customer"
}
```

### Success Response
Response format remains the same, but data array contains only the requested sheet(s):

```json
{
  "data": [
    {
      "sheet_id": 5,
      "sheet_name": "Hardware Inventory",
      "rows": [
        {
          "field1": "value1",
          "field2": "value2",
          "Username": "john_doe",
          "Updated_At": "2025-01-15 10:30:00"
        }
      ]
    }
  ]
}
```

## Benefits

1. **Performance**: Reduces data transfer when only specific sheet data is needed
2. **Flexibility**: Maintains backward compatibility while adding new functionality
3. **Security**: Validates sheet ownership to prevent unauthorized access
4. **User Experience**: Easy-to-use dropdown interface for sheet selection
5. **Documentation**: Clear API parameter documentation in the UI

## Usage Instructions

### For Administrators
1. Navigate to the API Key page
2. Generate or view your API key
3. Select a specific sheet from the dropdown or keep "All Sheets" selected
4. Copy the generated API URL with the appropriate parameters
5. Download CSV exports filtered by the selected sheet

### For API Consumers
Simply add the `sheet_id` parameter to your API requests:
- To get all sheets: Omit the `sheet_id` parameter
- To get a specific sheet: Add `&sheet_id=<SHEET_ID>` to the URL

## Backward Compatibility

✅ **Fully backward compatible** - Existing API integrations without the `sheet_id` parameter will continue to work as before, returning all sheets.

## Future Enhancements (Optional)

- Support for multiple sheet IDs in a single request
- Filter by sheet name instead of ID
- Date range filtering
- Field-level filtering
- Pagination for large datasets
