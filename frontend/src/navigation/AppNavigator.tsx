import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useAppTheme } from '../hooks/useAppTheme';
import CustomDrawerContent from './CustomDrawerContent';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Teacher Screens
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import AttendanceHistory from '../screens/teacher/AttendanceHistory';
import ClassList from '../screens/teacher/ClassList';
import Reports from '../screens/teacher/Reports';
import ProfileScreen from '../screens/ProfileScreen';

// Student Screens
import StudentHistory from '../screens/student/StudentHistory';

// Shared Screens
import UpdatesScreen from '../screens/UpdatesScreen';

// Sub Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import HelpCenterScreen from '../screens/profile/HelpCenterScreen';
import MarkAttendance from '../screens/teacher/MarkAttendance';
import CreateClassScreen from '../screens/teacher/CreateClassScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  const { colors } = useAppTheme();
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false, 
        cardStyle: { backgroundColor: colors.background },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal'
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const TeacherBottomTabs = () => {
  const { colors } = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Classes') iconName = 'book';
          else if (route.name === 'Attendance') iconName = 'calendar-check-o';
          else if (route.name === 'Updates') iconName = 'bell';
          else if (route.name === 'Profile') iconName = 'user';
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={TeacherDashboard} />
      <Tab.Screen name="Classes" component={ClassList} />
      <Tab.Screen name="Attendance" component={AttendanceHistory} />
      <Tab.Screen name="Updates" component={UpdatesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const TeacherDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Drawer.Screen name="Home" component={TeacherBottomTabs} />
      <Drawer.Screen name="Classes" component={ClassList} />
      <Drawer.Screen name="Reports" component={Reports} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="HelpCenter" component={HelpCenterScreen} />
    </Drawer.Navigator>
  );
};

const StudentBottomTabs = () => {
  const { colors } = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Classes') iconName = 'book';
          else if (route.name === 'Attendance') iconName = 'calendar-check-o';
          else if (route.name === 'Updates') iconName = 'bell';
          else if (route.name === 'Profile') iconName = 'user';
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={StudentHistory} />
      <Tab.Screen name="Classes" component={StudentHistory} />
      <Tab.Screen name="Attendance" component={StudentHistory} />
      <Tab.Screen name="Updates" component={UpdatesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const StudentDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Drawer.Screen name="Home" component={StudentBottomTabs} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="HelpCenter" component={HelpCenterScreen} />
    </Drawer.Navigator>
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
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal'
      }}
    >
      {user?.role === 'TEACHER' ? (
        <Stack.Screen name="TeacherMain" component={TeacherDrawer} />
      ) : (
        <Stack.Screen name="StudentMain" component={StudentDrawer} />
      )}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MarkAttendance" component={MarkAttendance} />
      <Stack.Screen name="CreateClass" component={CreateClassScreen} />
    </Stack.Navigator>
  );
};

export default function AppNavigator() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid,
          gestureEnabled: true
        }}
      >
        {!token ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="Main" component={AuthenticatedStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
