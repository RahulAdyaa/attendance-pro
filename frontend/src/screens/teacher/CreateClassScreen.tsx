import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useDataStore } from '../../store/useDataStore';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function CreateClassScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const { createClass } = useDataStore();
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !subject) {
      Alert.alert(t('error'), t('enterRequiredClassFields'));
      return;
    }

    setIsLoading(true);
    const success = await createClass({ name, subject, section });
    setIsLoading(false);

    if (success) {
      Alert.alert(t('success'), t('classCreatedSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert(t('error'), t('classCreatedError'));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('createNewClass')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="book-open" color={colors.primary} size={30} />
          </View>
          <Text style={styles.infoTitle}>{t('setupClassroom')}</Text>
          <Text style={styles.infoSubtitle}>{t('setupClassroomDesc')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('classNameLabel')}</Text>
            <View style={styles.inputWrapper}>
              <Feather name="layers" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholder={t('enterClassName')} 
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('subject')}</Text>
            <View style={styles.inputWrapper}>
              <Feather name="book-open" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={subject} 
                onChangeText={setSubject} 
                placeholder={t('enterSubject')} 
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('section')}</Text>
            <View style={styles.inputWrapper}>
              <Feather name="users" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={section} 
                onChangeText={setSection} 
                placeholder={t('enterSection')} 
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.createButton, isLoading && styles.disabledButton]} 
            onPress={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.createButtonText}>{t('create')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingHorizontal: 20, 
      paddingTop: 60, 
      paddingBottom: 20, 
      backgroundColor: colors.surface 
    },
    backButton: { padding: 8, marginLeft: -8 },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    scrollContent: { padding: 25 },
    infoCard: { alignItems: 'center', marginBottom: 40 },
    iconContainer: { padding: 20, borderRadius: 25, marginBottom: 15 },
    infoTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    infoSubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
    form: { gap: 20 },
    inputGroup: { gap: 10 },
    label: { fontSize: 14, fontWeight: '600', color: colors.text, marginLeft: 4 },
    inputWrapper: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: colors.surface, 
      borderWidth: 1, 
      borderColor: colors.border, 
      borderRadius: 15,
      paddingHorizontal: 15
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, paddingVertical: 15, fontSize: 16, color: colors.text },
    createButton: { 
      backgroundColor: colors.primary, 
      paddingVertical: 18, 
      borderRadius: 15, 
      alignItems: 'center', 
      marginTop: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5
    },
    createButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 18 },
    disabledButton: { opacity: 0.7 },
  });
};
