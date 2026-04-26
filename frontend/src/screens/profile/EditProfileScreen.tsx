import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { ArrowLeft, Save } from 'lucide-react-native';

export default function EditProfileScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const styles = useStyles();
  const [name, setName] = useState(user?.name || '');
  const [schoolName, setSchoolName] = useState(user?.role === 'TEACHER' ? user?.teacher?.schoolName || '' : '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); navigation.goBack(); }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.text} size={24} />
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
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
          {isLoading ? (<ActivityIndicator color={colors.white} />) : (<><Save color={colors.white} size={20} /><Text style={styles.saveButtonText}>Save Changes</Text></>)}
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
    label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
    input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 15, fontSize: 16, color: colors.text },
    disabledInput: { backgroundColor: colors.surfaceAlt, color: colors.textMuted },
    helpText: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
    saveButton: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginTop: 20 },
    saveButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  });
};
