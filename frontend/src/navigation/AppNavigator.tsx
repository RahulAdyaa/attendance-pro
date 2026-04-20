import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme/colors';
import { LayoutDashboard, Users, History, FileText, UserCircle } from 'lucide-react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Teacher Screens
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import ClassList from '../screens/teacher/ClassList';
import MarkAttendance from '../screens/teacher/MarkAttendance';
import AttendanceHistory from '../screens/teacher/AttendanceHistory';
import Reports from '../screens/teacher/Reports';
import ProfileScreen from '../screens/ProfileScreen';

// Student Screens
import StudentHistory from '../screens/student/StudentHistory';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const TeacherTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      headerStyle: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0 },
      headerTintColor: colors.text,
    }}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={TeacherDashboard} 
      options={{ tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} /> }}
    />
    <Tab.Screen 
      name="Classes" 
      component={ClassList} 
      options={{ tabBarIcon: ({ color }) => <Users color={color} size={24} /> }}
    />
    <Tab.Screen 
      name="History" 
      component={AttendanceHistory} 
      options={{ tabBarIcon: ({ color }) => <History color={color} size={24} /> }}
    />
    <Tab.Screen 
      name="Reports" 
      component={Reports} 
      options={{ tabBarIcon: ({ color }) => <FileText color={color} size={24} /> }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ tabBarIcon: ({ color }) => <UserCircle color={color} size={24} /> }}
    />
  </Tab.Navigator>
);

const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      headerStyle: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0 },
      headerTintColor: colors.text,
    }}
  >
    <Tab.Screen 
      name="My Attendance" 
      component={StudentHistory} 
      options={{ tabBarIcon: ({ color }) => <History color={color} size={24} /> }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ tabBarIcon: ({ color }) => <UserCircle color={color} size={24} /> }}
    />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const { user, token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user?.role === 'TEACHER' ? (
          <Stack.Screen name="TeacherMain" component={TeacherTabs} />
        ) : (
          <Stack.Screen name="StudentMain" component={StudentTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
