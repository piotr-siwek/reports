# Report API Implementation

This directory contains the implementation of the Reports REST API for the Ania Reports application. The API is built using Next.js API Routes with TypeScript and integrates with Supabase for database operations and authentication.

## Architecture

The API follows a clean architecture pattern with the following layers:

1. **Routes** (`src/app/api/**/route.ts`): Entry points for Next.js API routes
2. **Controllers** (`src/reports/report.controller.ts`): Handle HTTP requests and responses
3. **Services** (`src/reports/report.service.ts`): Contain business logic and data access
4. **Types** (`src/types.ts`): Define DTOs and command models
5. **Database Types** (`src/db/database.types.ts`): Define database schema types
6. **Error Handling** (`src/lib/error-handler.ts`): Centralized error handling
7. **Authentication** (`src/middleware.ts`): JWT authentication middleware

## Security

### Authentication

- JWT-based authentication using Supabase Auth
- Stateless authentication with tokens passed via the Authorization header
- Middleware validates tokens and extracts user information

### Authorization

- Row Level Security (RLS) in Supabase/PostgreSQL limits access to user's own data
- The middleware adds the user ID to request headers
- Services set the RLS context for database queries

## API Endpoints

### Reports API

- **GET /api/reports/{id}**: Get report details
  - Implemented in `src/app/api/reports/[id]/route.ts`
  - Controller in `src/reports/report.controller.ts`
  - Service in `src/reports/report.service.ts`
  - Documentation in `src/app/api/docs/reports.md`

## Testing

- Unit tests for the ReportService in `src/reports/report.service.test.ts`
- E2E tests for the API endpoints in `src/app/api/reports/[id]/route.test.ts`
- Run tests with `npm test`

## Error Handling

The API uses a consistent error handling approach:

- HTTP status codes map to error types (400, 401, 404, 500)
- Consistent error response format with `statusCode` and `message` fields
- Centralized error handling in `src/lib/error-handler.ts`
- Custom errors like `NotFoundError` for specific scenarios

## Database

- PostgreSQL via Supabase
- Row Level Security (RLS) policies limit access to user's own data
- Tables:
  - `users`: Authentication and user profiles
  - `reports`: Report data with user ownership

## Development

1. Set up environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Test the API using curl or any API client:
   ```
   curl -X GET \
     http://localhost:3000/api/reports/1 \
     -H 'Authorization: Bearer your-jwt-token'
   ```

## Future Enhancements

1. Add rate limiting for API endpoints
2. Implement request validation using a schema validation library
3. Add full OpenAPI/Swagger documentation
4. Add integration tests with a test database 