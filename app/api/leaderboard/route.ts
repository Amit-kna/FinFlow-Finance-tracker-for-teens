import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  // Rate Limiting: 10 requests per minute
  const rateLimitCheck = rateLimit(10, 60000);
  const rateLimitResponse = await rateLimitCheck(request as any);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // Fetch top 10 users by money_score
    const { data: leaderboard, error } = await supabase
      .from('users')
      .select('id, name, money_score, streak')
      .order('money_score', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
