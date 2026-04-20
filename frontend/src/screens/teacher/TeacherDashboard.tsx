import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  UserPlus,
  ArrowRight,
  Bell
} from 'lucide-react-native';
import api from '../../utils/api';

const { width } = Dimensions.get('window');

export default function TeacherDashboard({ navigation }: any) {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalStudents: 0,
    attendanceRate: 0,
    totalPresent: 0,
    totalAbsent: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/classes/teacher/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon color={color} size={24} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={fetchStats} tintColor={colors.primary} />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.userName}>{user?.name.split(' ')[0]} 👋</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell color={colors.text} size={24} />
          <View style={styles.dot} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {/* Stats Section */}
          <View style={styles.statsGrid}>
            <StatCard title="Students" value={stats.totalStudents.toString()} icon={Users} color={colors.primary} />
            <StatCard title="Present" value={stats.totalPresent.toString()} icon={CheckCircle} color={colors.present} />
            <StatCard title="Absent" value={stats.totalAbsent.toString()} icon={XCircle} color={colors.absent} />
            <StatCard title="Attendance" value={`${stats.attendanceRate}%`} icon={Clock} color={colors.late} />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Classes')}
            >
              <View style={styles.actionIcon}>
                <Plus color={colors.white} size={24} />
              </View>
              <Text style={styles.actionLabel}>Mark Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Classes')}
            >
              <View style={styles.actionIcon}>
                <UserPlus color={colors.primary} size={24} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Manage Classes</Text>
            </TouchableOpacity>
          </View>

          {/* Low Attendance Alert */}
          <View style={styles.alertBanner}>
            <View style={styles.alertHeader}>
              <XCircle color={colors.absent} size={20} />
              <Text style={styles.alertTitle}>Performance Summary</Text>
            </View>
            <Text style={styles.alertDesc}>
              {stats.attendanceRate < 75 
                ? "Warning: Overall attendance is below your 75% target." 
                : "Great job! Your current attendance rate is above target."}
            </Text>
            <TouchableOpacity style={styles.alertLink} onPress={() => navigation.navigate('History')}>
              <Text style={styles.alertLinkText}>View History</Text>
              <ArrowRight color={colors.absent} size={16} />
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: colors.textMuted,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  notificationBtn: {
    width: 45,
    height: 45,
    backgroundColor: colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: colors.absent,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.surface,
    width: (width - 40) / 2 - 5,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: (width - 50) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  actionIcon: {
    marginBottom: 10,
  },
  actionLabel: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  alertBanner: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: colors.absent + '15',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.absent + '30',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    color: colors.absent,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  alertDesc: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  alertLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  alertLinkText: {
    color: colors.absent,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
  loadingContainer: {
    padding: 100,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
