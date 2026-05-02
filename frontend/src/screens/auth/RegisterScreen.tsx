import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, 
  Platform, ScrollView, ActivityIndicator, Alert, Linking
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { CustomInput } from '../../components/CustomUI';

let GoogleSignin: any = null;
let statusCodes: any = {};

const GOOGLE_WEB_CLIENT_ID = '463145998751-ph0v3ia5mh9kmmi4i0cp62v7ftdhgnoj.apps.googleusercontent.com';

try {
  const GoogleModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = GoogleModule.GoogleSignin;
  statusCodes = GoogleModule.statusCodes;
  
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
    scopes: ['profile', 'email']
  });
} catch (e) {
  console.log('GoogleSignin native module not available (running in Expo Go)');
}

import { useTranslation } from 'react-i18next';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  const [designation, setDesignation] = useState('Professor');
  const { register, isLoading, error: authError } = useAuthStore();
  const { colors } = useAppTheme();
  const styles = useStyles();
  const { t } = useTranslation();

  const handleGoogleLogin = async () => {
    if (!GoogleSignin) {
      Alert.alert(t('error'), t('googleExpoError'));
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const tokens = await GoogleSignin.getTokens();
      
      if (tokens.accessToken) {
        await useAuthStore.getState().loginWithSocial('google', tokens.accessToken);
      } else {
        throw new Error('No access token returned from Google');
      }
    } catch (error: any) {
      if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
        console.log('Login cancelled');
      } else if (error.code === statusCodes?.IN_PROGRESS) {
        console.log('Login in progress');
      } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(t('error'), t('googlePlayError'));
      } else {
        Alert.alert(t('error'), error.message || t('somethingWentWrong'));
        console.error('Google Sign-In Error:', error);
      }
    }
  };
  const handleFacebookLogin = () => {
    Alert.alert(t('comingSoon'), t('facebookComingSoon'), [{ text: 'OK' }]);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    if (password.length < 8) {
      Alert.alert(t('error'), t('passwordMinLength'));
      return;
    }
    try { 
      await register({ name, email, password, role, designation, fatherName: role === 'STUDENT' ? fatherName : undefined, gender: role === 'STUDENT' ? gender : undefined }); 
    } catch (err) { /* Error handled by store */ }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>t</Text></View>
          <Text style={styles.title}>{t('createAccount')}</Text>
          <Text style={styles.subtitle}>{t('joinToday')}</Text>
        </View>
        <View style={styles.form}>
          {authError && (<View style={styles.errorContainer}><Text style={styles.errorText}>{authError}</Text></View>)}
          <CustomInput label={t('name')} placeholder={t('name')} value={name} onChangeText={setName} />
          <CustomInput label={t('email')} placeholder={t('email')} value={email} onChangeText={setEmail} keyboardType="email-address" />
          <CustomInput label={t('password')} placeholder={t('password')} value={password} onChangeText={setPassword} secureTextEntry />
          
          <Text style={styles.label}>{t('iAmA')}</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity style={[styles.roleButton, role === 'STUDENT' && styles.activeRole]} onPress={() => setRole('STUDENT')}>
              <Text style={[styles.roleText, role === 'STUDENT' && styles.activeRoleText]}>{t('student')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roleButton, role === 'TEACHER' && styles.activeRole]} onPress={() => setRole('TEACHER')}>
              <Text style={[styles.roleText, role === 'TEACHER' && styles.activeRoleText]}>{t('teacher')}</Text>
            </TouchableOpacity>
          </View>

          {role === 'STUDENT' && (
            <>
              <CustomInput label={t('fatherName')} placeholder={t('fatherName')} value={fatherName} onChangeText={setFatherName} />
              <Text style={styles.label}>{t('gender')}</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity style={[styles.roleButton, gender === 'MALE' && styles.activeRole]} onPress={() => setGender('MALE')}>
                  <Text style={[styles.roleText, gender === 'MALE' && styles.activeRoleText]}>♂ {t('male')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.roleButton, gender === 'FEMALE' && { backgroundColor: '#E91E6310', borderColor: '#E91E63' }]} onPress={() => setGender('FEMALE')}>
                  <Text style={[styles.roleText, gender === 'FEMALE' && { color: '#E91E63' }]}>♀ {t('female')}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {role === 'TEACHER' && (
            <View style={styles.designationSection}>
              <Text style={styles.label}>{t('selectDesignation')}</Text>
              <View style={styles.designationGrid}>
                {['HOD', 'Professor', 'Lecturer', 'Assistant Prof', 'Principal'].map((d) => (
                  <TouchableOpacity 
                    key={d} 
                    style={[styles.designationBtn, designation === d && styles.designationBtnActive]} 
                    onPress={() => setDesignation(d)}
                  >
                    <Text style={[styles.designationText, designation === d && styles.designationTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.registerButton, isLoading && styles.disabledButton]} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? (<ActivityIndicator color={colors.white} />) : (<Text style={styles.registerButtonText}>{t('register')}</Text>)}
          </TouchableOpacity>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} /><Text style={styles.dividerText}>{t('orContinueWith')}</Text><View style={styles.dividerLine} />
          </View>
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#ffffff', borderColor: '#ddd' }]} 
              onPress={handleGoogleLogin}
            >
              <FontAwesome name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#4267B2', borderColor: '#4267B2' }]} 
              onPress={handleFacebookLogin}
            >
              <FontAwesome name="facebook" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('haveAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.linkText}>{t('login')}</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, padding: 25, paddingTop: 60 },
    header: { marginBottom: 30, alignItems: 'center' },
    logoCircle: { width: 60, height: 60, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
    logoText: { color: colors.white, fontSize: 32, fontWeight: 'bold' },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
    form: { width: '100%' },
    label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 10, marginTop: 15 },
    roleContainer: { flexDirection: 'row', marginBottom: 20 },
    roleButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginRight: 10 },
    activeRole: { backgroundColor: colors.primary + '10', borderColor: colors.primary },
    roleText: { color: colors.textMuted, fontWeight: '600' },
    activeRoleText: { color: colors.primary },
    designationSection: { marginBottom: 20 },
    designationGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
    designationBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginRight: 8, marginBottom: 8, backgroundColor: colors.surface },
    designationBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    designationText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    designationTextActive: { color: colors.white },
    registerButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    disabledButton: { opacity: 0.7 },
    registerButtonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
    errorContainer: { backgroundColor: colors.danger + '10', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: colors.danger + '20' },
    errorText: { color: colors.danger, textAlign: 'center', fontSize: 13, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25, marginBottom: 30 },
    footerText: { color: colors.textMuted, fontSize: 14 },
    linkText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
    dividerText: { color: colors.textMuted, paddingHorizontal: 15, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
    socialButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
    socialButton: { width: '30%', height: 50, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    socialIcon: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  });
};
