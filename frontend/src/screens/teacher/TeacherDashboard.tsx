import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  RefreshControl,
  Modal,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  Layout, 
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Plus, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  LogOut,
  Bell,
  ChevronRight
} from 'lucide-react-native';
import api from '../../utils/api';
import { BlueHeader, ProfileCard, StatBox } from '../../components/CustomUI';

const { width } = Dimensions.get('window');

export default function TeacherDashboard({ navigation }: any) {
  const { user } = useAuthStore();
  const { colors, isDarkMode } = useAppTheme();
  const styles = useStyles();
  const [stats, setStats] = useState({
    totalStudents: 0,
    attendanceRate: 0,
    totalPresent: 0,
    totalAbsent: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDate, setActiveDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  
  // Modal states
  const [isClassSelectorOpen, setIsClassSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'MARK'>('ALL');
  const [classes, setClasses] = useState<any[]>([]);
  
  // Students list state
  const [isStudentsListOpen, setIsStudentsListOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const { logout } = useAuthStore();

  const fetchStats = async (date?: Date) => {
    const targetDate = date || activeDate;
    const dateString = targetDate.toISOString().split('T')[0];
    try {
      const response = await api.get(`/classes/teacher/stats?date=${dateString}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes/teacher');
      setClasses(response.data);
    } catch (error) { console.error('Error fetching classes:', error); }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats(activeDate);
      fetchClasses();
    }, [])
  );

  useEffect(() => {
    fetchStats(activeDate);
  }, [activeDate]);

  const todayStr = activeDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleStatClick = (type: 'ALL' | 'PRESENT' | 'ABSENT' | 'MARK') => {
    setSelectorType(type);
    setIsClassSelectorOpen(true);
  };

  const handleClassSelect = async (cls: any) => {
    setSelectedClass(cls);
    setIsClassSelectorOpen(false);
    
    if (selectorType === 'MARK') {
      navigation.navigate('MarkAttendance', { classId: cls.id, className: cls.name });
      return;
    }

    setIsStudentsListOpen(true);
    try {
      const classRes = await api.get(`/classes/${cls.id}`);
      const classStudents = classRes.data.students || [];

      if (selectorType === 'ALL') {
        setStudentsList(classStudents);
      } else {
        const dateString = activeDate.toISOString().split('T')[0];
        const historyRes = await api.get(`/attendance/history/${cls.id}`);
        const session = historyRes.data.find((s: any) => s.date.startsWith(dateString));
        
        if (session && session.records) {
          const filteredRecords = session.records.filter((r: any) => r.status === (selectorType === 'PRESENT' ? 'PRESENT' : 'ABSENT'));
          const studentIds = filteredRecords.map((r: any) => r.studentId);
          setStudentsList(classStudents.filter((s: any) => studentIds.includes(s.id)));
        } else {
          setStudentsList([]);
        }
      }
    } catch (error) {
      console.error('Error fetching student list:', error);
      setStudentsList([]);
    }
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
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchStats} tintColor={colors.primary} />
        }
      >
        <BlueHeader 
          title={todayStr} 
          date="Change Date" 
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={() => setHasNotifications(false)}
          onDatePress={() => setShowDatePicker(true)}
          hasNotifications={hasNotifications}
        />
        
        {showDatePicker && (
          <DateTimePicker
            value={activeDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setActiveDate(date);
            }}
            maximumDate={new Date()}
          />
        )}

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ProfileCard 
            name={user?.name || 'Teacher'} 
            role="Teacher" 
            subRole={user?.teacher?.designation || 'HOD'} 
            onEditPress={() => navigation.navigate('EditProfile')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Overview Stats</Text>
          <View style={styles.statsRow}>
            <StatBox label="Students" value={stats.totalStudents} color={colors.primary} icon={Users} onPress={() => handleStatClick('ALL')} />
            <StatBox label="Present" value={stats.totalPresent} color={colors.success} icon={CheckCircle} onPress={() => handleStatClick('PRESENT')} />
            <StatBox label="Absent" value={stats.totalAbsent} color={colors.danger} icon={TrendingDown} onPress={() => handleStatClick('ABSENT')} />
            <StatBox label="Rate" value={`${stats.attendanceRate}%`} color={colors.warning} icon={TrendingUp} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity activeOpacity={0.8} style={styles.actionCard} onPress={() => handleStatClick('MARK')}>
              <View style={[styles.actionIconBox, { backgroundColor: colors.primary + '15' }]}>
                <Plus size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Mark Attendance</Text>
              <Text style={styles.actionDesc}>Start a new session</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.actionCard} onPress={() => navigation.navigate('Attendances')}>
              <View style={[styles.actionIconBox, { backgroundColor: colors.warning + '15' }]}>
                <Clock size={24} color={colors.warning} />
              </View>
              <Text style={styles.actionLabel}>View History</Text>
              <Text style={styles.actionDesc}>Review past logs</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.alertBanner}>
          <View style={styles.alertTop}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={styles.alertTitle}>Performance Audit</Text>
          </View>
          <Text style={styles.alertText}>
            Your class attendance is currently at **{stats.attendanceRate}%**. Keep monitoring the trends to maintain high engagement.
          </Text>
          <TouchableOpacity style={styles.alertBtn} onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.alertBtnText}>Detailed Report</Text>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Class Selector Modal */}
      <Modal animationType="fade" transparent={true} visible={isClassSelectorOpen} onRequestClose={() => setIsClassSelectorOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.centerModalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select a Class</Text>
            <ScrollView style={{ width: '100%', maxHeight: 300 }}>
              {classes.map((cls, idx) => (
                <Animated.View key={cls.id} entering={FadeInRight.delay(idx * 50)}>
                  <TouchableOpacity style={styles.classItem} onPress={() => handleClassSelect(cls)}>
                    <View>
                      <Text style={styles.className}>{cls.name}</Text>
                      <Text style={styles.subjectTextModal}>{cls.subject}</Text>
                    </View>
                    <ChevronRight color={colors.textMuted} size={20} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton, { marginTop: 20 }]} onPress={() => setIsClassSelectorOpen(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Students List Modal */}
      <Modal animationType="slide" transparent={true} visible={isStudentsListOpen} onRequestClose={() => setIsStudentsListOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.fullScreenModalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{selectedClass?.name} - {selectorType}</Text>
            <ScrollView style={{ flex: 1, width: '100%' }}>
              {studentsList.length === 0 ? (
                <View style={styles.emptyContainer}><Text style={styles.emptyText}>No students found</Text></View>
              ) : (
                studentsList.map((student, index) => (
                  <Animated.View key={index} entering={FadeInDown.delay(index * 30)}>
                    <View style={styles.studentItem}>
                      <Text style={styles.studentName}>{student.name || student.user?.name || 'Unknown'}</Text>
                      {student.rollNumber && <Text style={styles.studentRoll}>{student.rollNumber}</Text>}
                    </View>
                  </Animated.View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton, { marginTop: 20, width: '100%' }]} onPress={() => setIsStudentsListOpen(false)}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    section: { marginTop: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, paddingHorizontal: 25, marginBottom: 15 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25 },
    actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25 },
    actionCard: { backgroundColor: colors.surface, width: (width - 65) / 2, padding: 20, borderRadius: 25, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
    actionIconBox: { width: 48, height: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    actionLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
    actionDesc: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
    alertBanner: { marginHorizontal: 25, marginTop: 35, backgroundColor: colors.surface, padding: 20, borderRadius: 25, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, borderWidth: 1, borderColor: colors.border },
    alertTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    alertTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginLeft: 10 },
    alertText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    alertBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
    alertBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14, marginRight: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    centerModalContent: { backgroundColor: colors.surface, marginHorizontal: 20, marginBottom: 40, borderRadius: 30, padding: 25, alignItems: 'center', maxHeight: Dimensions.get('window').height * 0.6 },
    fullScreenModalContent: { backgroundColor: colors.surface, height: '90%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, alignItems: 'center' },
    modalHandle: { width: 50, height: 5, backgroundColor: colors.border, borderRadius: 5, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 20, textAlign: 'center' },
    emptyContainer: { padding: 20, alignItems: 'center' },
    emptyText: { color: colors.textMuted, fontSize: 16 },
    modalButton: { paddingVertical: 15, borderRadius: 15, alignItems: 'center', width: '100%' },
    cancelButton: { backgroundColor: colors.border },
    cancelButtonText: { color: colors.text, fontSize: 16, fontWeight: '700' },
    classItem: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
    className: { fontSize: 18, fontWeight: '700', color: colors.text },
    subjectTextModal: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
    studentItem: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
    studentName: { fontSize: 16, fontWeight: '600', color: colors.text },
    studentRoll: { fontSize: 14, color: colors.textMuted }
  });
};
