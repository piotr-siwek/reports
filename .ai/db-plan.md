# PostgreSQL Database Schema Plan for Raport Generator AI

This document outlines the database schema design for the Raport Generator AI application.

## 1. Tables

### 1.1. `reports`
- **id**: SERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- **original_text**: TEXT CHECK (LENGTH(original_text) <= 10000)
- **summary**: TEXT CHECK (LENGTH(summary) <= 10000)
- **conclusions**: TEXT CHECK (LENGTH(conclusions) <= 10000)
- **key_data**: TEXT CHECK (LENGTH(key_data) <= 10000)
- **created_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

## 2. Relationships

- One-to-Many relationship between `auth.users` and `reports`: Each report is linked to one user via the `user_id` foreign key. Deleting a user cascades to remove associated reports.

## 3. Indexes

- An index on the `reports.user_id` column to optimize queries filtering by user:

  ```sql
  CREATE INDEX idx_reports_user_id ON reports(user_id);
  ```

## 4. Row Level Security (RLS)

- Enable RLS on the `reports` table and implement a policy so that only the owner of the report can perform SELECT, INSERT, UPDATE, and DELETE operations. Note: We assume the user's ID from Supabase Auth is available via `auth.uid()`.

  ```sql
  -- Enable RLS
  ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

  -- Create policy for selecting reports
  CREATE POLICY "Allow individual read access" ON reports
    FOR SELECT
    USING (auth.uid() = user_id);

  -- Create policy for inserting reports
  CREATE POLICY "Allow individual insert access" ON reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  -- Create policy for updating reports
  CREATE POLICY "Allow individual update access" ON reports
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Create policy for deleting reports
  CREATE POLICY "Allow individual delete access" ON reports
    FOR DELETE
    USING (auth.uid() = user_id);
  ```

## 5. Additional Notes

- All text fields in the `reports` table have a CHECK constraint limiting their length to 10,000 characters (approximately two A4 pages).
- Timestamp columns (`created_at`, `updated_at`) use `TIMESTAMP WITH TIME ZONE` and default to `now()` for audit purposes, which is standard practice in Supabase.
- The design adheres to 3NF and is optimized for PostgreSQL on Supabase, leveraging Supabase Auth for user management. 