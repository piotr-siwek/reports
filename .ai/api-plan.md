# REST API Plan

## 1. Resources
- **Users**: Represents user accounts. This corresponds to the `users` table in the database.
- **Reports**: Represents generated reports. This corresponds to the `reports` table and includes fields such as `original_text`, `summary`, `conclusions`, and `key_data`.

## 2. Endpoints

### 2.1. Authentication & User Management

1. **Register User**
   - **Method**: POST
   - **URL**: /auth/register
   - **Description**: Registers a new user.
   - **Request JSON**:
     ```json
     {
       "email": "user@example.com",
       "password": "string",
       "confirmPassword": "string"
     }
     ```
   - **Response JSON**:
     ```json
     {
       "message": "User registered successfully",
       "user": {
         "id": 1,
         "email": "user@example.com"
       }
     }
     ```
   - **Success Codes**: 201 Created
   - **Error Codes**: 400 (Validation errors), 409 (Email already exists)

2. **Login**
   - **Method**: POST
   - **URL**: /auth/login
   - **Description**: Authenticates a user and returns a JWT token.
   - **Request JSON**:
     ```json
     {
       "email": "user@example.com",
       "password": "string"
     }
     ```
   - **Response JSON**:
     ```json
     {
       "message": "Login successful",
       "token": "jwt-token-string"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 (Invalid input), 401 (Unauthorized)

3. **Logout**
   - **Method**: POST
   - **URL**: /auth/logout
   - **Description**: Logs out the authenticated user.
   - **Response JSON**:
     ```json
     {
       "message": "Logout successful"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 (Unauthorized)

4. **Reset Password**
   - **Method**: POST
   - **URL**: /auth/reset-password
   - **Description**: Initiates a password reset process by sending a reset link. The link expires after 24 hours.
   - **Request JSON**:
     ```json
     {
       "email": "user@example.com"
     }
     ```
   - **Response JSON**:
     ```json
     {
       "message": "Password reset link sent. Link expires after 24 hours."
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 (Invalid email)

5. **Change Password**
   - **Method**: PUT
   - **URL**: /auth/change-password
   - **Description**: Changes the password for the authenticated user.
   - **Request JSON**:
     ```json
     {
       "currentPassword": "string",
       "newPassword": "string",
       "confirmNewPassword": "string"
     }
     ```
   - **Response JSON**:
     ```json
     {
       "message": "Password changed successfully"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 (Validation errors), 401 (Unauthorized)

6. **Get User Profile**
   - **Method**: GET
   - **URL**: /auth/profile
   - **Description**: Retrieves the profile information of the authenticated user.
   - **Response JSON**:
     ```json
     {
       "id": 1,
       "email": "user@example.com",
       "firstName": "Optional",
       "lastName": "Optional"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 (Unauthorized)

7. **Update User Profile**
   - **Method**: PUT
   - **URL**: /auth/profile
   - **Description**: Updates the profile information of the authenticated user.
   - **Request JSON**:
     ```json
     {
       "firstName": "Optional",
       "lastName": "Optional",
       "email": "user@example.com"
     }
     ```
   - **Response JSON**:
     ```json
     {
       "message": "Profile updated successfully",
       "user": {
         "id": 1,
         "email": "user@example.com",
         "firstName": "Optional",
         "lastName": "Optional"
       }
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 (Validation errors), 401 (Unauthorized)

### 2.2. Reports

1. **Generate Report**
   - **Method**: POST
   - **URL**: /reports/generate
   - **Description**: Generates a report based on raw input text. This endpoint validates that the input text meets the minimum length requirement (e.g., minimum 100 characters) and returns a generated report preview.
   - **Request JSON**:
     ```json
     {
       "originalText": "Large input text..."
     }
     ```
   - **Response JSON**:
     ```json
     {
       "originalText": "Large input text...",
       "summary": "Generated summary...",
       "conclusions": "Generated conclusions...",
       "keyData": "Extracted key data..."
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 (Input text too short or validation errors), 500 (Generation error)

2. **Create/Save Report**
   - **Method**: POST
   - **URL**: /reports
   - **Description**: Saves a generated or edited report to the database under the authenticated user's account.
   - **Request JSON**:
     ```json
     {
       "title": "Report Title",
       "originalText": "Large input text...",
       "summary": "Report summary...",
       "conclusions": "Report conclusions...",
       "keyData": "Report key data..."
     }
     ```
   - **Response JSON**:
     ```json
     {
       "message": "Report saved successfully",
       "report": {
         "id": 1,
         "userId": 1,
         "title": "Report Title",
         "originalText": "Large input text...",
         "summary": "Report summary...",
         "conclusions": "Report conclusions...",
         "keyData": "Report key data...",
         "createdAt": "timestamp",
         "updatedAt": "timestamp"
       }
     }
     ```
   - **Success Codes**: 201 Created
   - **Error Codes**: 400 (Validation errors), 401 (Unauthorized)

3. **List Reports**
   - **Method**: GET
   - **URL**: /reports
   - **Description**: Retrieves a list of reports for the authenticated user, with support for pagination, filtering, and sorting.
   - **Query Parameters**:
     - `page` (optional, default: 1)
     - `limit` (optional, default: 10)
     - `sort` (optional, e.g., "createdAt" or "title")
     - `filter` (optional, filter by title keyword)
   - **Response JSON**:
     ```json
     {
       "reports": [
         {
           "id": 1,
           "title": "Report Title",
           "summary": "Report summary...",
           "createdAt": "timestamp"
         }
         // Additional reports...
       ],
       "pagination": {
         "page": 1,
         "limit": 10,
         "total": 50
       }
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 (Unauthorized)

4. **Get Report Details**
   - **Method**: GET
   - **URL**: /reports/{id}
   - **Description**: Retrieves the detailed information of a specific report.
   - **Response JSON**:
     ```json
     {
       "id": 1,
       "userId": 1,
       "title": "Report Title",
       "originalText": "Large input text...",
       "summary": "Report summary...",
       "conclusions": "Report conclusions...",
       "keyData": "Report key data...",
       "createdAt": "timestamp",
       "updatedAt": "timestamp"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 (Unauthorized), 404 (Not found)

5. **Update Report**
   - **Method**: PUT
   - **URL**: /reports/{id}
   - **Description**: Updates the details of an existing report (e.g., after editing).
   - **Request JSON**:
     ```json
     {
       "title": "Updated Report Title",  // Optional
       "originalText": "Large input text...",  // Optional
       "summary": "Updated summary...",          // Optional
       "conclusions": "Updated conclusions...",  // Optional
       "keyData": "Updated key data..."          // Optional
     }
     ```
   - **Response JSON**:
     ```json
     {
       "message": "Report updated successfully",
       "report": {
         "id": 1,
         "userId": 1,
         "title": "Updated Report Title",
         "originalText": "Large input text...",
         "summary": "Updated summary...",
         "conclusions": "Updated conclusions...",
         "keyData": "Updated key data...",
         "updatedAt": "timestamp"
       }
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 400 (Validation errors), 401 (Unauthorized), 404 (Not found)

6. **Delete Report**
   - **Method**: DELETE
   - **URL**: /reports/{id}
   - **Description**: Deletes a report owned by the authenticated user.
   - **Response JSON**:
     ```json
     {
       "message": "Report deleted successfully"
     }
     ```
   - **Success Codes**: 200 OK
   - **Error Codes**: 401 (Unauthorized), 404 (Not found)

## 3. Authentication and Authorization

- The API will use JWT-based authentication. After successful login, the user receives a JWT token, which must be included in the `Authorization` header as a Bearer token on subsequent requests.
- Endpoints under `/auth` are publicly accessible (with the exception of profile updates, which require authentication), while endpoints managing reports require a valid JWT token.
- Role-based access is enforced by ensuring that the `user_id` from the token matches the owner of the report in the database.

## 4. Validation and Business Logic

- **Data Validation**:
  - All text fields in the `reports` resource (`originalText`, `summary`, `conclusions`, `keyData`) will be validated against the maximum length of 10,000 characters as defined in the database schema.
  - The `originalText` field must meet a minimum length requirement (e.g., 100 characters) when generating a report.
  - Email and password fields are validated during user registration and login.

- **Business Logic**:
  - The report generation endpoint processes the input text to produce a summary, conclusions, and key data segments.
  - The API enforces ownership by checking that the authenticated user's ID matches the `user_id` in the report record.
  - Endpoints supporting listing reports include pagination, filtering, and sorting parameters to improve performance and usability. The database index on `reports.user_id` assists with efficient queries.

- **Error Handling**:
  - Standard HTTP response codes (e.g., 400, 401, 404, 500) will be used, along with descriptive error messages to assist the client in resolving issues.

- **Security Measures**:
  - Rate limiting will be implemented to protect against abuse.
  - Data transmission will be secured over HTTPS.
  - JWT tokens will ensure secure, stateless sessions.

**Assumptions:**
- The AI report generation logic is encapsulated within the `/reports/generate` endpoint.
- Additional profile fields and report metadata (such as report title) may be extended as product requirements evolve. 