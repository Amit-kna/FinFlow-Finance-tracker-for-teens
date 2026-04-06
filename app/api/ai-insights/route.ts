import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { aiInsightsQuerySchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  // Rate Limiting: 15 requests per minute
  const rateLimitCheck = rateLimit(15, 60000);
  const rateLimitResponse = await rateLimitCheck(request as any);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Strict Input Validation
    const validation = aiInsightsQuerySchema.safeParse(userId);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const validatedUserId = validation.data;

    // Fetch user's recent transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('type, amount, category')
      .eq('user_id', validatedUserId)
      .order('date', { ascending: false })
      .limit(50);

    if (txError) throw txError;

    const MODAL_URL = process.env.MODAL_AI_INSIGHTS_URL; 
    
    if (MODAL_URL) {
      const response = await fetch(MODAL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions })
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // Fallback Logic if Modal is unavailable
    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        insights: [
          "You don't have enough transactions yet.",
          "Try logging an expense!",
          "Keep building that streak."
        ]
      });
    }

    const expenses = transactions.filter(t => t.type === 'expense');
    const insights = [];

    if (expenses.length > 0) {
      const categoriesCount: Record<string, number> = {};
      expenses.forEach(e => {
         categoriesCount[e.category] = (categoriesCount[e.category] || 0) + 1;
      });
      const topCategory = Object.keys(categoriesCount).reduce((a, b) => categoriesCount[a] > categoriesCount[b] ? a : b);
      insights.push(`You spend the most frequently on ${topCategory}.`);
    } else {
      insights.push("Great job keeping expenses at 0 recently!");
    }

    insights.push("Consistent saving is the key to building wealth.");
    insights.push("Check the 'Safe to Spend' meter before big purchases.");

    return NextResponse.json({ insights });

  } catch (error) {
    console.error('Error generating AI Insights:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
