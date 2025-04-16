-- 20241005120000_create_users_and_reports.sql
-- migration: create users and reports tables for raport generator ai.
-- description: creates the necessary tables and associated constraints, indexes, and row level security (rls) policies.
-- all sql is written in lowercase.

-- create table users
create table users (
    id serial primary key,
    email varchar(255) unique not null,
    hashed_password varchar(255) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- create table reports
create table reports (
    id serial primary key,
    user_id integer not null references users(id) on delete cascade,
    title varchar(255) not null,
    original_text text check (length(original_text) <= 10000),
    summary text check (length(summary) <= 10000),
    conclusions text check (length(conclusions) <= 10000),
    key_data text check (length(key_data) <= 10000),
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

-- create index on reports.user_id to optimize queries filtering by user id
create index idx_reports_user_id on reports(user_id);

-- enable row level security on reports table as per best practices
alter table reports enable row level security;

-- create rls policies for authenticated users on reports table
-- policy for select: only allow report owner to select their reports
create policy select_reports_authenticated on reports
    for select to authenticated
    using (user_id = current_setting('myapp.current_user_id')::integer);

-- policy for insert: only allow report owner to insert if user_id matches current setting
create policy insert_reports_authenticated on reports
    for insert to authenticated
    with check (user_id = current_setting('myapp.current_user_id')::integer);

-- policy for update: only allow report owner to update their reports
create policy update_reports_authenticated on reports
    for update to authenticated
    using (user_id = current_setting('myapp.current_user_id')::integer)
    with check (user_id = current_setting('myapp.current_user_id')::integer);

-- policy for delete: only allow report owner to delete their reports
create policy delete_reports_authenticated on reports
    for delete to authenticated
    using (user_id = current_setting('myapp.current_user_id')::integer);

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