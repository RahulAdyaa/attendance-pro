import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useThemeStore } from '../../store/useThemeStore';
import { ArrowLeft, Bell, Moon, Shield, CircleHelp } from 'lucide-react-native';

export default function SettingsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState(true);
  const { isDarkMode, setTheme } = useThemeStore();
  const { colors } = useAppTheme();
  const styles = useStyles();

  const SettingRow = ({ icon: Icon, title, rightElement }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.iconBox}>
          <Icon size={20} color={colors.primary} />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {rightElement}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingRow 
              icon={Bell} 
              title="Push Notifications" 
              rightElement={
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications} 
                  trackColor={{ false: '#ccc', true: colors.primary }}
                />
              } 
            />
            <View style={styles.divider} />
            <SettingRow 
              icon={Moon} 
              title="Dark Mode" 
              rightElement={
                <Switch 
                  value={isDarkMode} 
                  onValueChange={setTheme} 
                  trackColor={{ false: '#ccc', true: colors.primary }}
                />
              } 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
          <View style={styles.card}>
            <TouchableOpacity onPress={() => {}}>
              <SettingRow 
                icon={Shield} 
                title="Change Password" 
                rightElement={<Text style={styles.chevron}>›</Text>} 
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={() => navigation.navigate('HelpCenter')}>
              <SettingRow 
                icon={CircleHelp} 
                title="Help & Support" 
                rightElement={<Text style={styles.chevron}>›</Text>} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 60,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
  },
  });
};
