-- 1. Create the function with robust error handling
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (user_id, name)
  values (
    new.id,
    -- Try 'name', then 'full_name', then fallback to the email address
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      new.email
    )
  );
  return new;
end;
$$;

-- 2. Drop the trigger if it exists (to prevent errors when re-running)
drop trigger if exists on_auth_user_created on auth.users;

-- 3. Re-create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Your existing policies (kept exactly the same)
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "Users can CRUD own tasks" on public.tasks;
create policy "Users can CRUD own tasks"
on public.tasks for all
using (auth.uid() = user_id);

-- 5. Enable RLS
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;

-- 6. Your existing optimization
drop index if exists idx_tasks_user_created;
create index idx_tasks_user_created
on public.tasks(user_id, created_at DESC);