import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { Feather } from '@expo/vector-icons';

export default function EditProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const styles = useStyles();
  const [name, setName] = useState(user?.name || '');
  const [schoolName, setSchoolName] = useState(user?.role === 'TEACHER' ? user?.teacher?.schoolName || '' : '');
  const [email, setEmail] = useState(user?.email || '');
  const [designation, setDesignation] = useState(user?.teacher?.designation || 'Professor');
  const { updateProfile, isLoading } = useAuthStore();

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const success = await updateProfile({ name, email, designation });
    if (success) {
      Alert.alert('Success', 'Profile updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter your full name" placeholderTextColor={colors.textMuted} />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={user?.email || ''} editable={false} />
          <Text style={styles.helpText}>Email cannot be changed.</Text>
        </View>
        {user?.role === 'TEACHER' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>School Name</Text>
            <TextInput style={styles.input} value={schoolName} onChangeText={setSchoolName} placeholder="Enter your school name" placeholderTextColor={colors.textMuted} />
          </View>
        )}
          {user?.role === 'TEACHER' && (
            <View style={styles.designationSection}>
              <Text style={styles.label}>Designation</Text>
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

          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.disabledButton]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.surface },
    backButton: { padding: 8, marginLeft: -8 },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    content: { padding: 25 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 10, marginTop: 15 },
    input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 15, fontSize: 16, color: colors.text },
    disabledInput: { backgroundColor: colors.surfaceAlt, color: colors.textMuted },
    helpText: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
    designationSection: { marginBottom: 20 },
    designationGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
    designationBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, marginRight: 8, marginBottom: 8, backgroundColor: colors.surface },
    designationBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    designationText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    designationTextActive: { color: colors.white },
    saveButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 15, alignItems: 'center', marginTop: 10, elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    saveButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
    disabledButton: { opacity: 0.7 },
  });
};
