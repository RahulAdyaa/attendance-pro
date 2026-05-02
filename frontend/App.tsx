import React, { useEffect } from 'react';
import './src/i18n';
import { StatusBar, Platform, LogBox, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './src/store/useAuthStore';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppTheme } from './src/hooks/useAppTheme';

// Suppress all LogBox warnings/errors in production builds
LogBox.ignoreAllLogs(true);

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class ErrorBoundary extends React.Component<any, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('FATAL CRASH CAUGHT:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'red' }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>App Crashed</Text>
          <Text style={{ color: 'white', textAlign: 'center' }}>{this.state.error?.message}</Text>
          <Text style={{ color: 'white', textAlign: 'center', marginTop: 10, fontSize: 10 }}>{this.state.error?.stack}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { isDarkMode, colors } = useAppTheme();

  useEffect(() => {
    setupNotificationsOnce();
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
      console.log('Notification setup skipped:', error);
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />
        <AppNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
