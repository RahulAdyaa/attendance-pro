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
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Plus, 
  UserPlus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  LogOut,
  X,
  Bell,
  ChevronRight
} from 'lucide-react-native';
import api from '../../utils/api';
import { BlueHeader, ProfileCard, StatBox, FadeInUp, AnimatedModal } from '../../components/CustomUI';

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
  
  // Modal states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Stats class selector states
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

  // Re-fetch stats whenever the selected date changes
  useEffect(() => {
    fetchStats(activeDate);
  }, [activeDate]);

  const todayStr = activeDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setActiveDate(selectedDate);
      // Optional: Refetch stats based on activeDate if the backend supports it
    }
  };

  const handleStatClick = (type: 'ALL' | 'PRESENT' | 'ABSENT' | 'MARK') => {
    setSelectorType(type);
    setIsClassSelectorOpen(true);
  };

  const handleClassSelect = async (cls: any) => {
    setSelectedClass(cls);
    setIsClassSelectorOpen(false);
    
    if (selectorType === 'MARK') {
      navigation.navigate('MarkAttendance', { classId: cls.id, subject: cls.subject });
      return;
    }

    setIsStudentsListOpen(true);
    // Fetch students based on selectorType and activeDate
    try {
      if (selectorType === 'ALL') {
        const response = await api.get(`/classes/${cls.id}`);
        setStudentsList(response.data.students || []);
      } else {
        // Fetch class students to get names
        const classRes = await api.get(`/classes/${cls.id}`);
        const classStudents = classRes.data.students || [];

        // Fetch attendance history
        const dateString = activeDate.toISOString().split('T')[0];
        const historyRes = await api.get(`/attendance/history/${cls.id}`);
        
        // Find session matching the active date
        const session = historyRes.data.find((s: any) => s.date.startsWith(dateString));
        
        if (session && session.records) {
          const filteredRecords = session.records.filter((r: any) => r.status === selectorType);
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
        onMenuPress={() => setIsSidebarOpen(true)}
        onNotificationPress={() => setIsNotificationsOpen(true)}
        onDatePress={() => setShowDatePicker(true)}
      />
      
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={activeDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setActiveDate(date);
          }}
          maximumDate={new Date()}
        />
      )}

      {/* iOS Date Picker Modal */}
      <Modal transparent visible={showDatePicker && Platform.OS === 'ios'} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.datePickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={activeDate}
              mode="date"
              display="spinner"
              textColor={colors.text}
              themeVariant={isDarkMode ? 'dark' : 'light'}
              onChange={(event, date) => {
                if (date) setActiveDate(date);
              }}
              maximumDate={new Date()}
            />
          </View>
        </View>
      </Modal>

      <FadeInUp delay={100}>
        <ProfileCard 
          name={user?.name || 'Teacher'} 
          role="Teacher" 
          subRole="Head of Department" 
          onEditPress={() => navigation.navigate('EditProfile')}
        />
      </FadeInUp>

      <FadeInUp delay={200} style={styles.section}>
        <Text style={styles.sectionTitle}>Overview Stats</Text>

        <View style={styles.statsRow}>
          <StatBox label="Students" value={stats.totalStudents} color={colors.primary} icon={Users} onPress={() => handleStatClick('ALL')} />
          <StatBox label="Present" value={stats.totalPresent} color={colors.success} icon={CheckCircle} onPress={() => handleStatClick('PRESENT')} />
          <StatBox label="Absent" value={stats.totalAbsent} color={colors.danger} icon={TrendingDown} onPress={() => handleStatClick('ABSENT')} />
          <StatBox label="Rate" value={`${stats.attendanceRate}%`} color={colors.warning} icon={TrendingUp} />
        </View>
      </FadeInUp>

      <FadeInUp delay={300} style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.actionCard}
            onPress={() => handleStatClick('MARK')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.primary + '15' }]}>
              <Plus size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Mark Attendance</Text>
            <Text style={styles.actionDesc}>Start a new session</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.actionCard}
            onPress={() => navigation.navigate('Attendances')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.warning + '15' }]}>
              <Clock size={24} color={colors.warning} />
            </View>
            <Text style={styles.actionLabel}>View History</Text>
            <Text style={styles.actionDesc}>Review past logs</Text>
          </TouchableOpacity>
        </View>
      </FadeInUp>

      <FadeInUp delay={400} style={styles.alertBanner}>
        <View style={styles.alertTop}>
          <TrendingUp size={20} color={colors.success} />
          <Text style={styles.alertTitle}>Performance Audit</Text>
        </View>
        <Text style={styles.alertText}>
          Your class attendance is currently at **{stats.attendanceRate}%**. Keep monitoring the trends to maintain high engagement.
        </Text>
        <TouchableOpacity style={styles.alertBtn}>
          <Text style={styles.alertBtnText}>Detailed Report</Text>
          <ArrowRight size={16} color={colors.primary} />
        </TouchableOpacity>
      </FadeInUp>
      
      <View style={{ height: 40 }} />
      </ScrollView>
      
      {/* 1. Sidebar Modal */}
      <Modal animationType="fade" transparent={true} visible={isSidebarOpen} onRequestClose={() => setIsSidebarOpen(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalOverlayDismiss} onPress={() => setIsSidebarOpen(false)} />
          <AnimatedModal visible={isSidebarOpen}>
            <View style={styles.sidebarContent}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Menu</Text>
                <TouchableOpacity onPress={() => setIsSidebarOpen(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.sidebarItem} onPress={() => { setIsSidebarOpen(false); navigation.navigate('EditProfile'); }}>
                <Users size={20} color={colors.text} />
                <Text style={styles.sidebarItemText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarItem} onPress={() => { setIsSidebarOpen(false); logout(); }}>
                <LogOut size={20} color={colors.danger} />
                <Text style={[styles.sidebarItemText, { color: colors.danger }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </AnimatedModal>
        </View>
      </Modal>

      {/* 2. Notifications Modal */}
      <Modal animationType="fade" transparent={true} visible={isNotificationsOpen} onRequestClose={() => setIsNotificationsOpen(false)}>
        <View style={styles.modalOverlay}>
          <AnimatedModal visible={isNotificationsOpen}>
            <View style={styles.centerModalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Notifications</Text>
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No new notifications</Text>
              </View>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton, { marginTop: 30 }]} onPress={() => setIsNotificationsOpen(false)}>
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </AnimatedModal>
        </View>
      </Modal>

      {/* 3. Class Selector Modal */}
      <Modal animationType="fade" transparent={true} visible={isClassSelectorOpen} onRequestClose={() => setIsClassSelectorOpen(false)}>
        <View style={styles.modalOverlay}>
          <AnimatedModal visible={isClassSelectorOpen}>
            <View style={styles.centerModalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select a Class</Text>
              <Text style={{color: colors.textMuted, marginBottom: 15, fontSize: 16}}>{selectorType === 'MARK' ? 'Which class to mark?' : 'View stats for:'}</Text>
              
              {classes.map(cls => (
                <TouchableOpacity key={cls.id} style={styles.classItem} onPress={() => handleClassSelect(cls)}>
                  <View>
                    <Text style={styles.className}>{cls.name}</Text>
                    <Text style={styles.subjectTextModal}>{cls.subject}</Text>
                  </View>
                  <ChevronRight color={colors.textMuted} size={20} />
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={[styles.modalButton, styles.cancelButton, { marginTop: 20 }]} onPress={() => setIsClassSelectorOpen(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </AnimatedModal>
        </View>
      </Modal>

      {/* 4. Students List Modal */}
      <Modal animationType="slide" transparent={true} visible={isStudentsListOpen} onRequestClose={() => setIsStudentsListOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.fullScreenModalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{selectedClass?.name} - {selectorType}</Text>
            
            <ScrollView style={{ flex: 1, width: '100%' }}>
              {studentsList.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No students found</Text>
                </View>
              ) : (
                studentsList.map((student, index) => (
                  <View key={index} style={styles.studentItem}>
                    <Text style={styles.studentName}>{student.name || student.user?.name || 'Unknown'}</Text>
                    {student.rollNumber && <Text style={styles.studentRoll}>{student.rollNumber}</Text>}
                  </View>
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
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginTop: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      paddingHorizontal: 25,
      marginBottom: 15,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 25,
    },
    actionsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 25,
    },
    actionCard: {
      backgroundColor: colors.surface,
      width: (width - 65) / 2,
      padding: 20,
      borderRadius: 25,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
    },
    actionIconBox: {
      width: 48,
      height: 48,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    actionLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    actionDesc: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
    },
    alertBanner: {
      marginHorizontal: 25,
      marginTop: 35,
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 25,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    alertTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    alertTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 10,
    },
    alertText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    alertBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
    },
    alertBtnText: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 14,
      marginRight: 8,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalOverlayDismiss: {
      flex: 1,
    },
    sidebarContent: {
      backgroundColor: colors.surface,
      width: width * 0.75,
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
      padding: 25,
      paddingTop: 60,
      borderTopRightRadius: 30,
      borderBottomRightRadius: 30,
    },
    sidebarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 40,
    },
    sidebarTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    sidebarItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sidebarItemText: {
      fontSize: 18,
      color: colors.text,
      marginLeft: 15,
      fontWeight: '600',
    },
    centerModalContent: {
      backgroundColor: colors.surface,
      marginHorizontal: 20,
      marginBottom: 40,
      borderRadius: 30,
      padding: 25,
      alignItems: 'center',
      maxHeight: Dimensions.get('window').height * 0.6,
    },
    fullScreenModalContent: {
      backgroundColor: colors.surface,
      height: '90%',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: 25,
      alignItems: 'center',
    },
    modalHandle: {
      width: 50,
      height: 5,
      backgroundColor: colors.border,
      borderRadius: 5,
      alignSelf: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    emptyContainer: {
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
    },
    modalButton: {
      paddingVertical: 15,
      borderRadius: 15,
      alignItems: 'center',
      width: '100%',
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    cancelButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    classItem: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    className: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    subjectTextModal: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 4,
    },
    studentItem: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    studentName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    studentRoll: {
      fontSize: 14,
      color: colors.textMuted,
    },
    datePickerModal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 20,
    },
    datePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    datePickerDoneText: {
      color: colors.primary,
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
};
