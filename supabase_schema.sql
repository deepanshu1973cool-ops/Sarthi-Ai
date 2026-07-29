-- Create the profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  age integer not null,
  state text not null,
  gender text not null,
  education text not null,
  annual_income numeric not null,
  social_category text not null,
  occupation text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Drop existing policies if they exist to avoid duplication errors
drop policy if exists "Users can view their own profile." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update their own profile." on public.profiles;

-- Create policies so users can only access their own profile data (matching id or user_id)
create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id or auth.uid() = user_id);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id or auth.uid() = user_id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id or auth.uid() = user_id);

-- Create the user_progress table
create table if not exists public.user_progress (
  id uuid references auth.users on delete cascade primary key,
  user_id uuid references auth.users on delete cascade,
  profile_completed boolean default false not null,
  eligibility_checked boolean default false not null,
  recommendations_generated integer default 0 not null,
  applications_started integer default 0 not null,
  applications_submitted integer default 0 not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on user_progress
alter table public.user_progress enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own progress." on public.user_progress;
drop policy if exists "Users can insert their own progress." on public.user_progress;
drop policy if exists "Users can update their own progress." on public.user_progress;

-- Create policies so users can only access their own progress data (matching user_id)
create policy "Users can view their own progress." on public.user_progress
  for select using (auth.uid() = user_id);

create policy "Users can insert their own progress." on public.user_progress
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own progress." on public.user_progress
  for update using (auth.uid() = user_id);
