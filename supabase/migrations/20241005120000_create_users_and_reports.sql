-- 20241005120000_create_users_and_reports.sql
-- migration: create users and reports tables for raport generator ai.
-- description: creates the necessary tables and associated constraints, indexes, and row level security (rls) policies.
-- all sql is written in lowercase.


-- create table reports
create table reports (
    id serial primary key,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_text TEXT CHECK (LENGTH(original_text) <= 10000),
    summary TEXT CHECK (LENGTH(summary) <= 10000),
    conclusions TEXT CHECK (LENGTH(conclusions) <= 10000),
    key_data TEXT CHECK (LENGTH(key_data) <= 10000),
    title TEXT CHECK (LENGTH(title) <= 10000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- create index on reports.user_id to optimize queries filtering by user id
create index idx_reports_user_id on reports(user_id);

-- enable row level security on reports table as per best practices
alter table reports enable row level security;

-- create rls policies for authenticated users on reports table
-- policy for select: only allow report owner to select their reports
create policy select_reports_authenticated on reports
    for select to authenticated
    using (auth.uid() = user_id);

-- policy for insert: only allow report owner to insert if user_id matches current setting
create policy insert_reports_authenticated on reports
    for insert to authenticated
    with check (auth.uid() = user_id);

-- policy for update: only allow report owner to update their reports
create policy update_reports_authenticated on reports
    for update to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- policy for delete: only allow report owner to delete their reports
create policy delete_reports_authenticated on reports
    for delete to authenticated
    using (auth.uid() = user_id);

-- create rls policies for anon users on reports table to explicitly deny access
create policy select_reports_anon on reports
    for select to anon
    using (false);

create policy insert_reports_anon on reports
    for insert to anon
    with check (false);

create policy update_reports_anon on reports
    for update to anon
    using (false)
    with check (false);

create policy delete_reports_anon on reports
    for delete to anon
    using (false); 