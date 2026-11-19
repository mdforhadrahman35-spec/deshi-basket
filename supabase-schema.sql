-- Run in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 description text,
 price numeric(12,2) not null check(price>=0),
 image_url text,
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 customer_name text not null,
 phone text not null,
 address text not null,
 items jsonb not null,
 subtotal numeric(12,2) not null,
 shipping numeric(12,2) not null default 0,
 total numeric(12,2) not null,
 payment_method text not null,
 payment_status text not null default 'initiated',
 transaction_id text,
 status text not null default 'pending',
 created_at timestamptz not null default now()
);
alter table public.products enable row level security;
alter table public.orders enable row level security;
create policy "Public can view active products" on public.products for select using(active=true);
create policy "Authenticated admin manages products" on public.products for all to authenticated using(true) with check(true);
-- Orders are created and read by the server using the service-role key; do not expose that key in the browser.
create policy "Authenticated admin reads orders" on public.orders for select to authenticated using(true);
create policy "Authenticated admin updates orders" on public.orders for update to authenticated using(true) with check(true);
-- Create a Storage bucket named products and set it to Public in Supabase Storage.
-- For production, restrict product bucket uploads to authenticated admin users.
