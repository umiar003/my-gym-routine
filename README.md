## My Gym Routine

Personal 7-day routine tracker built with **Next.js 16**, **Supabase Auth** and a mobile-first blue-glass UI powered by **Tailwind CSS**. Each authenticated user cycles through seven focused days, checks off daily tasks, and rolls into the next cycle with a celebratory modal.

### Features

- Supabase email/password authentication with protected dashboard routing.
- Auto-seeded 7-day routine with curated task lists for each day.
- Real-time optimistic updates while Supabase syncs in the background.
- Cycle completion modal with one-tap reset into a fresh 7-day run.
- Smooth micro-interactions, animated progress, and fully responsive layout.

### Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create `.env.local` in the project root:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

### Supabase Setup

Run these SQL snippets in your Supabase project to create the required tables and RLS policies:

```sql
create table public.cycles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sequence_number integer not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.days (
  id uuid primary key default uuid_generate_v4(),
  cycle_id uuid not null references public.cycles(id) on delete cascade,
  day_index integer not null check (day_index between 1 and 7),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  day_id uuid not null references public.days(id) on delete cascade,
  title text not null,
  description text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  position integer generated always as identity
);

alter table public.cycles enable row level security;
alter table public.days enable row level security;
alter table public.tasks enable row level security;

create policy "cycles owner access"
on public.cycles
for all using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "days owner access"
on public.days
for all using (
  exists (
    select 1 from public.cycles c
    where c.id = cycle_id and c.user_id = auth.uid()
  )
)
with check (auth.uid() is not null);

create policy "tasks owner access"
on public.tasks
for all using (
  exists (
    select 1
    from public.days d
    join public.cycles c on c.id = d.cycle_id
    where d.id = day_id and c.user_id = auth.uid()
  )
)
with check (auth.uid() is not null);
```

### Scripts

- `npm run dev` – start the local dev server.
- `npm run build` – create an optimized production build.
- `npm run start` – run the compiled app.
- `npm run lint` – run ESLint checks.

### Deployment

Deploy to [Vercel](https://vercel.com) or any platform that supports Next.js. Remember to set the Supabase environment variables in your hosting provider.
