# PostgreSQL Database Schema Plan for Raport Generator AI

This document outlines the database schema design for the Raport Generator AI application.

## 1. Tables

### 1.1. `users`
- **id**: SERIAL PRIMARY KEY
- **email**: VARCHAR(255) UNIQUE NOT NULL
- **hashed_password**: VARCHAR(255) NOT NULL
- **created_at**: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- **updated_at**: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

### 1.2. `reports`
- **id**: SERIAL PRIMARY KEY
- **user_id**: INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- **original_text**: TEXT CHECK (LENGTH(original_text) <= 10000)
- **summary**: TEXT CHECK (LENGTH(summary) <= 10000)
- **conclusions**: TEXT CHECK (LENGTH(conclusions) <= 10000)
- **key_data**: TEXT CHECK (LENGTH(key_data) <= 10000)
- **created_at**: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- **updated_at**: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP

## 2. Relationships

- One-to-Many relationship between `users` and `reports`: Each report is linked to one user via the `user_id` foreign key. Deleting a user cascades to remove associated reports.

## 3. Indexes

- An index on the `reports.user_id` column to optimize queries filtering by user:

  ```sql
  CREATE INDEX idx_reports_user_id ON reports(user_id);
  ```

## 4. Row Level Security (RLS)

- Enable RLS on the `reports` table and implement a policy so that only the owner of the report can perform SELECT, UPDATE, and DELETE operations.

  ```sql
  ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

  CREATE POLICY report_owner_policy ON reports
      USING (user_id = current_setting('myapp.current_user_id')::integer)
      WITH CHECK (user_id = current_setting('myapp.current_user_id')::integer);
  ```

## 5. Additional Notes

- All text fields in the `reports` table have a CHECK constraint limiting their length to 10,000 characters (approximately two A4 pages).
- Timestamp columns (`created_at`, `updated_at`) default to CURRENT_TIMESTAMP for audit purposes.
- The design adheres to 3NF and is optimized for PostgreSQL on Supabase, with future scalability considerations (e.g., table partitioning) in mind. 