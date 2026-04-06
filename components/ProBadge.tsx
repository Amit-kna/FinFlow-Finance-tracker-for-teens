interface ProBadgeProps {
  size?: 'sm' | 'md'
  className?: string
}

export default function ProBadge({ size = 'sm', className = '' }: ProBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-400 font-black uppercase tracking-wider rounded-full ${sizeClasses} ${className}`}>
      <span className="text-[8px]">👑</span>
      Pro
    </span>
  )
}
