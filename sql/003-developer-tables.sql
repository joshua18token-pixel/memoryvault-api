-- Developer API usage tracking
create table api_usage (
  id uuid default gen_random_uuid() primary key,
  project_id text not null,
  endpoint text not null,
  method text not null,
  status_code int default 200,
  tokens_used int default 0,
  cost numeric default 0,
  created_at timestamptz default now()
);

-- Link API keys to user profiles (so users can manage their own keys)
alter table api_keys add column if not exists user_id uuid references profiles(id);
alter table api_keys add column if not exists is_active boolean default true;
alter table api_keys add column if not exists last_used_at timestamptz;
alter table api_keys add column if not exists usage_count int default 0;

create index idx_api_usage_project on api_usage(project_id);
create index idx_api_usage_created on api_usage(created_at);
create index idx_api_keys_user on api_keys(user_id);
