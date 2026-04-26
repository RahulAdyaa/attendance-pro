import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, 
  Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { CustomInput } from '../../components/CustomUI';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  const [designation, setDesignation] = useState('Professor');
  const { register, isLoading, error: authError } = useAuthStore();
  const { colors } = useAppTheme();
  const styles = useStyles();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try { 
      await register({ name, email, password, role, designation }); 
    } catch (err) { /* Error handled by store */ }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>t</Text></View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Attendance Marker today</Text>
        </View>
        <View style={styles.form}>
          {authError && (<View style={styles.errorContainer}><Text style={styles.errorText}>{authError}</Text></View>)}
          <CustomInput label="Full Name" placeholder="Enter your full name" value={name} onChangeText={setName} />
          <CustomInput label="Email Address" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <CustomInput label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry />
          
          <Text style={styles.label}>I am a...</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity style={[styles.roleButton, role === 'STUDENT' && styles.activeRole]} onPress={() => setRole('STUDENT')}>
              <Text style={[styles.roleText, role === 'STUDENT' && styles.activeRoleText]}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.roleButton, role === 'TEACHER' && styles.activeRole]} onPress={() => setRole('TEACHER')}>
              <Text style={[styles.roleText, role === 'TEACHER' && styles.activeRoleText]}>Teacher</Text>
            </TouchableOpacity>
          </View>

          {role === 'TEACHER' && (
            <View style={styles.designationSection}>
              <Text style={styles.label}>Select Designation</Text>
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
            {isLoading ? (<ActivityIndicator color={colors.white} />) : (<Text style={styles.registerButtonText}>Register</Text>)}
          </TouchableOpacity>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} /><Text style={styles.dividerText}>OR CONTINUE WITH</Text><View style={styles.dividerLine} />
          </View>
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={() => alert('Coming soon!')}><Text style={styles.socialIcon}>G</Text></TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => alert('Coming soon!')}><Text style={styles.socialIcon}>f</Text></TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} onPress={() => alert('Coming soon!')}><Text style={styles.socialIcon}>GH</Text></TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.linkText}>Login</Text></TouchableOpacity>
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
