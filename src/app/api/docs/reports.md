# Report API Documentation

## GET /api/reports/{id}

Retrieves detailed information about a specific report.

### Authorization

- Requires authentication (JWT token in Authorization header)
- Access is limited to the owner of the report

### URL Parameters

- `id` (required): The numeric ID of the report to retrieve

### Response Format

#### Success (200 OK)

```json
{
  "id": 1,
  "userId": 1,
  "title": "Report Title",
  "originalText": "Large input text...",
  "summary": "Report summary...",
  "conclusions": "Report conclusions...",
  "keyData": "Report key data...",
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

#### Error Responses

- `400 Bad Request`: Invalid report ID format
  ```json
  {
    "statusCode": 400,
    "message": "Invalid report ID"
  }
  ```

- `401 Unauthorized`: Missing or invalid JWT token
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized: Authentication required"
  }
  ```

- `404 Not Found`: Report not found or does not belong to the authenticated user
  ```json
  {
    "statusCode": 404,
    "message": "Report with ID {id} not found"
  }
  ```

- `500 Internal Server Error`: Server error
  ```json
  {
    "statusCode": 500,
    "message": "Internal server error"
  }
  ```

### Example Request

```bash
curl -X GET \
  https://example.com/api/reports/1 \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  -H 'Content-Type: application/json'
```

### Implementation Notes

- Uses Row Level Security (RLS) to ensure users can only access their own reports
- The `title` field is required in the database schema (added during implementation)
- Error handling follows a consistent format across all API endpoints 