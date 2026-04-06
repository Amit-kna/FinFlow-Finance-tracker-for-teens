import { supabase } from './supabase'

export async function sendFriendRequest(requesterId: string, receiverIdentifier: string) {
  const { data: receiver } = await supabase
    .from('users')
    .select('id')
    .or(`email.eq.${receiverIdentifier},name.eq.${receiverIdentifier}`)
    .single()

  if (!receiver || receiver.id === requesterId) return { error: 'User not found' }

  const { error } = await supabase
    .from('friendships')
    .insert({ requester_id: requesterId, receiver_id: receiver.id, status: 'pending' })

  if (error) return { error: error.message }
  return { success: true }
}

export async function acceptFriendRequest(friendshipId: string) {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function getFriends(userId: string) {
  const { data } = await supabase
    .from('friendships')
    .select(`
      id, status,
      requester:users!requester_id(id, name, money_score, streak),
      receiver:users!receiver_id(id, name, money_score, streak)
    `)
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

  if (!data) return []

  return data.map(f => {
    const friend = (f as any).requester_id === userId ? (f as any).receiver[0] : (f as any).requester[0]
    return { id: friend?.id, name: friend?.name, money_score: friend?.money_score, streak: friend?.streak }
  })
}

export async function challengeFriendToGoal(goalId: string, friendId: string) {
  const { error } = await supabase
    .from('friend_goals')
    .insert({ goal_id: goalId, friend_id: friendId })
  if (error) return { error: error.message }
  return { success: true }
}
