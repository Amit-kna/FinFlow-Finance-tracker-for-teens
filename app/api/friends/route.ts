import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error: Admin account not setup' }, { status: 500 });
    }

    // Get all friendships for the user
    // We use supabaseAdmin to bypass RLS since users cannot read other users' row details normally.
    const { data: friendships, error } = await supabaseAdmin
      .from('friendships')
      .select(`
        id,
        status,
        requester:users!requester_id(id, name, money_score, streak, email, total_xp),
        receiver:users!receiver_id(id, name, money_score, streak, email, total_xp)
      `)
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (error) {
      throw error;
    }

    const friendsList = friendships?.map(f => {
      const isRequester = (f as any).requester?.id === user.id;
      const friendData = isRequester ? (f as any).receiver : (f as any).requester;
      const isPendingForMe = !isRequester && f.status === 'pending';
      const isPendingFromMe = isRequester && f.status === 'pending';

      return {
        id: f.id,
        status: f.status,
        friendId: friendData?.id,
        name: friendData?.name,
        email: friendData?.email,
        money_score: friendData?.money_score,
        streak: friendData?.streak,
        total_xp: friendData?.total_xp,
        isPendingForMe,
        isPendingFromMe
      };
    }) || [];

    return NextResponse.json({ friends: friendsList });
  } catch (error: any) {
    console.error('Friends fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
