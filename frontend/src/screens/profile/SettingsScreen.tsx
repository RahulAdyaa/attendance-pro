import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useThemeStore } from '../../store/useThemeStore';
import { Feather } from '@expo/vector-icons';
import api from '../../utils/api';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState(true);
  const { isDarkMode, setTheme } = useThemeStore();
  const { colors } = useAppTheme();
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const isPunjabi = i18n.language === 'pa';

  const toggleLanguage = async () => {
    const newLang = isPunjabi ? 'en' : 'pa';
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem('settings.lang', newLang);
  };

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDoNotMatch'));
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(t('error'), t('passwordLengthError'));
      return;
    }

    setIsLoading(true);
    try {
      await api.put('/auth/password', { oldPassword, newPassword });
      Alert.alert(t('success'), t('passwordChangeSuccess'));
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert(t('error'), error.response?.data?.error || t('failedToChangePassword'));
    } finally {
      setIsLoading(false);
    }
  };

  const SettingRow = ({ icon, title, rightElement }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={20} color={colors.primary} />
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
          <Feather name="arrow-left" color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('preferences')}</Text>
          <View style={styles.card}>
            <SettingRow 
              icon="bell" 
              title={t('pushNotifications')} 
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
              icon="moon" 
              title={t('darkMode')} 
              rightElement={
                <Switch 
                  value={isDarkMode} 
                  onValueChange={setTheme} 
                  trackColor={{ false: '#ccc', true: colors.primary }}
                />
              } 
            />
            <View style={styles.divider} />
            <SettingRow 
              icon="globe" 
              title={isPunjabi ? 'ਪੰਜਾਬੀ' : 'English → ਪੰਜਾਬੀ'} 
              rightElement={
                <Switch 
                  value={isPunjabi} 
                  onValueChange={toggleLanguage} 
                  trackColor={{ false: '#ccc', true: '#FF9800' }}
                  thumbColor={isPunjabi ? '#FF9800' : '#f4f3f4'}
                />
              } 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('accountSecurity')}</Text>
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setShowPasswordModal(true)}>
              <SettingRow 
                icon="shield" 
                title={t('changePassword')} 
                rightElement={<Text style={styles.chevron}>›</Text>} 
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={() => navigation.navigate('HelpCenter')}>
              <SettingRow 
                icon="help-circle" 
                title={t('helpSupport')} 
                rightElement={<Text style={styles.chevron}>›</Text>} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent={true} onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('changePassword')}</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Feather name="x" color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('currentPassword')}</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder={t('enterCurrentPassword')}
                placeholderTextColor={colors.textMuted}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('newPassword')}</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder={t('enterNewPassword')}
                placeholderTextColor={colors.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('confirmNewPassword')}</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder={t('enterConfirmNewPassword')}
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handlePasswordChange} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>{t('updatePassword')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  });
};
