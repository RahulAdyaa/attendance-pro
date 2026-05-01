import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuthStore } from '../store/useAuthStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthStore();
  const { colors, isDarkMode } = useAppTheme();
  const styles = useStyles();

  const menuItems = user?.role === 'TEACHER' ? [
    { label: 'Dashboard', icon: 'home', route: 'Home' },
    { label: 'My Classes', icon: 'book-open', route: 'Classes' },
    { label: 'Attendance History', icon: 'clipboard', route: 'Attendances' },
    { label: 'Generate Reports', icon: 'file-text', route: 'Reports' },
    { label: 'Profile', icon: 'user', route: 'Profile' },
    { label: 'Settings', icon: 'settings', route: 'Settings' },
    { label: 'Help Center', icon: 'help-circle', route: 'HelpCenter' },
  ] : [
    { label: 'My Attendance', icon: 'clipboard', route: 'Home' },
    { label: 'Profile', icon: 'user', route: 'Profile' },
    { label: 'Settings', icon: 'settings', route: 'Settings' },
    { label: 'Help Center', icon: 'help-circle', route: 'HelpCenter' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
           <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.role === 'TEACHER' ? (user.teacher?.designation || 'Teacher') : 'Student'}</Text>
        </View>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={[
              styles.menuItem, 
              props.state.routes[props.state.index].name === item.route && styles.activeMenuItem
            ]}
            onPress={() => props.navigation.navigate(item.route)}
          >
            <Feather name={item.icon as any} size={22} color={props.state.routes[props.state.index].name === item.route ? colors.primary : colors.textMuted} />
            <Text style={[
              styles.menuItemText,
              props.state.routes[props.state.index].name === item.route && styles.activeMenuItemText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Feather name="log-out" size={22} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    header: {
      padding: 25,
      paddingTop: 60,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomRightRadius: 30,
    },
    avatarContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: colors.white,
      fontSize: 24,
      fontWeight: 'bold',
    },
    userInfo: {
      marginLeft: 15,
    },
    userName: {
      color: colors.white,
      fontSize: 18,
      fontWeight: 'bold',
    },
    userRole: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
    },
    menuContainer: {
      flex: 1,
      padding: 15,
      paddingTop: 25,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderRadius: 15,
      marginBottom: 5,
    },
    activeMenuItem: {
      backgroundColor: 'rgba(74, 144, 226, 0.1)',
    },
    menuItemText: {
      marginLeft: 15,
      fontSize: 16,
      color: colors.textMuted,
      fontWeight: '500',
    },
    activeMenuItemText: {
      color: colors.primary,
      fontWeight: '700',
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 25,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginBottom: 20,
    },
    logoutText: {
      marginLeft: 15,
      fontSize: 16,
      color: colors.danger,
      fontWeight: 'bold',
    },
  });
};
