-- 1. Create the subtasks table
create table public.subtasks (
  subtask_id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(task_id) on delete cascade not null,
  title text not null,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.subtasks enable row level security;

-- 3. Create Policy: Users can see subtasks for their own tasks
create policy "Users can CRUD their own subtasks"
on public.subtasks for all
using (
  exists (
    select 1 from public.tasks
    where public.tasks.task_id = subtasks.task_id
    and public.tasks.user_id = auth.uid()
  )
);

-- 4. Optimization: Index for faster lookups
create index idx_subtasks_task_id on public.subtasks(task_id);