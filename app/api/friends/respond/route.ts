import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error: Admin account not setup' }, { status: 500 });
    }

    const body = await request.json();
    const { friendshipId, action } = body; // action is 'accept' or 'decline'

    if (!friendshipId || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Valid friendship ID and action required' }, { status: 400 });
    }

    // Verify the friendship belongs to the user and is pending
    const { data: friendship, error: fetchError } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .single();

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    if (friendship.receiver_id !== user.id) {
      return NextResponse.json({ error: 'You are not the receiver of this request' }, { status: 403 });
    }

    if (action === 'accept') {
      const { error: updateError } = await supabaseAdmin
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (updateError) {
        throw updateError;
      }
      return NextResponse.json({ success: true, status: 'accepted' });
    } else {
      const { error: deleteError } = await supabaseAdmin
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (deleteError) {
        throw deleteError;
      }
      return NextResponse.json({ success: true, status: 'declined' });
    }
  } catch (error: any) {
    console.error('Friends respond error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
