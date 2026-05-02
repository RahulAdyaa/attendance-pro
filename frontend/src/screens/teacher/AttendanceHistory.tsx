import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
  ActivityIndicator, RefreshControl, Platform, LayoutAnimation, Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';
import api from '../../utils/api';

interface Session {
  id: string; date: string; className: string;
  present: number; absent: number; late: number; excused: number;
  records?: Array<{ studentId: string; name: string; status: string }>;
}

export default function AttendanceHistory() {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [classesList, setClassesList] = useState<string[]>(['ALL']);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/attendance/history/teacher');
      setSessions(response.data);
      const classes = ['ALL', ...new Set(response.data.map((s: Session) => s.className))] as string[];
      setClassesList(classes);
    } catch (error) {
      console.log('Error fetching history:', error);
    } finally { setIsLoading(false); setIsRefreshing(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSessionId(prev => prev === id ? null : id);
  };

  const filteredSessions = sessions.filter(s => {
    if (activeFilter !== 'ALL' && s.className !== activeFilter) return false;
    if (selectedDate) {
      const sessionDate = new Date(s.date);
      if (
        sessionDate.getFullYear() !== selectedDate.getFullYear() ||
        sessionDate.getMonth() !== selectedDate.getMonth() ||
        sessionDate.getDate() !== selectedDate.getDate()
      ) {
        return false;
      }
    }
    return true;
  });

  const renderSessionItem = ({ item }: { item: Session }) => {
    const { day, month, time } = formatDate(item.date);
    const isExpanded = expandedSessionId === item.id;
    
    return (
      <TouchableOpacity style={styles.sessionCard} onPress={() => toggleExpand(item.id)} activeOpacity={0.8}>
        <View style={styles.sessionHeader}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{day}</Text>
            <Text style={styles.dateMonth}>{month}</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.className}>{item.className}</Text>
            <Text style={styles.sessionTime}>Marked at {time}</Text>
          </View>
          {isExpanded ? <Feather name="chevron-down" size={20} color={colors.textMuted} /> : <Feather name="chevron-right" size={20} color={colors.textMuted} />}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statDetail}>
            <Feather name="check-circle" size={14} color={colors.present} />
            <Text style={styles.statText}>{item.present} Present</Text>
          </View>
          <View style={styles.statDetail}>
            <Feather name="x-circle" size={14} color={colors.absent} />
            <Text style={styles.statText}>{item.absent} Absent</Text>
          </View>
          {item.late > 0 && (
            <View style={styles.statDetail}>
              <Feather name="clock" size={14} color={colors.late} />
              <Text style={styles.statText}>{item.late} Late</Text>
            </View>
          )}
        </View>

        {isExpanded && item.records && (
          <View style={styles.expandedContent}>
            <Text style={styles.expandedTitle}>Student Details</Text>
            {item.records.map((record, index) => {
              const statusColor = record.status === 'PRESENT' ? colors.present : record.status === 'ABSENT' ? colors.absent : record.status === 'LATE' ? colors.late : colors.textMuted;
              return (
                <View key={index} style={styles.studentRow}>
                  <Text style={styles.studentName}>{record.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>{record.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {selectedDate && (
            <TouchableOpacity style={styles.clearDateBtn} onPress={() => setSelectedDate(null)}>
              <Feather name="x" size={16} color={colors.white} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.calendarBtn, selectedDate && styles.calendarBtnActive]} onPress={() => setShowDatePicker(true)}>
            <Feather name="calendar" color={selectedDate ? colors.white : colors.primary} size={24} />
          </TouchableOpacity>
        </View>
      </View>
      {selectedDate && (
        <Text style={styles.dateFilterLabel}>Showing attendance for: {selectedDate.toDateString()}</Text>
      )}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          <View style={styles.filterIconContainer}>
            <Feather name="filter" size={20} color={colors.textMuted} />
          </View>
          {classesList.map((f) => (
            <TouchableOpacity key={f} style={[styles.filterChip, activeFilter === f && styles.activeChip]} onPress={() => setActiveFilter(f)}>
              <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {isLoading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filteredSessions} keyExtractor={(item) => item.id} renderItem={renderSessionItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={fetchHistory} tintColor={colors.primary} />}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No sessions found for this date.</Text></View>}
        />
      )}

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
          maximumDate={new Date()}
        />
      )}

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
                value={selectedDate || new Date()}
                mode="date"
                display="spinner"
                textColor={colors.text}
                onChange={(event, date) => {
                  if (date) setSelectedDate(date);
                }}
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15 },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.text },
    calendarBtn: { padding: 10, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    calendarBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    clearDateBtn: { backgroundColor: colors.danger, padding: 8, borderRadius: 20, marginRight: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    dateFilterLabel: { paddingHorizontal: 20, paddingBottom: 15, color: colors.primary, fontWeight: '600', fontSize: 14 },
    filterSection: { marginBottom: 20 },
    filterContent: { paddingHorizontal: 20, alignItems: 'center' },
    filterIconContainer: { marginRight: 15 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 10, borderWidth: 1, borderColor: colors.border },
    activeChip: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
    activeFilterText: { color: colors.white },
    listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    sessionCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: colors.border },
    sessionHeader: { flexDirection: 'row', alignItems: 'center' },
    dateBadge: { width: 50, height: 50, backgroundColor: colors.background, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    dateDay: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    dateMonth: { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' },
    sessionInfo: { flex: 1, marginLeft: 15 },
    className: { fontSize: 16, fontWeight: 'bold', color: colors.text },
    sessionTime: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    statsRow: { flexDirection: 'row', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.border },
    statDetail: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    statText: { fontSize: 12, color: colors.text, marginLeft: 6, fontWeight: '500' },
    expandedContent: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.border },
    expandedTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textMuted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    studentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    studentName: { fontSize: 15, color: colors.text, fontWeight: '500' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
    emptyContainer: { marginTop: 100, alignItems: 'center' },
    emptyText: { color: colors.textMuted, fontSize: 16 }
  });
};
