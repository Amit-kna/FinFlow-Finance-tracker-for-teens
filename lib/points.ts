import { supabase } from "./supabase";

export async function awardPoints(userId: string, points: number): Promise<{ success: boolean, message?: string, bonusAwarded?: boolean }> {
  if (!userId) return { success: false, message: "No user ID" };
  
  try {
    // 1. Get current score
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('money_score')
      .eq('id', userId)
      .single();
      
    if (userErr || !user) return { success: false, message: "User not found" };
    const currentScore = user.money_score || 0;
    
    // 2. Get old rank (number of users strictly greater than current score)
    const { count: oldUsersAhead } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('money_score', currentScore);
      
    const oldRank = (oldUsersAhead || 0) + 1;
    
    // 3. Update score
    const newScore = currentScore + points;
    const { error: updateErr } = await supabase
      .from('users')
      .update({ money_score: newScore })
      .eq('id', userId);
      
    if (updateErr) return { success: false, message: "Update failed" };
    
    // 4. Get new rank
    const { count: newUsersAhead } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('money_score', newScore);
      
    const newRank = (newUsersAhead || 0) + 1;
    
    // 5. Check if we passed someone
    if (newRank < oldRank) {
       // Passed someone! Award bonus
       const finalScore = newScore + 50; 
       await supabase.from('users').update({ money_score: finalScore }).eq('id', userId);
       return { success: true, bonusAwarded: true, message: `Rank UP! #${newRank} (+50 Bonus Points)` };
    }
    
    return { success: true, bonusAwarded: false };
  } catch(e) {
    return { success: false, message: "Unexpected error" };
  }
}
