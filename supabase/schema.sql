-- Paywall.chat Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text default '',
  dm_price numeric(10,2) default 5.00 not null check (dm_price >= 0.1 and dm_price <= 50),
  points_balance numeric(12,2) default 100.00 not null,
  total_earned numeric(12,2) default 0.00 not null,
  total_messages_received integer default 0 not null,
  total_messages_replied integer default 0 not null,
  total_response_time_seconds bigint default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  price_paid numeric(10,2) not null,
  status text default 'pending' not null check (status in ('pending', 'replied', 'refunded', 'expired')),
  reply_content text,
  replied_at timestamptz,
  refunded_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz default now() not null
);

-- Transactions table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('send_dm', 'receive_dm', 'refund_sender', 'refund_expire', 'signup_bonus')),
  amount numeric(10,2) not null,
  message_id uuid references public.messages(id) on delete set null,
  description text,
  created_at timestamptz default now() not null
);

-- Indexes
create index idx_messages_receiver on public.messages(receiver_id, created_at desc);
create index idx_messages_sender on public.messages(sender_id, created_at desc);
create index idx_messages_status on public.messages(status, expires_at);
create index idx_transactions_user on public.transactions(user_id, created_at desc);
create index idx_profiles_username on public.profiles(username);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.transactions enable row level security;

-- Profiles: anyone can read, only owner can update
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Messages: sender and receiver can read their own
create policy "Users can view their messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Authenticated users can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

create policy "Receiver can update message status" on public.messages
  for update using (auth.uid() = receiver_id);

-- Transactions: users can only see their own
create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

create policy "System can insert transactions" on public.transactions
  for insert with check (auth.uid() = user_id);

-- Function: handle new user signup → create profile with 100 points
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, points_balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    100.00
  );
  -- Record signup bonus transaction
  insert into public.transactions (user_id, type, amount, description)
  values (new.id, 'signup_bonus', 100.00, 'Welcome bonus - 100 free points');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function: send DM (atomic transaction)
create or replace function public.send_dm(
  p_receiver_id uuid,
  p_content text
) returns uuid as $$
declare
  v_price numeric(10,2);
  v_sender_balance numeric(12,2);
  v_message_id uuid;
begin
  -- Get receiver's price
  select dm_price into v_price from public.profiles where id = p_receiver_id;
  if v_price is null then
    raise exception 'Receiver not found';
  end if;

  -- Check sender balance
  select points_balance into v_sender_balance from public.profiles where id = auth.uid();
  if v_sender_balance < v_price then
    raise exception 'Insufficient points balance';
  end if;

  -- Cannot DM yourself
  if auth.uid() = p_receiver_id then
    raise exception 'Cannot send DM to yourself';
  end if;

  -- Deduct from sender
  update public.profiles set points_balance = points_balance - v_price, updated_at = now()
  where id = auth.uid();

  -- Create message (expires in 24h)
  insert into public.messages (sender_id, receiver_id, content, price_paid, expires_at)
  values (auth.uid(), p_receiver_id, p_content, v_price, now() + interval '24 hours')
  returning id into v_message_id;

  -- Record sender transaction
  insert into public.transactions (user_id, type, amount, message_id, description)
  values (auth.uid(), 'send_dm', -v_price, v_message_id, 'Sent DM');

  -- Increment receiver message count
  update public.profiles set total_messages_received = total_messages_received + 1, updated_at = now()
  where id = p_receiver_id;

  return v_message_id;
end;
$$ language plpgsql security definer;

-- Function: reply to DM (50% to receiver, 50% refund to sender)
create or replace function public.reply_to_dm(
  p_message_id uuid,
  p_reply_content text
) returns void as $$
declare
  v_message public.messages;
  v_half_price numeric(10,2);
begin
  select * into v_message from public.messages where id = p_message_id and receiver_id = auth.uid();
  if v_message is null then
    raise exception 'Message not found';
  end if;
  if v_message.status != 'pending' then
    raise exception 'Message already processed';
  end if;

  v_half_price := round(v_message.price_paid / 2, 2);

  -- Update message
  update public.messages set
    status = 'replied',
    reply_content = p_reply_content,
    replied_at = now()
  where id = p_message_id;

  -- Credit receiver (50%)
  update public.profiles set
    points_balance = points_balance + v_half_price,
    total_earned = total_earned + v_half_price,
    total_messages_replied = total_messages_replied + 1,
    total_response_time_seconds = total_response_time_seconds + extract(epoch from (now() - v_message.created_at))::bigint,
    updated_at = now()
  where id = auth.uid();

  -- Refund sender (50%)
  update public.profiles set
    points_balance = points_balance + v_half_price,
    updated_at = now()
  where id = v_message.sender_id;

  -- Record transactions
  insert into public.transactions (user_id, type, amount, message_id, description)
  values (auth.uid(), 'receive_dm', v_half_price, p_message_id, 'Earned from reply (50%)');

  insert into public.transactions (user_id, type, amount, message_id, description)
  values (v_message.sender_id, 'refund_sender', v_half_price, p_message_id, 'Refund from reply (50%)');
end;
$$ language plpgsql security definer;

-- Function: process expired messages (run via cron or edge function)
create or replace function public.process_expired_messages()
returns integer as $$
declare
  v_count integer := 0;
  v_msg record;
begin
  for v_msg in
    select * from public.messages
    where status = 'pending' and expires_at < now()
  loop
    -- Full refund to sender
    update public.profiles set
      points_balance = points_balance + v_msg.price_paid,
      updated_at = now()
    where id = v_msg.sender_id;

    -- Mark as expired
    update public.messages set status = 'expired', refunded_at = now()
    where id = v_msg.id;

    -- Record transaction
    insert into public.transactions (user_id, type, amount, message_id, description)
    values (v_msg.sender_id, 'refund_expire', v_msg.price_paid, v_msg.id, 'Auto-refund: no reply in 24h');

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$ language plpgsql security definer;
