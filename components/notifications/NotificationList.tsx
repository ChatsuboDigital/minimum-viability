'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { CheckCheck } from 'lucide-react'

export function NotificationList() {
  const { user } = useAuth()
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } =
    useNotifications(user?.id)

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading notifications...
      </div>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No notifications yet
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead()}
            className="h-auto p-1 text-xs"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications */}
      <div className="divide-y">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
              !notification.read ? 'bg-blue-50' : ''
            }`}
            onClick={() => !notification.read && markAsRead(notification.id)}
          >
            <p className="text-sm font-medium">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
