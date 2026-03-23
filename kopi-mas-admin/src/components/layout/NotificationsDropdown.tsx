"use client";

import { Bell, FileText, CheckSquare, Banknote, AlertTriangle, Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useNotificationsQuery, 
  useUnreadCountQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation 
} from "@/hooks/use-notifications";

const typeIcons: Record<string, any> = {
  application: FileText,
  approval: CheckSquare,
  disbursement: Banknote,
  payment: Banknote,
  overdue: AlertTriangle,
  system: Settings,
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMs / 3600000);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffMs / 86400000);
  return `${diffDays}d ago`;
};


export function NotificationsDropdown() {
  const { data: notifications } = useNotificationsQuery(10);
  const { data: unreadCount } = useUnreadCountQuery();
  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    const promise = markAllAsReadMutation.mutateAsync();
    toast.promise(promise, {
      loading: "Marking all as read...",
      success: "All notifications marked as read.",
      error: "Failed to mark all as read.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount && unreadCount.count > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="font-normal">Notifications</DropdownMenuLabel>
          {unreadCount && unreadCount.count > 0 && (
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-xs text-primary"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification: any) => {
              const IconComponent = typeIcons[notification.notificationType] || Bell;
              return (
                <DropdownMenuItem key={notification.notification_id} className="flex items-start gap-3 p-3 cursor-pointer">
                  <div className={`mt-0.5 p-1.5 rounded-full ${notification.isRead ? 'bg-muted' : 'bg-primary/10'}`}>
                    <IconComponent className={`h-3.5 w-3.5 ${notification.isRead ? 'text-muted-foreground' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''} truncate`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">{getTimeAgo(notification.createdAt)}</span>
                      {!notification.isRead && (
                        <button
                          className="text-xs text-primary hover:underline"
                          onClick={(e) => handleMarkAsRead(notification.notification_id, e)}
                          disabled={markAsReadMutation.isPending}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">You're all caught up!</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}