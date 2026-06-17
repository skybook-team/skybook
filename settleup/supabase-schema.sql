-- Enable RLS
-- profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- groups
create table groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- group members
create table group_members (
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- expenses
create table expenses (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  description text not null,
  amount numeric(10,2) not null,
  paid_by uuid references profiles(id) not null,
  split_type text check (split_type in ('equal', 'percentage', 'exact')) default 'equal',
  is_recurring boolean default false,
  recurrence_interval text check (recurrence_interval in ('weekly', 'monthly')),
  receipt_url text,
  created_at timestamptz default now()
);

-- expense splits
create table expense_splits (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references expenses(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  amount numeric(10,2) not null,
  is_settled boolean default false,
  settled_at timestamptz
);

-- settlements
create table settlements (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  paid_by uuid references profiles(id) not null,
  paid_to uuid references profiles(id) not null,
  amount numeric(10,2) not null,
  created_at timestamptz default now()
);

-- RLS policies
alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table expenses enable row level security;
alter table expense_splits enable row level security;
alter table settlements enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Group members can view group" on groups for select using (
  exists (select 1 from group_members where group_id = id and user_id = auth.uid())
);
create policy "Authenticated users can create groups" on groups for insert with check (auth.uid() = created_by);

create policy "Members can view group_members" on group_members for select using (
  exists (select 1 from group_members gm where gm.group_id = group_id and gm.user_id = auth.uid())
);
create policy "Group creator can add members" on group_members for insert with check (auth.uid() = user_id);

create policy "Group members can view expenses" on expenses for select using (
  exists (select 1 from group_members where group_id = expenses.group_id and user_id = auth.uid())
);
create policy "Group members can add expenses" on expenses for insert with check (
  exists (select 1 from group_members where group_id = expenses.group_id and user_id = auth.uid())
);

create policy "Users can view their splits" on expense_splits for select using (
  user_id = auth.uid() or exists (
    select 1 from expenses e join group_members gm on gm.group_id = e.group_id
    where e.id = expense_id and gm.user_id = auth.uid()
  )
);
create policy "Group members can add splits" on expense_splits for insert with check (true);
create policy "Users can settle their splits" on expense_splits for update using (user_id = auth.uid());

create policy "Group members can view settlements" on settlements for select using (
  exists (select 1 from group_members where group_id = settlements.group_id and user_id = auth.uid())
);
create policy "Users can create settlements" on settlements for insert with check (auth.uid() = paid_by);

-- trigger to create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
