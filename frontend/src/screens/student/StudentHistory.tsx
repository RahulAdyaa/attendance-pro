import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Dimensions,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { colors } from '../../theme/colors';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Calendar as CalendarIcon
} from 'lucide-react-native';
import api from '../../utils/api';

const { width } = Dimensions.get('window');

interface AttendanceRecord {
  id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  session: {
    date: string;
    class: {
      name: string;
    }
  }
}

const STATUS_STYLE: any = {
  PRESENT: { color: colors.present, icon: CheckCircle, bg: colors.present + '15' },
  ABSENT: { color: colors.absent, icon: XCircle, bg: colors.absent + '15' },
  LATE: { color: colors.late, icon: Clock, bg: colors.late + '15' },
  EXCUSED: { color: colors.excused, icon: FileText, bg: colors.excused + '15' },
};

export default function StudentHistory() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    total: 0,
    rate: 0
  });

  const fetchHistory = async () => {
    try {
      const response = await api.get('/attendance/student');
      setRecords(response.data);
      
      // Calculate simple stats
      const total = response.data.length;
      const present = response.data.filter((r: any) => r.status === 'PRESENT').length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      
      setStats({ present, total, rate });
    } catch (error) {
      console.error('Error fetching student history:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderRecordItem = ({ item }: { item: AttendanceRecord }) => {
    const style = STATUS_STYLE[item.status];
    const Icon = style.icon;
    const date = new Date(item.session.date).toLocaleDateString();

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>{date}</Text>
            <Text style={styles.subjectLabel}>{item.session.class.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
            <Icon size={14} color={style.color} />
            <Text style={[styles.statusLabel, { color: style.color }]}>{item.status}</Text>
          </View>
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
      <View style={styles.summaryContainer}>
        <View style={styles.circularProgress}>
          <Text style={styles.progressValue}>{stats.rate}%</Text>
          <Text style={styles.progressLabel}>Overall</Text>
        </View>
        <View style={styles.statsOverview}>
          <Text style={styles.overviewTitle}>Attendance Status</Text>
          <Text style={styles.overviewSubtitle}>
            You have attended {stats.present} out of {stats.total} sessions recorded.
          </Text>
        </View>
      </View>

      <View style={styles.historySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Attendance History</Text>
          <CalendarIcon color={colors.primary} size={20} />
        </View>

        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderRecordItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={fetchHistory} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No attendance records found yet.</Text>
            </View>
          }
        />
      </View>
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
  summaryContainer: {
    padding: 25,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  circularProgress: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statsOverview: {
    flex: 1,
    marginLeft: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  historySection: {
    flex: 1,
    paddingTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  subjectLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
  }
});
