import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { CustomInput } from '../../components/CustomUI';

const GOOGLE_WEB_CLIENT_ID = '463145998751-ph0v3ia5mh9kmmi4i0cp62v7ftdhgnoj.apps.googleusercontent.com';

let GoogleSignin: any = null;
let statusCodes: any = {};

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

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error: authError } = useAuthStore();
  const { colors } = useAppTheme();
  const styles = useStyles();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pa' : 'en';
    i18n.changeLanguage(newLang);
  };

  const [showRolePicker, setShowRolePicker] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!GoogleSignin) {
      Alert.alert(t('error'), t('googleExpoError'));
      return;
    }

    try {
      setIsGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      
      if (tokens.accessToken) {
        setPendingGoogleToken(tokens.accessToken);
        setShowRolePicker(true);
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
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const completeGoogleLogin = async (role: 'TEACHER' | 'STUDENT') => {
    setShowRolePicker(false);
    if (pendingGoogleToken) {
      try {
        await useAuthStore.getState().loginWithSocial('google', pendingGoogleToken, role);
      } catch (err: any) {
        Alert.alert(t('error'), err.message || t('somethingWentWrong'));
      }
      setPendingGoogleToken(null);
    }
  };

  const handleFacebookLogin = () => {
    Alert.alert(t('comingSoon'), t('facebookComingSoon'));
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert(t('error'), err.message || t('loginFailed'));
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.langToggleContainer}>
          <TouchableOpacity 
            style={[styles.langToggle, { backgroundColor: colors.primary + '20' }]} 
            onPress={toggleLanguage}
          >
            <Feather name="globe" size={18} color={colors.primary} />
            <Text style={[styles.langToggleText, { color: colors.primary }]}>
              {i18n.language === 'en' ? t('switchLanguage') : t('switchLanguageEn')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.logoCircle}>
             <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.title}>{t('welcome')}</Text>
          <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.form}>
          {authError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          <CustomInput
            icon="mail"
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomInput
            icon="lock"
            placeholder={t('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotPass}>
            <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>{t('login')}</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('orContinueWith')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#ffffff', borderColor: '#ddd' }]} 
              onPress={handleGoogleLogin}
            >
              <FontAwesome5 name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: '#4267B2', borderColor: '#4267B2' }]} 
              onPress={handleFacebookLogin}
            >
              <FontAwesome5 name="facebook" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>{t('register')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Role Picker Modal */}
      <Modal visible={showRolePicker} animationType="fade" transparent={true} onRequestClose={() => setShowRolePicker(false)}>
        <View style={styles.roleModalOverlay}>
          <View style={styles.roleModalContent}>
            <Text style={styles.roleModalTitle}>{t('selectRole')}</Text>
            <Text style={styles.roleModalSubtitle}>{t('selectRoleSubtitle')}</Text>

            <TouchableOpacity 
              style={styles.roleOption} 
              onPress={() => completeGoogleLogin('TEACHER')}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIconBox, { backgroundColor: colors.primary + '20' }]}>
                <Feather name="briefcase" size={28} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roleOptionTitle}>{t('teacher')}</Text>
                <Text style={styles.roleOptionDesc}>{t('teacherRoleDesc')}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.roleOption} 
              onPress={() => completeGoogleLogin('STUDENT')}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIconBox, { backgroundColor: '#10B981' + '20' }]}>
                <Feather name="book-open" size={28} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roleOptionTitle}>{t('student')}</Text>
                <Text style={styles.roleOptionDesc}>{t('studentRoleDesc')}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.roleCancelBtn} onPress={() => { setShowRolePicker(false); setPendingGoogleToken(null); }}>
              <Text style={styles.roleCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 25,
    paddingTop: 80,
  },
  langToggleContainer: {
    marginBottom: 20,
  },
  langToggle: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  langToggleText: { fontSize: 14, fontWeight: '700', marginLeft: 8 },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 25,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: colors.danger + '10',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.danger + '20',
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    paddingHorizontal: 15,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  socialButton: {
    width: '30%',
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  roleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  roleModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
  },
  roleModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  roleModalSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  roleOptionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
  },
  roleOptionDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleCancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  roleCancelText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
  });
};
