import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
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

// Sub Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import HelpCenterScreen from '../screens/profile/HelpCenterScreen';
import MarkAttendance from '../screens/teacher/MarkAttendance';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

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
      <Drawer.Screen name="Home" component={TeacherDashboard} />
      <Drawer.Screen name="Classes" component={ClassList} />
      <Drawer.Screen name="Attendances" component={AttendanceHistory} />
      <Drawer.Screen name="Reports" component={Reports} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="HelpCenter" component={HelpCenterScreen} />
    </Drawer.Navigator>
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
      <Drawer.Screen name="Home" component={StudentHistory} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
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
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
      }}
    >
      {user?.role === 'TEACHER' ? (
        <Stack.Screen name="TeacherMain" component={TeacherDrawer} />
      ) : (
        <Stack.Screen name="StudentMain" component={StudentDrawer} />
      )}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MarkAttendance" component={MarkAttendance} />
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
          cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid
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
