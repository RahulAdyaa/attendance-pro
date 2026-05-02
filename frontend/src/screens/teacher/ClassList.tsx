import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput,
  ActivityIndicator, RefreshControl, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useDataStore } from '../../store/useDataStore';
import { Feather } from '@expo/vector-icons';
import api from '../../utils/api';
import { FadeInUp, AnimatedModal, AnimatedTouchable } from '../../components/CustomUI';

interface ClassItem { id: string; name: string; subject: string; studentCount: number; classCode: string; }

export default function ClassList({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const { classes, fetchClasses: fetchClassesCached } = useDataStore();
  const [isLoading, setIsLoading] = useState(classes.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Add Student Modal state
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentFatherName, setStudentFatherName] = useState('');
  const [studentSection, setStudentSection] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentGender, setStudentGender] = useState<'MALE' | 'FEMALE'>('MALE');

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Class code copied to clipboard');
  };

  const fetchClasses = async () => {
    try {
      await fetchClassesCached();
    } catch (error) { console.log('Error fetching classes:', error); }
    finally { setIsLoading(false); setIsRefreshing(false); }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    Alert.alert(
      "Delete Class",
      `Are you sure you want to delete "${name}"? All attendance records for this class will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/classes/${id}`);
              fetchClasses();
            } catch (error) {
              alert('Failed to delete class');
            }
          }
        }
      ]
    );
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleAddClass = async () => {
    if (!newClassName || !newClassSubject) return;
    setIsCreating(true);
    try {
      await api.post('/classes', { name: newClassName, subject: newClassSubject });
      setNewClassName(''); setNewClassSubject(''); setModalVisible(false); fetchClasses();
    } catch (error) { alert('Failed to create class'); }
    finally { setIsCreating(false); }
  };

  const handleAddStudent = async (closeAfterAdd = true) => {
    if (!selectedClass) return;
    setIsAddingStudent(true);
    try {
      await api.post('/classes/add-student', { 
        classId: selectedClass.id, 
        studentEmail: studentEmail ? studentEmail.toLowerCase().trim() : undefined,
        studentName: studentName.trim(),
        fatherName: studentFatherName ? studentFatherName.trim() : undefined,
        gender: studentGender,
        rollNumber: studentSection ? `SEC-${studentSection.toUpperCase()}` : undefined
      });
      setIsAddingStudent(false);
      setStudentEmail('');
      setStudentName('');
      setStudentFatherName('');
      setStudentSection('');
      setStudentGender('MALE');
      
      if (closeAfterAdd) {
        setStudentModalVisible(false);
      }
      
      // Instant +1 update — no second API call needed
      if (selectedClass) {
        const updatedClasses = classes.map(c => 
          c.id === selectedClass.id ? { ...c, studentCount: (c.studentCount || 0) + 1 } : c
        );
        useDataStore.getState().setClasses(updatedClasses);
      }
    } catch (error: any) {
      setIsAddingStudent(false);
      alert(error.response?.data?.error || 'Failed to add student');
    }
  };

  const filteredClasses = classes.filter(cls =>
    (cls.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.subject || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderClassItem = ({ item, index }: { item: ClassItem, index: number }) => (
    <FadeInUp delay={index * 100}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => navigation.navigate('MarkAttendance', { classId: item.id, className: item.name })}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}><Feather name="book-open" size={24} color={colors.primary} /></View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AnimatedTouchable style={styles.codeBadge} onPress={() => item.classCode && copyToClipboard(item.classCode)}>
                <Text style={styles.codeText}>{item.classCode || 'N/A'}</Text>
                <Feather name="copy" size={12} color={colors.secondary} style={{ marginLeft: 4 }} />
              </AnimatedTouchable>
              {item.classCode ? <AnimatedTouchable 
                style={[styles.iconButton, { marginLeft: 12 }]} 
                onPress={() => handleDeleteClass(item.id, item.name)}
              >
                <Feather name="trash-2" size={20} color={colors.danger} />
              </AnimatedTouchable> : null}
            </View>
          </View>
          <Text style={styles.className}>{item.name}</Text>
          <Text style={styles.subjectText}>{item.subject}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.stat}>
              <Feather name="users" size={16} color={colors.textMuted} />
              <Text style={styles.statText}>{item.studentCount} Students</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <AnimatedTouchable 
                style={[styles.markButton, { backgroundColor: colors.secondary + '15', marginRight: 8 }]} 
                onPress={() => {
                  setSelectedClass(item);
                  setStudentModalVisible(true);
                }}
              >
                <Feather name="user-plus" size={16} color={colors.secondary} />
              </AnimatedTouchable>
              <AnimatedTouchable 
                style={styles.markButton} 
                onPress={() => navigation.navigate('MarkAttendance', { classId: item.id, className: item.name })}
              >
                <Text style={styles.markButtonText}>Mark Now</Text>
              </AnimatedTouchable>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </FadeInUp>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Classes</Text>
        <AnimatedTouchable style={styles.addButton} onPress={() => navigation.navigate('CreateClass')}>
          <Feather name="plus" size={24} color={colors.white} />
        </AnimatedTouchable>
      </View>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search classes..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setQuery => setSearchQuery(setQuery)} />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList data={filteredClasses} renderItem={renderClassItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchClasses} tintColor={colors.primary} />}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No classes found. Add your first class!</Text></View>}
        />
      )}
      {/* Modal for adding students remains here */}
      <Modal animationType="fade" transparent={true} visible={studentModalVisible} onRequestClose={() => setStudentModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlayCenter}>
          <AnimatedModal visible={studentModalVisible} style={{ width: '100%' }}>
          <View style={styles.modalContentCenter}>
            <Text style={[styles.modalTitle, { textAlign: 'center' }]}>Add Student</Text>
            <Text style={styles.modalSubtitle}>to {selectedClass?.name} - {selectedClass?.subject}</Text>

            <View style={{ marginBottom: 15 }}>
              <Text style={styles.labelForm}>Student Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. John Doe" 
                placeholderTextColor={colors.textMuted} 
                value={studentName} 
                onChangeText={setStudentName}
              />
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={styles.labelForm}>Father's Name (Optional)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. Richard Doe" 
                placeholderTextColor={colors.textMuted} 
                value={studentFatherName} 
                onChangeText={setStudentFatherName}
              />
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={styles.labelForm}>Gender</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity 
                  style={[styles.input, { flex: 1, alignItems: 'center', borderWidth: 2, borderColor: studentGender === 'MALE' ? colors.primary : colors.border }]} 
                  onPress={() => setStudentGender('MALE')}
                >
                  <Text style={{ color: studentGender === 'MALE' ? colors.primary : colors.textMuted, fontWeight: 'bold' }}>♂ Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.input, { flex: 1, alignItems: 'center', borderWidth: 2, borderColor: studentGender === 'FEMALE' ? '#E91E63' : colors.border }]} 
                  onPress={() => setStudentGender('FEMALE')}
                >
                  <Text style={{ color: studentGender === 'FEMALE' ? '#E91E63' : colors.textMuted, fontWeight: 'bold' }}>♀ Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 20, flexDirection: 'row', gap: 15 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelForm}>Section</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. A" 
                  placeholderTextColor={colors.textMuted} 
                  value={studentSection} 
                  onChangeText={setStudentSection}
                />
              </View>
              <View style={{ flex: 2 }}>
                <Text style={styles.labelForm}>Email ID (Optional)</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="student@example.com" 
                  placeholderTextColor={colors.textMuted} 
                  value={studentEmail} 
                  onChangeText={setStudentEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>
            
            <View style={{ marginTop: 10, gap: 12 }}>
              <AnimatedTouchable 
                style={[styles.primaryBtn, isAddingStudent && styles.disabledBtn]} 
                onPress={() => handleAddStudent(true)} 
                disabled={isAddingStudent}
              >
                {isAddingStudent ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Add Student</Text>}
              </AnimatedTouchable>
              
              <AnimatedTouchable 
                style={[styles.secondaryBtn, isAddingStudent && styles.disabledBtn]} 
                onPress={() => handleAddStudent(false)} 
                disabled={isAddingStudent}
              >
                <Text style={styles.secondaryBtnText}>Add & Add Another</Text>
              </AnimatedTouchable>

              <AnimatedTouchable 
                style={styles.cancelBtn} 
                onPress={() => setStudentModalVisible(false)}
                disabled={isAddingStudent}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </AnimatedTouchable>
            </View>
          </View>
          </AnimatedModal>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.text },
    addButton: { backgroundColor: colors.primary, padding: 10, borderRadius: 12 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, margin: 20, marginTop: 0, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.border },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, paddingVertical: 12, color: colors.text, fontSize: 16 },
    listContent: { padding: 20, paddingTop: 0 },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    iconContainer: { backgroundColor: colors.primary + '20', padding: 10, borderRadius: 10 },
    codeBadge: { backgroundColor: colors.secondary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' },
    codeText: { color: colors.secondary, fontWeight: 'bold', fontSize: 12 },
    className: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    subjectText: { fontSize: 14, color: colors.textMuted, marginBottom: 20 },
    iconButton: { padding: 4, borderRadius: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 15 },
    stat: { flexDirection: 'row', alignItems: 'center' },
    statText: { color: colors.textMuted, marginLeft: 6, fontSize: 14 },
    markButton: { backgroundColor: colors.primary + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    markButtonText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: colors.textMuted, fontSize: 16, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingTop: 15, minHeight: 400, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
    modalContentCenter: { backgroundColor: colors.surface, borderRadius: 24, padding: 25, width: '90%', alignSelf: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
    modalHandle: { width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
    modalSubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
    label: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 15, marginLeft: 4 },
    labelForm: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: colors.background, color: colors.text, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border },
    primaryBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    primaryBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
    secondaryBtn: { backgroundColor: colors.primary + '15', padding: 16, borderRadius: 12, alignItems: 'center' },
    secondaryBtnText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
    cancelBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
    cancelBtnText: { color: colors.textMuted, fontWeight: '600', fontSize: 16 },
    disabledBtn: { opacity: 0.6 }
  });
};
