# FinFlow — Teen Money Tracker

FinFlow is the money app built for teens, by a teen. It puts control of your personal finances directly into your hands. Log incomes, track expenses, set visual savings goals, and level up your financial literacy to grow your internal "Money Score".

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database / Auth:** Supabase
- **Charts:** Recharts
- **Icons:** Lucide React

## Local Setup Instructions

### 1. Extract and Install
All files for the project sit directly in this directory natively using Next.js.
If `node_modules` is not generated, run:
```bash
npm install
```

*(Note: dependencies like `clsx`, `tailwind-merge`, `@supabase/supabase-js`, `recharts`, and `lucide-react` are pre-defined in `package.json`.)*

### 2. Configure Supabase Environment Variables
Copy the `.env.example` file and create a new file named `.env.local` in the root of the project:
```bash
cp .env.example .env.local
```

You must update `.env.local` with your actual Supabase project URL and Anon Key.

### 3. Setup Supabase Database Schema
Inside your [Supabase Dashboard](https://supabase.com/dashboard/projects), go to the **SQL Editor**, and paste the contents of `supabase_schema.sql` found in the root directory.

This script will automatically:
- Create the tables (`users`, `transactions`, `goals`, `lesson_progress`)
- Setup Row Level Security (RLS) policies to ensure data privacy
- **Important Function:** Please run the following additional script snippet to create the `increment_score_and_streak` RPC function used for gamification:

```sql
CREATE OR REPLACE FUNCTION increment_score_and_streak(uid UUID, points INT) 
RETURNS void AS $$
BEGIN
  UPDATE users
  SET money_score = COALESCE(money_score, 0) + points,
      streak = CASE 
                 WHEN last_log_date = CURRENT_DATE THEN streak
                 WHEN last_log_date = CURRENT_DATE - INTERVAL '1 day' THEN streak + 1
                 ELSE 1
               END,
      last_log_date = CURRENT_DATE
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql;
```

### 4. Run the App Locally
Run the development server:
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000). The site is primarily designed for mobile screens, so viewing it constrained or on a device emulator provides the best experience.

## Deployment to Vercel
1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Ensure the **Framework Preset** is set to `Next.js`.
4. In the Environment Variables section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.

## UI Design
FinFlow heavily leans into aesthetic modern web principles leveraging a combination of #0A0C10 (Dark Navy/Black) alongside #00E676 (Bright Green accent). It relies purely on vectors (SVG through Lucide) and platform emojis instead of placeholder images.
