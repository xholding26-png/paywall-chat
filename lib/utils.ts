export function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export function formatAvgResponseTime(totalSeconds: number, totalReplied: number): string {
  if (totalReplied === 0) return 'N/A'
  const avg = totalSeconds / totalReplied
  if (avg < 60) return `${Math.round(avg)}s`
  if (avg < 3600) return `${Math.round(avg / 60)}m`
  if (avg < 86400) return `${Math.round(avg / 3600)}h`
  return `${Math.round(avg / 86400)}d`
}

export function getReplyRate(received: number, replied: number): string {
  if (received === 0) return 'N/A'
  return `${Math.round((replied / received) * 100)}%`
}

export function getTimeRemaining(expiresAt: string): string {
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hours}h ${mins}m left`
}
