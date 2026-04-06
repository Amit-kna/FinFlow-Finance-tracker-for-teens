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
    const { receiverId } = body;

    if (!receiverId) {
      return NextResponse.json({ error: 'Valid Receiver ID required' }, { status: 400 });
    }

    // Check if friendship already exists
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .or(`and(requester_id.eq.${user.id},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${user.id})`)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Friendship or request already exists' }, { status: 400 });
    }

    // Use supabaseAdmin to bypass RLS and create friendship request
    const { data: newRequest, error } = await supabaseAdmin
      .from('friendships')
      .insert({
        requester_id: user.id,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ request: newRequest });
  } catch (error: any) {
    console.error('Friends request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
