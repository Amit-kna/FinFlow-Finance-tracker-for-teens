import { supabase } from './supabase'

export async function updateStreak(userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data: user } = await supabase
    .from('users')
    .select('streak, last_log_date, is_pro, streak_freeze_count, money_score, total_xp')
    .eq('id', userId)
    .single()

  if (!user) return { streak: 0, bonusPoints: 0 }

  const lastLog = user.last_log_date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak = user.streak || 0
  let bonusPoints = 0

  if (lastLog === today) {
    // Already logged today, no change
    return { streak: newStreak, bonusPoints: 0 }
  } else if (lastLog === yesterdayStr) {
    // Consecutive day - increment streak
    newStreak = (user.streak || 0) + 1
    bonusPoints = 5
  } else {
    // Gap detected
    if (user.is_pro && user.streak_freeze_count > 0) {
      // Use freeze to maintain streak
      const monthYear = today.substring(0, 7)
      await supabase.from('streak_freezes').insert({
        user_id: userId,
        used_at: today,
        month_year: monthYear
      })
      await supabase.from('users')
        .update({ streak_freeze_count: user.streak_freeze_count - 1 })
        .eq('id', userId)
      newStreak = user.streak || 0
    } else {
      // Reset streak
      newStreak = 1
    }
  }

  // Milestone bonuses for Pro users
  if (user.is_pro) {
    if (newStreak === 7) bonusPoints += 20
    if (newStreak === 30) bonusPoints += 50
    if (newStreak === 100) bonusPoints += 200
  }

  // Update user
  await supabase.from('users').update({
    streak: newStreak,
    last_log_date: today,
    money_score: (user.money_score || 0) + bonusPoints,
    total_xp: (user.total_xp || 0) + bonusPoints
  }).eq('id', userId)

  // Log points if bonus awarded
  if (bonusPoints > 0) {
    await supabase.from('points_log').insert({
      user_id: userId,
      action: 'streak_bonus',
      points: bonusPoints,
      metadata: { streak_day: newStreak }
    })
  }

  return { streak: newStreak, bonusPoints }
}
