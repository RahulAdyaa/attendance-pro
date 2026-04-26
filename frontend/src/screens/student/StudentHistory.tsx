import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Dimensions, ActivityIndicator,
  RefreshControl, ScrollView, ImageBackground, TouchableOpacity
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { CheckCircle, Clock, AlertTriangle, MinusCircle, Calendar as CalendarIcon } from 'lucide-react-native';
import api from '../../utils/api';
import { BlueHeader, ProfileCard, StatBox, TabSwitcher, CustomInput, FadeInUp } from '../../components/CustomUI';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, Search } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface AttendanceRecord {
  id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  session: { date: string; class: { name: string } }
}

export default function StudentHistory() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const styles = useStyles();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('This Month');
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, excused: 0, total: 0 });
  
  // Join Class state
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [currentClass, setCurrentClass] = useState<any>(null);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/attendance/student');
      setRecords(response.data);
      const present = response.data.filter((r: any) => r.status === 'PRESENT').length;
      const absent = response.data.filter((r: any) => r.status === 'ABSENT').length;
      const late = response.data.filter((r: any) => r.status === 'LATE').length;
      const excused = response.data.filter((r: any) => r.status === 'EXCUSED').length;
      setStats({ present, absent, late, excused, total: response.data.length });
    } catch (error) { console.error('Error fetching student history:', error); }
    finally { setIsLoading(false); setIsRefreshing(false); }
  };

  const handleJoinClass = async () => {
    if (!classCode) return;
    setIsJoining(true);
    try {
      const response = await api.post('/classes/join', { classCode: classCode.toUpperCase().trim() });
      alert('Joined class successfully!');
      setCurrentClass(response.data.class);
      setJoinModalVisible(false);
      fetchHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to join class');
    } finally {
      setIsJoining(false);
    }
  };

  const fetchStudentClass = async () => {
    try {
      const response = await api.get('/classes/student/current');
      setCurrentClass(response.data);
    } catch (error) {
      console.log('No class found for student');
    }
  };

  useEffect(() => { 
    fetchHistory();
    fetchStudentClass();
  }, []);

  const renderHistoryItem = ({ item }: { item: AttendanceRecord }) => {
    const statusConfig = {
      PRESENT: { label: 'Arrived on time', color: colors.success, icon: CheckCircle },
      ABSENT: { label: 'Absent', color: colors.danger, icon: MinusCircle },
      LATE: { label: 'Arrived late', color: colors.warning, icon: Clock },
      EXCUSED: { label: 'Excused', color: colors.primary, icon: AlertTriangle },
    };
    const config = statusConfig[item.status];
    const Icon = config.icon;
    const dateStr = new Date(item.session.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = '09:00';

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={[styles.historyIconBox, { backgroundColor: config.color + '15' }]}>
            <Icon size={20} color={config.color} />
          </View>
          <View style={styles.historyTextContent}>
            <Text style={styles.historyStatusLabel}>{config.label}</Text>
            <Text style={styles.historyDateLabel}>{dateStr} - {timeStr}</Text>
          </View>
        </View>
        <ImageBackground source={{ uri: `https://images.unsplash.com/photo-1523050853063-915894b9de9f?q=80&w=400` }} style={styles.historyImage} imageStyle={{ borderRadius: 15 }}>
          <TouchableOpacity style={styles.imageOverlayBtn}>
            <Text style={styles.imageOverlayText}>See full image</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    );
  };

  if (isLoading) {
    return (<View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={colors.primary} /></View>);
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchHistory} tintColor={colors.primary} />}>
      <BlueHeader title={todayStr} />
      <FadeInUp delay={100}>
        <ProfileCard 
          name={user?.name || 'Student'} 
          role="Student" 
          subRole={currentClass ? currentClass.name : "No Class Joined"} 
        />
      </FadeInUp>
      
      {!currentClass && (
        <FadeInUp delay={150}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.joinButton}
            onPress={() => setJoinModalVisible(true)}
          >
            <Plus size={20} color={colors.white} />
            <Text style={styles.joinButtonText}>Join a Class</Text>
          </TouchableOpacity>
        </FadeInUp>
      )}
      <FadeInUp delay={200} style={styles.statusBanner}>
        <View style={[styles.bannerIconBox, { backgroundColor: colors.success + '15' }]}>
          <CheckCircle size={18} color={colors.success} />
        </View>
        <Text style={styles.bannerText}>Your child came to school today, Thanks and good luck!</Text>
      </FadeInUp>
      <FadeInUp delay={300} style={styles.section}>
        <Text style={styles.sectionTitle}>Your Child's Presence</Text>
        <TabSwitcher tabs={['This Week', 'This Month', 'This Semester']} activeTab={activeTab} onTabPress={setActiveTab} />
        <View style={styles.statsRow}>
          <StatBox label="Arrive" value={stats.present} color={colors.success} icon={CheckCircle} />
          <StatBox label="Sick" value={stats.excused} color={colors.primary} icon={AlertTriangle} />
          <StatBox label="Leave" value={stats.late} color={colors.warning} icon={Clock} />
          <StatBox label="Skip" value={stats.absent} color={colors.danger} icon={MinusCircle} />
        </View>
      </FadeInUp>
      <FadeInUp delay={400} style={[styles.section, styles.historySection]}>
        <View style={styles.historyHeaderRow}>
          <Text style={styles.sectionTitle}>Attendance History</Text>
          <TouchableOpacity style={styles.filterBtn}><Text style={styles.filterText}>Newest</Text></TouchableOpacity>
        </View>
        {records.length > 0 ? (
          records.map(item => (<React.Fragment key={item.id}>{renderHistoryItem({ item })}</React.Fragment>))
        ) : (
          <View style={styles.emptyContainer}><Text style={styles.emptyText}>No attendance records found yet.</Text></View>
        )}
      </FadeInUp>
      <View style={{ height: 40 }} />

      <Modal animationType="slide" transparent={true} visible={joinModalVisible} onRequestClose={() => setJoinModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Join Class</Text>
            <Text style={styles.label}>Enter Class Code</Text>
            <TextInput 
              style={styles.input} 
              placeholder="E.G. A1B2C3" 
              placeholderTextColor={colors.textMuted} 
              value={classCode} 
              onChangeText={setClassCode}
              autoCapitalize="characters"
              maxLength={6}
            />
            <Text style={styles.helpText}>Ask your teacher for the 6-digit class code.</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setJoinModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton, isJoining && styles.disabledButton]} 
                onPress={handleJoinClass} 
                disabled={isJoining}
              >
                {isJoining ? <ActivityIndicator color={colors.white} /> : <Text style={styles.createButtonText}>Join Now</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    statusBanner: { backgroundColor: colors.surface, marginHorizontal: 25, marginTop: 20, borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    bannerIconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    bannerText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    section: { marginTop: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, paddingHorizontal: 25 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, marginTop: 10 },
    historySection: { backgroundColor: colors.surface, marginTop: 35, paddingVertical: 25, borderTopLeftRadius: 35, borderTopRightRadius: 35 },
    historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    filterBtn: { backgroundColor: colors.primary + '15', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 10, marginRight: 25 },
    filterText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
    historyCard: { marginHorizontal: 25, marginBottom: 25 },
    historyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    historyIconBox: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    historyTextContent: { flex: 1 },
    historyStatusLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
    historyDateLabel: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
    historyImage: { width: '100%', height: 180, justifyContent: 'center', alignItems: 'center' },
    imageOverlayBtn: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
    imageOverlayText: { color: colors.text, fontSize: 13, fontWeight: '600' },
    emptyContainer: { padding: 60, alignItems: 'center' },
    emptyText: { color: colors.textMuted, fontSize: 14 },
    joinButton: {
      backgroundColor: colors.primary,
      marginHorizontal: 25,
      marginTop: 20,
      padding: 15,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    joinButtonText: {
      color: colors.white,
      fontWeight: 'bold',
      fontSize: 16,
      marginLeft: 10,
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingTop: 15, minHeight: 350 },
    modalHandle: { width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
    label: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: colors.background, color: colors.text, borderRadius: 16, padding: 18, fontSize: 18, fontWeight: 'bold', textAlign: 'center', borderWidth: 1, borderColor: colors.border },
    helpText: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 10 },
    modalButtons: { flexDirection: 'row', marginTop: 35, marginBottom: 10 },
    modalButton: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center', marginHorizontal: 8 },
    cancelButton: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
    cancelButtonText: { color: colors.text, fontWeight: '600', fontSize: 16 },
    createButton: { backgroundColor: colors.primary },
    createButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
    disabledButton: { opacity: 0.7 }
  });
};
