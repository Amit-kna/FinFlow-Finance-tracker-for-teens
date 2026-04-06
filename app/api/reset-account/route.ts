import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitCheck = rateLimit(5, 60000);
  const rateLimitResponse = await rateLimitCheck(request as any);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    if (!supabaseAdmin) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, is_pro, total_xp, streak_freeze_count')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Preserve Pro-related fields
    const preserveTotalXp = user.total_xp || 0;
    const preserveFreezeCount = user.streak_freeze_count || 0;

    // 1. Reset User Profile Stats (preserve Pro fields)
    const { error: userError2 } = await supabaseAdmin
      .from('users')
      .update({
        money_score: 0,
        streak: 0,
        last_log_date: null,
        // DO NOT reset: is_pro, total_xp, streak_freeze_count
      })
      .eq('id', userId);

    if (userError2) throw userError2;

    // 2. Delete Transactions
    const { error: transError } = await supabaseAdmin
      .from('transactions')
      .delete()
      .eq('user_id', userId);
      
    if (transError) throw transError;

    // 3. Delete Goals
    const { error: goalsError } = await supabaseAdmin
      .from('goals')
      .delete()
      .eq('user_id', userId);

    if (goalsError) throw goalsError;

    // 4. Delete Lesson Progress
    const { error: lessonError } = await supabaseAdmin
      .from('lesson_progress')
      .delete()
      .eq('user_id', userId);

    if (lessonError) throw lessonError;

    // 5. Delete Notifications
    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (notifError) throw notifError;

    // 6. DO NOT delete subscriptions - preserve Pro status

    return NextResponse.json({ 
      success: true, 
      message: 'Account reset successfully',
      preservedPro: user.is_pro,
      preservedXp: preserveTotalXp
    });
  } catch (error) {
    console.error('Error resetting account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
