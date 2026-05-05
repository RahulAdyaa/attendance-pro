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

import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';
import { Feather } from '@expo/vector-icons';
import api from '../../utils/api';
import { BlueHeader, ProfileCard, StatBox, AnimatedTouchable } from '../../components/CustomUI';

const { width } = Dimensions.get('window');


function TeacherDashboardScreen({ navigation, route }: any) {
  const { user } = useAuthStore();
  const { colors, isDarkMode } = useAppTheme();
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const { stats: cachedStats, fetchStats: fetchStatsCached, fetchClasses: fetchClassesCached } = useDataStore();
  const [stats, setStats] = useState(cachedStats || {
    totalStudents: 0,
    attendanceRate: 0,
    totalPresent: 0,
    totalAbsent: 0
  });
  const [isLoading, setIsLoading] = useState(!cachedStats); // Only load if no cache
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDate, setActiveDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  
  // Modal states
  const [isClassSelectorOpen, setIsClassSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'MARK'>('ALL');
  const { classes, fetchClasses: refreshClasses } = useDataStore(); // Use global classes
  
  // Students list state
  const [isStudentsListOpen, setIsStudentsListOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const { logout } = useAuthStore();

  const fetchStats = async (date?: Date) => {
    const targetDate = date || activeDate;
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    try {
      await fetchStatsCached(dateString);
      // Sync local state with cache if needed, but Zustand handles it
    } catch (error) {
      console.log('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Sync local stats when global store updates
  useEffect(() => {
    if (cachedStats) {
      setStats(cachedStats);
    }
  }, [cachedStats]);

  useFocusEffect(
    useCallback(() => {
      fetchStats(activeDate);
      refreshClasses();
    }, [])
  );

  useEffect(() => {
    fetchStats(activeDate);
    
    // Midnight reset logic: Check every minute if the day has changed
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== activeDate.getDate() || now.getMonth() !== activeDate.getMonth()) {
        setActiveDate(now);
      }
    }, 60000); // Check every 60 seconds
    
    return () => clearInterval(interval);
  }, [activeDate]);



  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pa' : 'en';
    i18n.changeLanguage(newLang);
  };

  const todayStr = activeDate.toLocaleDateString(i18n.language === 'pa' ? 'pa-IN' : 'en-US', {
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
      console.log('Error fetching student list:', error);
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
          userName={user?.name?.split(' ')[0] || (user as any)?.teacher?.user?.name?.split(' ')[0] || t('teacher')}
          date={activeDate.toLocaleDateString(i18n.language === 'pa' ? 'pa-IN' : 'en-US', { month: 'short', day: 'numeric' })} 
          onMenuPress={() => navigation.openDrawer()}
          onNotificationPress={() => {
            setHasNotifications(false);
            navigation.navigate('Updates');
          }}
          onDatePress={() => setShowDatePicker(true)}
          hasNotifications={hasNotifications}
        />
        
        {/* Render Android DatePicker normally (it shows its own modal automatically) */}
        {Platform.OS === 'android' && showDatePicker && (
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

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ProfileCard 
            name={user?.name || t('teacher')} 
            role={t('teacher')} 
            subRole={user?.teacher?.designation || 'HOD'} 
            onEditPress={() => navigation.navigate('EditProfile')}
          />
        </Animated.View>

        {/* Language Toggle Button */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <TouchableOpacity 
            style={[styles.langToggle, { backgroundColor: colors.primary + '20' }]} 
            onPress={toggleLanguage}
          >
            <Feather name="globe" size={18} color={colors.primary} />
            <Text style={[styles.langToggleText, { color: colors.primary }]}>
              {i18n.language === 'en' ? t('switchLanguage') : t('switchLanguageEn')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dashboardTitle')}</Text>
          <View style={styles.statsRow}>
            <StatBox label={t('student')} value={stats.totalStudents} color={colors.primary} icon="users" onPress={() => handleStatClick('ALL')} />
            <StatBox label={t('present')} value={stats.totalPresent} color={colors.success} icon="check-circle" onPress={() => handleStatClick('PRESENT')} />
            <StatBox label={t('absent')} value={stats.totalAbsent} color={colors.danger} icon="trending-down" onPress={() => handleStatClick('ABSENT')} />
            <StatBox label="Rate" value={`${stats.attendanceRate}%`} color={colors.warning} icon="trending-up" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.actionsGrid}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AnimatedTouchable style={[styles.actionCard, { width: '100%' }]} onPress={() => handleStatClick('MARK')}>
                <View style={[styles.actionIconBox, { backgroundColor: colors.primary + '15' }]}>
                  <Feather name="plus" size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>{t('markAttendance')}</Text>
                <Text style={styles.actionDesc}>{t('startNewSession')}</Text>
              </AnimatedTouchable>
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <AnimatedTouchable style={[styles.actionCard, { width: '100%' }]} onPress={() => navigation.navigate('Attendance')}>
                <View style={[styles.actionIconBox, { backgroundColor: colors.warning + '15' }]}>
                  <Feather name="clock" size={24} color={colors.warning} />
                </View>
                <Text style={styles.actionLabel}>{t('attendanceHistory')}</Text>
                <Text style={styles.actionDesc}>{t('reviewPastLogs')}</Text>
              </AnimatedTouchable>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.alertBanner}>
          <View style={styles.alertTop}>
            <Feather name="trending-up" size={20} color={colors.success} />
            <Text style={styles.alertTitle}>{t('performanceAudit')}</Text>
          </View>
          <Text style={styles.alertText}>
            {t('attendanceRateMessage', { rate: stats.attendanceRate })}
          </Text>
          <TouchableOpacity style={styles.alertBtn} onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.alertBtnText}>{t('viewReports')}</Text>
            <Feather name="arrow-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal animationType="slide" transparent={true} visible={showDatePicker} onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={{ backgroundColor: colors.surface, paddingBottom: 30, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={activeDate}
                mode="date"
                display="spinner"
                textColor={colors.text}
                onChange={(event, date) => {
                  if (date) setActiveDate(date);
                }}
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Class Selector Modal */}
      <Modal animationType="fade" transparent={true} visible={isClassSelectorOpen} onRequestClose={() => setIsClassSelectorOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.centerModalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t('selectClass')}</Text>
            <ScrollView style={{ width: '100%', maxHeight: 300 }}>
              {classes.map((cls, idx) => (
                <Animated.View key={cls.id} entering={FadeInRight.delay(idx * 50)}>
                  <TouchableOpacity style={styles.classItem} onPress={() => handleClassSelect(cls)}>
                    <View>
                      <Text style={styles.className}>{cls.name}</Text>
                      <Text style={styles.subjectTextModal}>{cls.subject}</Text>
                    </View>
                    <Feather name="chevron-right" color={colors.textMuted} size={20} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton, { marginTop: 20 }]} onPress={() => setIsClassSelectorOpen(false)}>
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
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
                <View style={styles.emptyContainer}><Text style={styles.emptyText}>{t('noStudentsFound')}</Text></View>
              ) : (
                studentsList.map((student, index) => (
                  <Animated.View key={index} entering={FadeInDown.delay(index * 30)}>
                    <View style={styles.studentItem}>
                      <Text style={styles.studentName}>
                        {student.name || student.user?.name || t('unknown')} 
                        {student.fatherName ? ` (${t('sonOf')} ${student.fatherName})` : ''}
                      </Text>
                      {student.rollNumber && <Text style={styles.studentRoll}>{student.rollNumber}</Text>}
                    </View>
                  </Animated.View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton, { marginTop: 20, width: '100%' }]} onPress={() => setIsStudentsListOpen(false)}>
              <Text style={styles.cancelButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default TeacherDashboardScreen;

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    section: { marginTop: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, paddingHorizontal: 25, marginBottom: 15, letterSpacing: -0.3 },
    statsRow: { flexDirection: 'row', paddingHorizontal: 20 },
    actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25 },
    actionCard: { backgroundColor: colors.surface, width: (width - 65) / 2, padding: 22, borderRadius: 22, elevation: 6, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, borderWidth: 1, borderColor: colors.border },
    actionIconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    actionLabel: { fontSize: 15, fontWeight: '800', color: colors.text, letterSpacing: -0.2 },
    actionDesc: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontWeight: '500' },
    alertBanner: { marginHorizontal: 25, marginTop: 35, backgroundColor: colors.surface, padding: 22, borderRadius: 22, elevation: 4, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.success },
    alertTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    alertTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginLeft: 10, letterSpacing: -0.2 },
    alertText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, fontWeight: '400' },
    alertBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: colors.primary + '12', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    langToggle: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, marginVertical: 10, borderWidth: 1, borderColor: colors.primary + '30' },
    langToggleText: { fontSize: 14, fontWeight: '700', marginLeft: 8 },
    alertBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14, marginRight: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    centerModalContent: { backgroundColor: colors.surface, marginHorizontal: 20, marginBottom: 40, borderRadius: 28, padding: 28, alignItems: 'center', maxHeight: Dimensions.get('window').height * 0.6, borderWidth: 1, borderColor: colors.border },
    fullScreenModalContent: { backgroundColor: colors.surface, height: '90%', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 25, alignItems: 'center' },
    modalHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 4, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 20, textAlign: 'center', letterSpacing: -0.3 },
    emptyContainer: { padding: 40, alignItems: 'center' },
    emptyText: { color: colors.textMuted, fontSize: 16, fontWeight: '500' },
    modalButton: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', width: '100%' },
    cancelButton: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
    cancelButtonText: { color: colors.text, fontSize: 16, fontWeight: '700' },
    classItem: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
    className: { fontSize: 17, fontWeight: '700', color: colors.text },
    subjectTextModal: { fontSize: 13, color: colors.textMuted, marginTop: 4, fontWeight: '500' },
    studentItem: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
    studentName: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
    studentRoll: { fontSize: 13, color: colors.primary, fontWeight: '600', backgroundColor: colors.primary + '12', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' }
  });
};
