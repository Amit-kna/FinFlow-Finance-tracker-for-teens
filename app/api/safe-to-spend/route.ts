import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { safeToSpendQuerySchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  // Rate Limiting: 20 requests per minute
  const rateLimitCheck = rateLimit(20, 60000);
  const rateLimitResponse = await rateLimitCheck(request as any);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Strict Input Validation
    const validation = safeToSpendQuerySchema.safeParse(userId);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const validatedUserId = validation.data;

    // Fetch this month's transactions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', validatedUserId)
      .gte('date', startOfMonth.toISOString());

    if (txError) throw txError;

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Fetch goals
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('target_amount, current_amount')
      .eq('user_id', validatedUserId)
      .eq('completed', false);

    if (goalsError) throw goalsError;

    // Calculate remaining required for goals
    const remainingGoals = goals.reduce((sum, g) => sum + (g.target_amount - g.current_amount), 0);

    // Calculate balance (income - expenses)
    const balance = totalIncome - totalExpense;
    
    // Safe to spend = 50% of balance after accounting for goals
    const safeToSpend = Math.max(0, (balance * 0.5) - remainingGoals);

    return NextResponse.json({
      safe_to_spend: safeToSpend,
      total_income: totalIncome,
      total_expense: totalExpense,
      remaining_goals_target: remainingGoals
    });

  } catch (error) {
    console.error('Error calculating safe to spend:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
