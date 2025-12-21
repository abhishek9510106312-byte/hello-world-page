import { useState, useEffect } from 'react';
import { Bell, Check, ShoppingCart, X, Building2, Package, Paintbrush, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  order_id: string | null;
  is_read: boolean;
  created_at: string;
}

const notificationConfig: Record<string, { icon: typeof Bell; gradient: string; iconColor: string }> = {
  order: { 
    icon: ShoppingCart, 
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-600'
  },
  corporate: { 
    icon: Building2, 
    gradient: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-600'
  },
  custom_order: { 
    icon: Paintbrush, 
    gradient: 'from-purple-500/20 to-purple-600/10',
    iconColor: 'text-purple-600'
  },
  workshop: { 
    icon: Calendar, 
    gradient: 'from-orange-500/20 to-orange-600/10',
    iconColor: 'text-orange-600'
  },
  default: { 
    icon: Bell, 
    gradient: 'from-primary/20 to-primary/10',
    iconColor: 'text-primary'
  },
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
        },
        (payload) => {
          console.log('New notification:', payload);
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    setNotifications(data || []);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .in('id', unreadIds);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const getNotificationConfig = (type: string) => {
    return notificationConfig[type] || notificationConfig.default;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group">
          <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs flex items-center justify-center font-semibold shadow-lg shadow-red-500/30"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0 shadow-2xl border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-muted/50 to-background">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-primary h-8"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[420px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="p-4 bg-muted/50 rounded-full mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No notifications yet</p>
              <p className="text-muted-foreground/70 text-xs mt-1">You'll see updates here</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification, index) => {
                const config = getNotificationConfig(notification.type);
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group relative px-5 py-4 hover:bg-muted/30 transition-all duration-200 ${
                      !notification.is_read ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''
                    }`}
                  >
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                    
                    <div className="flex gap-3.5">
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${config.gradient}`}>
                        <Icon className={`h-4 w-4 ${config.iconColor}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="flex-shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2.5">
                          <span className="text-xs text-muted-foreground/70">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs h-7 px-2.5 text-primary hover:text-primary hover:bg-primary/10"
                            >
                              Mark read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}