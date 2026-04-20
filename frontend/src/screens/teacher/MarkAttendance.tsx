import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { colors } from '../../theme/colors';
import { Check, X, Clock, AlertCircle, Save } from 'lucide-react-native';
import api from '../../utils/api';

interface Student {
  id: string;
  name: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export default function MarkAttendance({ route, navigation }: any) {
  const { classId, className } = route.params;
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/classes/${classId}`);
      // Mapping API students to our attendance status format
      const studentsData = response.data.students.map((assoc: any) => ({
        id: assoc.student.id,
        name: assoc.student.user.name,
        status: 'PRESENT' // Default status
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load student list');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = (studentId: string, status: Student['status']) => {
    setStudents(prev => 
      prev.map(s => s.id === studentId ? { ...s, status } : s)
    );
  };

  const handleBulkAction = (status: Student['status']) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/attendance/session', {
        classId,
        date: new Date().toISOString(),
        records: students.map(s => ({
          studentId: s.id,
          status: s.status
        }))
      });
      Alert.alert('Success', 'Attendance recorded successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    const statusColors = {
      PRESENT: colors.present,
      ABSENT: colors.absent,
      LATE: colors.late,
      EXCUSED: colors.secondary,
    };

    return (
      <View style={styles.studentCard}>
        <Text style={styles.studentName}>{item.name}</Text>
        <View style={styles.statusGroup}>
          {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as Student['status'][]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                item.status === status && { backgroundColor: statusColors[status] + '20', borderColor: statusColors[status] }
              ]}
              onPress={() => updateStatus(item.id, status)}
            >
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
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.classTitle}>{className}</Text>
          <Text style={styles.dateText}>{new Date().toDateString()}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isSaving}
        >
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

      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No students enrolled in this class yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  classTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  dateText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bulkActions: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: colors.surface,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bulkButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  bulkButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    padding: 15,
  },
  studentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  studentName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusGroup: {
    flexDirection: 'row',
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center'
  }
});
