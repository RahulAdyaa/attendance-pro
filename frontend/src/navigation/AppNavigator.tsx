import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/useAuthStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { Home, ClipboardList, User, BookOpen } from 'lucide-react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Teacher Screens
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import AttendanceHistory from '../screens/teacher/AttendanceHistory';
import ClassList from '../screens/teacher/ClassList';
import ProfileScreen from '../screens/ProfileScreen';

// Student Screens
import StudentHistory from '../screens/student/StudentHistory';

// Sub Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import HelpCenterScreen from '../screens/profile/HelpCenterScreen';
import MarkAttendance from '../screens/teacher/MarkAttendance';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  const { colors } = useAppTheme();
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        cardStyle: { backgroundColor: colors.background },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const StudentTabs = () => {
  const { colors } = useAppTheme();
  return (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: colors.surface, 
        height: 70,
        borderTopWidth: 0,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        paddingBottom: 15,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 5,
      }
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={StudentHistory} 
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, focused }) => <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} /> }}
    />
    <Tab.Screen 
      name="Attendances" 
      component={StudentHistory} 
      options={{ tabBarLabel: 'Attendances', tabBarIcon: ({ color, focused }) => <ClipboardList color={color} size={24} strokeWidth={focused ? 2.5 : 2} /> }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, focused }) => <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} /> }}
    />
  </Tab.Navigator>
  );
};

const TeacherTabs = () => {
  const { colors } = useAppTheme();
  return (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: colors.surface, 
        height: 70,
        borderTopWidth: 0,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        paddingBottom: 15,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 5,
      }
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={TeacherDashboard} 
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, focused }) => <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} /> }}
    />
    <Tab.Screen 
      name="Classes" 
      component={ClassList} 
      options={{ tabBarLabel: 'Classes', tabBarIcon: ({ color, focused }) => <BookOpen color={color} size={24} strokeWidth={focused ? 2.5 : 2} /> }}
    />
    <Tab.Screen 
      name="Attendances" 
      component={AttendanceHistory} 
      options={{ tabBarLabel: 'Attendances', tabBarIcon: ({ color, focused }) => <ClipboardList color={color} size={24} strokeWidth={focused ? 2.5 : 2} /> }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, focused }) => <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} /> }}
    />
  </Tab.Navigator>
  );
};

const AuthenticatedStack = () => {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
      }}
    >
      {user?.role === 'TEACHER' ? (
        <Stack.Screen name="TeacherMain" component={TeacherTabs} />
      ) : (
        <Stack.Screen name="StudentMain" component={StudentTabs} />
      )}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="MarkAttendance" component={MarkAttendance} />
    </Stack.Navigator>
  );
};

export default function AppNavigator() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="Main" component={AuthenticatedStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
