import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useAppTheme } from '../hooks/useAppTheme';
import { BlueHeader, ProfileCard, MenuItem } from '../components/CustomUI';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react-native';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const { colors } = useAppTheme();
  const styles = useStyles();
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <BlueHeader title="Profile Page" />
      
      <ProfileCard 
        name={user?.name || 'User'} 
        role={user?.role === 'TEACHER' ? 'Teacher' : 'Student'} 
        subRole={user?.email || ''} 
      />

      <View style={styles.menuCard}>
        <MenuItem 
          label="Personal Information" 
          icon={User} 
          onPress={() => navigation.navigate('EditProfile')} 
        />
        <MenuItem 
          label="Settings" 
          icon={Settings} 
          onPress={() => navigation.navigate('Settings')} 
        />
        <MenuItem 
          label="Help Center" 
          icon={HelpCircle} 
          onPress={() => navigation.navigate('HelpCenter')} 
        />
        <MenuItem 
          label="Log Out" 
          icon={LogOut} 
          onPress={logout}
          color={colors.danger}
        />
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    menuCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 25,
      marginTop: 35,
      borderRadius: 25,
      paddingHorizontal: 20,
      paddingVertical: 10,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.03,
      shadowRadius: 15,
    },
  });
};
