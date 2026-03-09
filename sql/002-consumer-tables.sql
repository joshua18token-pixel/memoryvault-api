-- Run this in Supabase SQL Editor --

-- User profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users(id) primary key,
  display_name text,
  avatar_url text,
  credits numeric default 1.00,
  tier text default 'free' check (tier in ('free', 'builder', 'scale', 'enterprise')),
  preferred_model text default 'gpt-4o-mini',
  total_spent numeric default 0,
  created_at timestamptz default now()
);

-- Credit transactions ledger
create table credit_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  amount numeric not null,
  type text not null check (type in ('purchase', 'usage', 'bonus', 'refund')),
  description text,
  model text,
  created_at timestamptz default now()
);

-- Chat sessions
create table chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  title text default 'New Chat',
  model text default 'gpt-4o-mini',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat messages
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references chat_sessions(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,
  tokens_used int default 0,
  cost numeric default 0,
  created_at timestamptz default now()
);

-- Indexes
create index idx_profiles_id on profiles(id);
create index idx_chat_sessions_user on chat_sessions(user_id);
create index idx_chat_messages_session on chat_messages(session_id);
create index idx_credit_transactions_user on credit_transactions(user_id);

-- Auto-create profile on signup (gives $1.00 free credits)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, credits)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 1.00);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS policies
alter table profiles enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table credit_transactions enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can view own sessions" on chat_sessions for select using (auth.uid() = user_id);
create policy "Users can create sessions" on chat_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on chat_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on chat_sessions for delete using (auth.uid() = user_id);
create policy "Users can view own messages" on chat_messages for select using (auth.uid() = user_id);
create policy "Users can create messages" on chat_messages for insert with check (auth.uid() = user_id);
create policy "Users can view own transactions" on credit_transactions for select using (auth.uid() = user_id);
