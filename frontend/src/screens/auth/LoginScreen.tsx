import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
  Linking
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { CustomInput } from '../../components/CustomUI';

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const GOOGLE_WEB_CLIENT_ID = '463145998751-ph0v3ia5mh9kmmi4i0cp62v7ftdhgnoj.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
  scopes: ['profile', 'email']
});

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error: authError } = useAuthStore();
  const { colors } = useAppTheme();
  const styles = useStyles();

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Get the tokens
      const tokens = await GoogleSignin.getTokens();
      
      if (tokens.accessToken) {
        await useAuthStore.getState().loginWithSocial('google', tokens.accessToken);
      } else {
        throw new Error('No access token returned from Google');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
        console.log('Login cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation in progress already
        console.log('Login in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services are not available on this device');
      } else {
        Alert.alert('Google Login Error', error.message || 'Something went wrong');
        console.error('Google Sign-In Error:', error);
      }
    }
  };

  const handleFacebookLogin = () => {
    Alert.alert(
      'Facebook Login', 
      'Facebook Login requires a Facebook Developer App. Please use Google or Email/Password login for now.',
      [{ text: 'OK' }]
    );
  };
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
             <Text style={styles.logoText}>t</Text>
          </View>
          <Text style={styles.title}>Login Account</Text>
          <Text style={styles.subtitle}>Welcome back, login to your account</Text>
        </View>

        <View style={styles.form}>
          {authError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          <CustomInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <CustomInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotPass}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
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
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  });
};
