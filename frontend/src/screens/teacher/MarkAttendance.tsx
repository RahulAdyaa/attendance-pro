import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown, Layout, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';
import api from '../../utils/api';

import { useTranslation } from 'react-i18next';

type Status = 'PRESENT' | 'ABSENT' | 'NOT_AVAILABLE';
interface Student { id: string; name: string; fatherName?: string; gender?: string; status: Status; }

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function MarkAttendance({ route, navigation }: any) {
  const { classId, className } = route.params;
  const { colors } = useAppTheme();
  const styles = useStyles();
  const { t } = useTranslation();
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
        id: student.id, 
        name: student.user?.name || 'Unknown', 
        fatherName: student.fatherName,
        gender: student.gender,
        status: 'PRESENT' as Status
      }));

      const historyResponse = await api.get(`/attendance/history/${classId}`);
      const sessions = historyResponse.data;
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const session = sessions.find((s: any) => s.date.startsWith(dateStr));

      if (session) {
        const recordMap = new Map();
        session.records.forEach((r: any) => recordMap.set(r.studentId, r.status));
        studentsData = studentsData.map((s: any) => ({
          ...s,
          status: recordMap.has(s.id) ? recordMap.get(s.id) : s.status
        }));
      }
      setStudents(studentsData);
    } catch (error: any) { 
      console.log("fetchStudents Error:", error);
      Alert.alert(t('error'), error.response?.data?.error || error.message || t('failedLoadStudents')); 
    }
    finally { setIsLoading(false); }
  };

  const updateStatus = (studentId: string, status: Status) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const handleBulkAction = (status: Status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/attendance', {
        classId, date: selectedDate.toISOString(),
        records: students.map(s => ({ studentId: s.id, status: s.status }))
      });
      Alert.alert(t('success'), t('attendanceRecorded'), [{ 
        text: 'OK', 
        onPress: () => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('TeacherMain');
          }
        } 
      }]);
    } catch (error: any) { 
      Alert.alert(t('error'), error.response?.data?.error || t('failedSaveAttendance')); 
    }
    finally { setIsSaving(false); }
  };

  const StatusButton = ({ studentId, currentStatus, targetStatus, label, color }: any) => {
    const isActive = currentStatus === targetStatus;
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      backgroundColor: isActive ? color : colors.background,
      borderColor: isActive ? color : colors.border,
    }));

    const onPressIn = () => { scale.value = withSpring(0.9); };
    const onPressOut = () => { scale.value = withSpring(1); };

    return (
      <AnimatedTouchable
        activeOpacity={1}
        style={[styles.statusButton, animatedStyle]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => updateStatus(studentId, targetStatus)}
      >
        <Text style={[styles.statusButtonText, { color: isActive ? colors.white : colors.textMuted }]}>
          {label}
        </Text>
      </AnimatedTouchable>
    );
  };

  const renderStudentItem = ({ item, index }: { item: Student, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()} layout={Layout.springify()}>
      <View style={styles.studentCard}>
        <Text style={styles.studentName} numberOfLines={1}>
          {item.name} {item.fatherName ? `(${item.gender === 'FEMALE' ? 'D/O' : 'S/O'} ${item.fatherName})` : ''}
        </Text>
        <View style={styles.statusGroup}>
          <StatusButton studentId={item.id} currentStatus={item.status} targetStatus="PRESENT" label="P" color={colors.present} />
          <StatusButton studentId={item.id} currentStatus={item.status} targetStatus="ABSENT" label="A" color={colors.absent} />
          <StatusButton studentId={item.id} currentStatus={item.status} targetStatus="NOT_AVAILABLE" label={t('leaveShort', 'L')} color={colors.textMuted} />
        </View>
      </View>
    </Animated.View>
  );

  if (isLoading) {
    return (<View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={colors.primary} /></View>);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('TeacherMain');
            }
          }} 
          style={styles.backBtn}
        >
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.classTitle}>{className}</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>📅 {selectedDate.toDateString()}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.saveButton, isSaving && styles.disabledButton]} onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color={colors.white} /> : <Feather name="save" size={20} color={colors.white} />}
        </TouchableOpacity>
      </View>

      <View style={styles.bulkActions}>
        <TouchableOpacity style={styles.bulkButton} onPress={() => handleBulkAction('PRESENT')}>
          <Text style={[styles.bulkButtonText, { color: colors.present }]}>{t('allPresent')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bulkButton} onPress={() => handleBulkAction('ABSENT')}>
          <Text style={[styles.bulkButtonText, { color: colors.absent }]}>{t('allAbsent')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={students} 
        renderItem={renderStudentItem} 
        keyExtractor={item => item.id} 
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>{t('noStudentsEnrolled')}</Text></View>}
      />

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
    backBtn: { padding: 5, marginRight: 10 },
    headerInfo: { flex: 1 },
    classTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    dateText: { fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 2 },
    saveButton: { backgroundColor: colors.primary, width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    bulkActions: { flexDirection: 'row', padding: 12, backgroundColor: colors.surface, justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: colors.border },
    bulkButton: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, backgroundColor: colors.background },
    bulkButtonText: { fontWeight: '700', fontSize: 13 },
    listContent: { padding: 15, paddingBottom: 100 },
    studentCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 15, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 1, borderColor: colors.border },
    studentName: { color: colors.text, fontSize: 16, fontWeight: '700', flex: 1, marginRight: 10 },
    statusGroup: { flexDirection: 'row' },
    statusButton: { width: 42, height: 42, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    statusButtonText: { fontSize: 13, fontWeight: 'bold' },
    disabledButton: { opacity: 0.6 },
    emptyContainer: { padding: 60, alignItems: 'center' },
    emptyText: { color: colors.textMuted, textAlign: 'center', fontSize: 16 }
  });
};
