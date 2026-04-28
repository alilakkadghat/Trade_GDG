-- ============================================================
-- Trade GDG — Document Intelligence Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable vector extension for RAG
create extension if not exists vector;

-- ── Transactions ─────────────────────────────────────────
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  reference_id text unique not null,
  product text,
  hs_code text,
  destination text,
  destination_country_code text,
  quantity text,
  value text,
  currency text default 'USD',
  incoterms text,
  status text default 'Active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Documents ────────────────────────────────────────────
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade,
  filename text not null,
  original_filename text not null,
  document_type text,
  status text default 'Uploaded',
  storage_path text,
  file_size_bytes bigint default 0,
  page_count int default 0,
  raw_text text default '',
  processing_time_seconds float,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Extracted Fields ─────────────────────────────────────
create table if not exists extracted_fields (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  field_name text not null,
  field_value text,
  confidence float default 0.0,
  page_number int,
  created_at timestamptz default now()
);

-- ── Document Chunks (RAG vector store) ───────────────────
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  chunk_text text not null,
  chunk_index int not null,
  embedding vector(768),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ── Validation Results ───────────────────────────────────
create table if not exists validation_results (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade,
  status text not null,
  field text not null,
  document_name text not null,
  expected_value text,
  extracted_value text,
  severity text default 'Info',
  suggestion text,
  created_at timestamptz default now()
);

-- ── Compliance Checks ────────────────────────────────────
create table if not exists compliance_checks (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade,
  check_type text not null,
  status text not null,
  description text,
  severity text default 'Info',
  resolution text,
  created_at timestamptz default now()
);

-- ── Vector similarity search function (for RAG) ──────────
create or replace function match_document_chunks(
  query_embedding vector(768),
  match_count int default 5,
  filter_transaction_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  chunk_text text,
  chunk_index int,
  metadata jsonb,
  similarity float
)
language plpgsql as $$
begin
  return query
  select
    dc.id,
    dc.document_id,
    dc.chunk_text,
    dc.chunk_index,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where (filter_transaction_id is null or d.transaction_id = filter_transaction_id)
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ── RLS Policies (permissive for MVP) ────────────────────
alter table transactions enable row level security;
alter table documents enable row level security;
alter table extracted_fields enable row level security;
alter table document_chunks enable row level security;
alter table validation_results enable row level security;
alter table compliance_checks enable row level security;

create policy "public_all" on transactions for all using (true) with check (true);
create policy "public_all" on documents for all using (true) with check (true);
create policy "public_all" on extracted_fields for all using (true) with check (true);
create policy "public_all" on document_chunks for all using (true) with check (true);
create policy "public_all" on validation_results for all using (true) with check (true);
create policy "public_all" on compliance_checks for all using (true) with check (true);

-- ── Seed a default transaction ───────────────────────────
insert into transactions (reference_id, product, hs_code, destination, destination_country_code, quantity, value)
values ('SHP-2024-001', 'Basmati Rice (Premium 1121)', '1006.30.20', 'Rotterdam, Netherlands', 'NL', '24 MT', '$48,200')
on conflict (reference_id) do nothing;
