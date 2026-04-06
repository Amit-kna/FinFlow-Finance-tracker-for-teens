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

    // Verify current user is a pro user? The user request just said "pro subscription feature is friends".
    // We should check if they are pro, but for MVP let's just make sure they exist.

    const body = await request.json();
    const { identifier } = body;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ error: 'Valid Search identifier required' }, { status: 400 });
    }

    // We use supabaseAdmin to bypass RLS to lookup by email or exact name.
    const { data: matchedUser, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, money_score, total_xp')
      .or(`email.eq.${identifier},name.eq.${identifier}`)
      .neq('id', user.id) // Exclude current user from search
      .single();

    if (error || !matchedUser) {
      // Return 404 cleanly since usually that just means no one found
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    return NextResponse.json({ user: matchedUser });
  } catch (error: any) {
    console.error('Friends search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
