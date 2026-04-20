import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { colors } from '../../theme/colors';
import { 
  Calendar as CalendarIcon, 
  Filter, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Clock 
} from 'lucide-react-native';
import api from '../../utils/api';

interface Session {
  id: string;
  date: string;
  className: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export default function AttendanceHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [classesList, setClassesList] = useState<string[]>(['ALL']);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/attendance/history/teacher');
      setSessions(response.data);
      
      // Extract unique class names for filtering
      const classes = ['ALL', ...new Set(response.data.map((s: Session) => s.className))] as string[];
      setClassesList(classes);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const filteredSessions = activeFilter === 'ALL' 
    ? sessions 
    : sessions.filter(s => s.className === activeFilter);

  const renderSessionItem = ({ item }: { item: Session }) => {
    const { day, month, time } = formatDate(item.date);
    
    return (
      <TouchableOpacity style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{day}</Text>
            <Text style={styles.dateMonth}>{month}</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.className}>{item.className}</Text>
            <Text style={styles.sessionTime}>Marked at {time}</Text>
          </View>
          <ChevronRight size={20} color={colors.textMuted} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statDetail}>
            <CheckCircle size={14} color={colors.present} />
            <Text style={styles.statText}>{item.present} Present</Text>
          </View>
          <View style={styles.statDetail}>
            <XCircle size={14} color={colors.absent} />
            <Text style={styles.statText}>{item.absent} Absent</Text>
          </View>
          {item.late > 0 && (
            <View style={styles.statDetail}>
              <Clock size={14} color={colors.late} />
              <Text style={styles.statText}>{item.late} Late</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity style={styles.calendarBtn}>
          <CalendarIcon color={colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          <View style={styles.filterIconContainer}>
            <Filter size={20} color={colors.textMuted} />
          </View>
          {classesList.map((f) => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, activeFilter === f && styles.activeChip]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={fetchHistory} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No sessions found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  calendarBtn: {
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  filterIconContainer: {
    marginRight: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterText: {
    color: colors.white,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBadge: {
    width: 50,
    height: 50,
    backgroundColor: colors.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  dateMonth: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  className: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  sessionTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 6,
    fontWeight: '500',
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
