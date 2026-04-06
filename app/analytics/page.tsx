'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ProGate from '@/components/ProGate'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ReferenceLine
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useCurrency } from '@/components/CurrencyProvider'

const COLORS = ['#00C896', '#B388FF', '#FF6B6B', '#60A5FA', '#FBBF24', '#F472B6']

function AnalyticsContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { currency, convert } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [stats, setStats] = useState({ avgIncome: 0, avgSpend: 0, savingsRate: 0, bestMonth: 0 })
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<{ name: string; value: number; isHighest?: boolean }[]>([])

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const fetch = async () => {
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)

      if (txData) {
        setTransactions(txData)
        setGoals(goalsData || [])

        const now = new Date()
        const monthlyMap: Record<string, { income: number; expense: number }> = {}
        const categoryMap: Record<string, number> = {}
        const weeklyMap: Record<string, number> = {}

        txData.forEach(tx => {
          const d = new Date(tx.date)
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expense: 0 }
          if (tx.type === 'income') monthlyMap[monthKey].income += Number(tx.amount)
          else {
            monthlyMap[monthKey].expense += Number(tx.amount)
            categoryMap[tx.category] = (categoryMap[tx.category] || 0) + Number(tx.amount)
          }

          const weekNum = Math.floor(d.getDate() / 7)
          const weekKey = `Week ${Math.min(weekNum + 1, 4)}`
          if (tx.type === 'expense') weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + Number(tx.amount)
        })

        const last6Months = Object.entries(monthlyMap).slice(-6).map(([month, data]) => ({
          month,
          income: data.income,
          expense: data.expense,
          savingsRate: data.income > 0 ? ((data.income - data.expense) / data.income * 100) : 0
        }))

        const catData = Object.entries(categoryMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, value]) => ({ name, value }))

        const weekData: { name: string; value: number; isHighest?: boolean }[] = Object.entries(weeklyMap).map(([name, value]) => ({ name, value }))
        const maxWeek = weekData.reduce((max, w) => w.value > max.value ? w : max, weekData[0] || { value: 0, name: '' })
        if (maxWeek) maxWeek.isHighest = true

        setMonthlyData(last6Months)
        setCategoryData(catData)
        setWeeklyData(weekData)

        const recent3 = last6Months.slice(-3)
        const avgIncome = recent3.length > 0 ? recent3.reduce((s, m) => s + m.income, 0) / recent3.length : 0
        const avgSpend = recent3.length > 0 ? recent3.reduce((s, m) => s + m.expense, 0) / recent3.length : 0
        const savingsRate = avgIncome > 0 ? ((avgIncome - avgSpend) / avgIncome * 100) : 0
        const bestMonth = last6Months.reduce((max, m) => {
          const surplus = m.income - m.expense
          return surplus > max ? surplus : max
        }, 0)

        setStats({ avgIncome, avgSpend, savingsRate, bestMonth })
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-4 pt-8 md:p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-white">Advanced Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Monthly Income', value: formatCurrency(convert(stats.avgIncome), currency), color: 'text-[#00C896]' },
          { label: 'Avg Monthly Spend', value: formatCurrency(convert(stats.avgSpend), currency), color: 'text-red-400' },
          { label: 'Avg Savings Rate', value: `${stats.savingsRate.toFixed(1)}%`, color: stats.savingsRate >= 20 ? 'text-[#00C896]' : 'text-yellow-400' },
          { label: 'Best Month Ever', value: formatCurrency(convert(stats.bestMonth), currency), color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">Income vs Expenses (6 months)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="month" stroke="#ffffff30" fontSize={10} />
                <YAxis stroke="#ffffff30" fontSize={10} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : `${v}`} />
                <Tooltip formatter={(value: any) => formatCurrency(convert(Number(value)), currency)} />
                <Bar dataKey="income" fill="#00C896" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#FF6B6B" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">Spending by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">Savings Rate (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="month" stroke="#ffffff30" fontSize={10} />
                <YAxis stroke="#ffffff30" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <ReferenceLine y={20} stroke="#00C896" strokeDasharray="3 3" label="20% target" />
                <Line type="monotone" dataKey="savingsRate" stroke={stats.savingsRate >= 20 ? '#00C896' : '#FBBF24'} strokeWidth={2} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">Income Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="month" stroke="#ffffff30" fontSize={10} />
                <YAxis stroke="#ffffff30" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <Area type="monotone" dataKey="income" stroke="#00C896" fill="rgba(0,200,150,0.2)" />
                <Tooltip />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-white font-bold mb-4">Spending Trends (Top Categories)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" stroke="#ffffff30" fontSize={10} />
              <YAxis stroke="#ffffff30" fontSize={10} tickFormatter={(v) => `$${v}`} />
              <Bar dataKey="value" fill="#B388FF" name="Total Spent" />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {goals.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">Goal Timeline Projector</h3>
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount * 100) : 0
              const monthlySavings = stats.avgIncome - stats.avgSpend
              const remaining = goal.target_amount - goal.current_amount
              const monthsToGoal = monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : Infinity
              const estimatedDate = monthsToGoal < Infinity ? new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000) : null

              return (
                <div key={goal.id} className="bg-black/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{goal.emoji}</span>
                    <span className="text-white font-bold">{goal.name}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#00C896] rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(convert(goal.current_amount), currency)} / {formatCurrency(convert(goal.target_amount), currency)} ({progress.toFixed(0)}%)
                  </p>
                  {monthlySavings > 0 && (
                    <p className="text-xs text-[#00C896] mt-1">
                      At {formatCurrency(convert(monthlySavings), currency)}/month, you'll reach this goal in ~{monthsToGoal} months
                      {estimatedDate && ` (estimated: ${estimatedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {weeklyData.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="text-white font-bold mb-4">Biggest Spending Weeks</h3>
          <div className="space-y-3">
            {weeklyData.map((week) => (
              <div key={week.name} className="flex items-center justify-between bg-black/20 rounded-xl p-3">
                <span className="text-white text-sm font-medium">{week.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{formatCurrency(convert(week.value), currency)} spent</span>
                  {(week as any).isHighest && <span className="text-red-400 text-xs">🔴 highest</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <ProGate>
      <AnalyticsContent />
    </ProGate>
  )
}
