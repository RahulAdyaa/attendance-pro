import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuthStore } from '../store/useAuthStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import TutorialModal from '../components/TutorialModal';

const { width } = Dimensions.get('window');

export default function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthStore();
  const { colors, isDarkMode } = useAppTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const [showTutorial, setShowTutorial] = React.useState(false);

  const menuItems = user?.role === 'TEACHER' ? [
    { label: t('dashboardMenu'), icon: 'home', route: 'Home' },
    { label: t('myClasses'), icon: 'book-open', route: 'Classes' },
    { label: t('attendanceHistory'), icon: 'clipboard', route: 'Attendance' },
    { label: t('generateReports'), icon: 'file-text', route: 'Reports' },
    { label: t('profile'), icon: 'user', route: 'Profile' },
    { label: t('settings'), icon: 'settings', route: 'Settings' },
    { label: t('helpCenter'), icon: 'help-circle', route: 'HelpCenter' },
  ] : [
    { label: t('myAttendance'), icon: 'clipboard', route: 'Home' },
    { label: t('profile'), icon: 'user', route: 'Profile' },
    { label: t('settings'), icon: 'settings', route: 'Settings' },
    { label: t('helpCenter'), icon: 'help-circle', route: 'HelpCenter' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
           <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.role === 'TEACHER' ? (user.teacher?.designation || t('teacher')) : t('student')}</Text>
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

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
        <TouchableOpacity style={styles.tutorialBtn} onPress={() => setShowTutorial(true)}>
          <View style={styles.tutorialIconBg}>
            <Feather name="info" size={20} color={colors.primary} />
          </View>
          <Text style={styles.tutorialText}>{t('appTutorial', 'App Tutorial')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Feather name="log-out" size={22} color={colors.danger} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>

      <TutorialModal 
        visible={showTutorial} 
        onClose={() => setShowTutorial(false)} 
        role={user?.role} 
      />
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
    tutorialBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 25,
      paddingVertical: 15,
    },
    tutorialIconBg: {
      backgroundColor: colors.primary + '20',
      padding: 6,
      borderRadius: 12,
    },
    tutorialText: {
      marginLeft: 15,
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 25,
      paddingVertical: 15,
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
