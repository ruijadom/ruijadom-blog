import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'

interface CalloutProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  children: React.ReactNode
  className?: string
}

export function Callout({
  type = 'info',
  children,
  className,
}: CalloutProps) {
  const styles = {
    info: {
      container: 'border-blue-500/50 bg-blue-500/10',
      icon: 'text-blue-500',
      IconComponent: Info,
    },
    success: {
      container: 'border-green-500/50 bg-green-500/10',
      icon: 'text-green-500',
      IconComponent: CheckCircle2,
    },
    warning: {
      container: 'border-yellow-500/50 bg-yellow-500/10',
      icon: 'text-yellow-500',
      IconComponent: AlertCircle,
    },
    error: {
      container: 'border-red-500/50 bg-red-500/10',
      icon: 'text-red-500',
      IconComponent: XCircle,
    },
  }

  const { container, icon, IconComponent } = styles[type]

  return (
    <div
      className={cn(
        'my-6 flex gap-3 rounded-lg border p-4',
        container,
        className,
      )}
    >
      <IconComponent className={cn('size-5 shrink-0 mt-0.5', icon)} />
      <div className="flex-1 space-y-3 text-sm leading-relaxed [&>p]:mt-0">
        {children}
      </div>
    </div>
  )
}
