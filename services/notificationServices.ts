import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = '@weight_tracking_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:mm"
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

export const scheduleDailyNotification = async (time: string): Promise<string> => {
  const [hours, minutes] = time.split(':').map(Number);
  
  const trigger = {
    hour: hours,
    minute: minutes,
    repeats: true,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to Track Your Weight!",
      body: "Don't forget to log your weight for today.",
      sound: true,
    },
    trigger,
  });

  // Save notification settings
  const settings: NotificationSettings = {
    enabled: true,
    time,
  };
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));

  return notificationId;
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  
  // Update notification settings
  const settings: NotificationSettings = {
    enabled: false,
    time: '',
  };
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const settings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  return settings ? JSON.parse(settings) : { enabled: false, time: '' };
}; 