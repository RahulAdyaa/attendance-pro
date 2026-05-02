import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import api from '../../utils/api';

export default function Reports() {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes/teacher');
      setClasses(response.data);
    } catch (error) { Alert.alert('Error', 'Failed to load classes'); }
    finally { setIsLoading(false); }
  };

  const exportClassReport = async (cls: any) => {
    setIsExporting(true);
    try {
      const response = await api.get(`/attendance/history/${cls.id}`);
      const history = response.data;

      if (history.length === 0) {
        Alert.alert('No Data', 'No attendance records found for this class.');
        return;
      }

      // Generate CSV content
      let csvContent = 'Date,Subject,Class,Student Name,Roll Number,Status\n';
      
      history.forEach((session: any) => {
        const date = new Date(session.date).toLocaleDateString();
        session.records.forEach((record: any) => {
          csvContent += `"${date}","${cls.subject}","${cls.name}","${record.student?.user?.name || 'Unknown'}","${record.student?.rollNumber || 'N/A'}","${record.status}"\n`;
        });
      });

      const fileName = `Attendance_Report_${cls.name.replace(/\s+/g, '_')}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', `Report saved to ${fileUri}`);
      }
    } catch (error) {
      console.log('Export error:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setIsExporting(false);
    }
  };

  const renderClassItem = ({ item, index }: any) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity 
        style={styles.classCard} 
        onPress={() => exportClassReport(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardIconBox}>
          <Feather name="file-text" color={colors.primary} size={24} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.className}>{item.name}</Text>
          <Text style={styles.subjectText}>{item.subject}</Text>
        </View>
        <Feather name="download" color={colors.textMuted} size={20} />
      </TouchableOpacity>
    </Animated.View>
  );

  if (isLoading) {
    return (<View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={colors.primary} /></View>);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Detailed Reports</Text>
        <Text style={styles.headerSubtitle}>Export attendance logs as CSV</Text>
      </View>

      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No classes found. Create a class first to see reports.</Text>
          </View>
        }
      />

      {isExporting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Generating Report...</Text>
        </View>
      )}
    </View>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 25, paddingTop: 60, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
    headerSubtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
    listContent: { padding: 20 },
    classCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 1, borderColor: colors.border },
    cardIconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(74, 144, 226, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardInfo: { flex: 1 },
    className: { fontSize: 17, fontWeight: 'bold', color: colors.text },
    subjectText: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    emptyContainer: { padding: 60, alignItems: 'center' },
    emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 15, fontSize: 16 },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    loadingText: { color: 'white', marginTop: 15, fontWeight: 'bold', fontSize: 16 }
  });
};
