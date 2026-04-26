import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Check, X, Clock, AlertCircle, Save } from 'lucide-react-native';
import api from '../../utils/api';

interface Student { id: string; name: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; }

export default function MarkAttendance({ route, navigation }: any) {
  const { classId, className } = route.params;
  const { colors } = useAppTheme();
  const styles = useStyles();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => { fetchStudents(); }, [selectedDate]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/classes/${classId}`);
      let studentsData = response.data.students.map((student: any) => ({
        id: student.id, name: student.user?.name || 'Unknown', status: 'PRESENT'
      }));

      // Check if there is an existing session for the selected date
      const historyResponse = await api.get(`/attendance/history/${classId}`);
      const sessions = historyResponse.data;
      
      const isSameDate = (date1: string, date2: Date) => {
        const d1 = new Date(date1);
        return d1.getFullYear() === date2.getFullYear() && 
               d1.getMonth() === date2.getMonth() && 
               d1.getDate() === date2.getDate();
      };

      const sessionForDate = sessions.find((s: any) => isSameDate(s.date, selectedDate));

      if (sessionForDate) {
        const recordMap = new Map();
        sessionForDate.records.forEach((r: any) => recordMap.set(r.studentId, r.status));
        
        studentsData = studentsData.map((s: any) => ({
          ...s,
          status: recordMap.has(s.id) ? recordMap.get(s.id) : s.status
        }));
      }

      setStudents(studentsData);
    } catch (error) { console.error('Error fetching students:', error); Alert.alert('Error', 'Failed to load student list'); }
    finally { setIsLoading(false); }
  };

  const updateStatus = (studentId: string, status: Student['status']) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const handleBulkAction = (status: Student['status']) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/attendance', {
        classId, date: selectedDate.toISOString(),
        records: students.map(s => ({ studentId: s.id, status: s.status }))
      });
      Alert.alert('Success', 'Attendance recorded successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error: any) { 
      Alert.alert('Error', error.response?.data?.error || 'Failed to save attendance'); 
    }
    finally { setIsSaving(false); }
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    const statusColors = { PRESENT: colors.present, ABSENT: colors.absent, LATE: colors.late, EXCUSED: colors.secondary };
    return (
      <View style={styles.studentCard}>
        <Text style={styles.studentName}>{item.name}</Text>
        <View style={styles.statusGroup}>
          {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as Student['status'][]).map((status) => (
            <TouchableOpacity key={status}
              style={[styles.statusButton, item.status === status && { backgroundColor: statusColors[status] + '20', borderColor: statusColors[status] }]}
              onPress={() => updateStatus(item.id, status)}>
              {status === 'PRESENT' && <Check size={18} color={item.status === status ? statusColors.PRESENT : colors.textMuted} />}
              {status === 'ABSENT' && <X size={18} color={item.status === status ? statusColors.ABSENT : colors.textMuted} />}
              {status === 'LATE' && <Clock size={18} color={item.status === status ? statusColors.LATE : colors.textMuted} />}
              {status === 'EXCUSED' && <AlertCircle size={18} color={item.status === status ? statusColors.EXCUSED : colors.textMuted} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (<View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={colors.primary} /></View>);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.classTitle}>{className}</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={[styles.dateText, { color: colors.primary, fontWeight: 'bold' }]}>📅 {selectedDate.toDateString()}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.saveButton, isSaving && styles.disabledButton]} onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color={colors.white} /> : <Save size={20} color={colors.white} />}
          {!isSaving && <Text style={styles.saveButtonText}>Save</Text>}
        </TouchableOpacity>
      </View>
      <View style={styles.bulkActions}>
        <TouchableOpacity style={styles.bulkButton} onPress={() => handleBulkAction('PRESENT')}>
          <Text style={[styles.bulkButtonText, { color: colors.present }]}>All Present</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bulkButton} onPress={() => handleBulkAction('ABSENT')}>
          <Text style={[styles.bulkButtonText, { color: colors.absent }]}>All Absent</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && Platform.OS === 'ios' && (
        <Modal transparent={true} visible={showDatePicker} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                textColor={colors.text}
                themeVariant={isDarkMode ? 'dark' : 'light'}
                onChange={(event, date) => {
                  if (date) setSelectedDate(date);
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
      
      <View style={styles.columnHeaderContainer}>
        <Text style={styles.columnHeaderName}>Student Name</Text>
        <View style={styles.columnHeaderStatusGroup}>
          <Text style={styles.columnHeaderLabel}>P</Text>
          <Text style={styles.columnHeaderLabel}>A</Text>
          <Text style={styles.columnHeaderLabel}>L</Text>
          <Text style={styles.columnHeaderLabel}>E</Text>
        </View>
      </View>

      <FlatList data={students} renderItem={renderStudentItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No students enrolled in this class yet.</Text></View>}
      />
    </View>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: colors.border },
    classTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
    dateText: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
    saveButton: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    saveButtonText: { color: colors.white, fontWeight: 'bold', marginLeft: 8 },
    bulkActions: { flexDirection: 'row', padding: 15, backgroundColor: colors.surface, justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: colors.border },
    bulkButton: { paddingVertical: 8, paddingHorizontal: 15 },
    bulkButtonText: { fontWeight: '600', fontSize: 14 },
    columnHeaderContainer: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background },
    columnHeaderName: { flex: 1, color: colors.textMuted, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', paddingLeft: 10 },
    columnHeaderStatusGroup: { flexDirection: 'row', paddingRight: 15 },
    columnHeaderLabel: { width: 40, marginLeft: 8, textAlign: 'center', color: colors.textMuted, fontSize: 12, fontWeight: 'bold' },
    listContent: { padding: 15, paddingBottom: 100 },
    studentCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    studentName: { color: colors.text, fontSize: 16, fontWeight: '600', flex: 1, paddingLeft: 5 },
    statusGroup: { flexDirection: 'row', paddingRight: 15 },
    statusButton: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    datePickerContainer: { backgroundColor: colors.surface, paddingBottom: 20 },
    datePickerHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
    doneButtonText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
    disabledButton: { opacity: 0.7 },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { color: colors.textMuted, textAlign: 'center' }
  });
};
