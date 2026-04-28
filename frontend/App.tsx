import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './src/store/useAuthStore';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppTheme } from './src/hooks/useAppTheme';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const { isDarkMode, colors } = useAppTheme();

  useEffect(() => {
    const prepare = async () => {
      try {
        await setupNotificationsOnce();
      } catch (e) {
        console.warn(e);
      }
    };
    prepare();
  }, []);

  const setupNotificationsOnce = async () => {
    try {
      const alreadyScheduled = await AsyncStorage.getItem('notif_set');
      if (alreadyScheduled) return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
        });
      }

      // Schedule daily 8 AM reminder
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Attendance Reminder ⏰",
          body: "Please Mark The Attendance😅",
          sound: 'default',
        },
        trigger: {
          hour: 8,
          minute: 0,
          repeats: true,
        } as any,
      });

      await AsyncStorage.setItem('notif_set', 'true');
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
