import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const NotificationManager = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Set up check-in reminder
    const checkReminder = () => {
      const now = new Date();
      const day = now.getDay();

      // Skip weekends (Saturday=6, Sunday=0)
      if (day === 0 || day === 6) return;

      const hour = now.getHours();
      const minute = now.getMinutes();

      // 8:45 AM reminder (15 min before 9 AM)
      if (hour === 8 && minute === 45) {
        sendNotification(
          '⏰ Check-in Reminder',
          'Office starts in 15 minutes. Don\'t forget to check in!'
        );
      }

      // 8:55 AM urgent reminder
      if (hour === 8 && minute === 55) {
        sendNotification(
          '🔴 Check-in Now!',
          'Only 5 minutes left before office time!'
        );
      }
    };

    const sendNotification = (title, body) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200],
          tag: 'checkin-reminder',
          renotify: true
        });
      }
    };

    // Check every minute
    const interval = setInterval(checkReminder, 60000);

    // Initial check
    checkReminder();

    return () => clearInterval(interval);
  }, [user]);

  return null;
};

export default NotificationManager;