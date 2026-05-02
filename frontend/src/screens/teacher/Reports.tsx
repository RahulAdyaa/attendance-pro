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
  const { classes } = useClassStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const { t } = useTranslation();

  const generateCSV = async (classItem: any) => {
    setIsGenerating(true);
    try {
      // 1. Fetch all attendance records for this class
      const q = query(collection(db, 'attendance'), where('classId', '==', classItem.id));
      const querySnapshot = await getDocs(q);
      
      const records: any[] = [];
      querySnapshot.forEach((doc) => {
        records.push(doc.data());
      });

      if (records.length === 0) {
        Alert.alert(t('noData'), t('noAttendanceRecordsFound'));
        setIsGenerating(false);
        return;
      }

      // 2. Format data to CSV
      // Collect unique dates
      const datesSet = new Set<string>();
      records.forEach(r => datesSet.add(r.date));
      const dates = Array.from(datesSet).sort();

      // Collect all student info
      const studentMap = new Map<string, any>(); // studentId -> student data
      classItem.students.forEach((s: any) => {
        studentMap.set(s.id, { ...s, attendance: {} });
      });

      // Populate attendance
      records.forEach(r => {
        r.records.forEach((sr: any) => {
          if (studentMap.has(sr.studentId)) {
            studentMap.get(sr.studentId).attendance[r.date] = sr.status;
          }
        });
      });

      // Create CSV Header
      let csvContent = 'Roll No,Student Name,Father Name,' + dates.join(',') + ',Total Present,Total Absent\n';

      // Create Rows
      const studentsArray = Array.from(studentMap.values()).sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
      
      studentsArray.forEach(s => {
        let presentCount = 0;
        let absentCount = 0;
        const rowData = dates.map(d => {
          const status = s.attendance[d] || '-';
          if (status === 'PRESENT') presentCount++;
          if (status === 'ABSENT') absentCount++;
          return status === 'PRESENT' ? 'P' : (status === 'ABSENT' ? 'A' : (status === 'LATE' ? 'L' : '-'));
        });

        // Escape names that might have commas
        const safeName = `"${s.name}"`;
        const safeFatherName = `"${s.fatherName || ''}"`;
        
        csvContent += `${s.rollNumber},${safeName},${safeFatherName},${rowData.join(',')},${presentCount},${absentCount}\n`;
      });

      // 3. Save file locally
      const fileName = `${classItem.name.replace(/\s+/g, '_')}_Attendance_Report.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      // 4. Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: `${t('share')} ${classItem.name} ${t('report')}`,
          UTI: 'public.comma-separated-values-text'
        });
      } else {
        Alert.alert(t('error'), t('sharingNotAvailable'));
      }

    } catch (error: any) {
      console.error("Error generating report:", error);
      Alert.alert(t('error'), t('failedToGenerateReport'));
    } finally {
      setIsGenerating(false);
    }
  };

  const renderClassItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.classCard} 
      onPress={() => generateCSV(item)}
      disabled={isGenerating}
    >
      <View style={styles.classInfo}>
        <View style={styles.iconBox}>
          <Feather name="file-text" size={24} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.className}>{item.name}</Text>
          <Text style={styles.subjectText}>{item.subject}</Text>
        </View>
      </View>
      <Feather name="download" size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
          <Feather name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t('detailedReports')}</Text>
          <Text style={styles.headerSubtitle}>{t('exportLogsCSV')}</Text>
        </View>
      </View>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderClassItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('noClassesReports')}</Text>
          </View>
        }
      />

      {isGenerating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('generatingReport')}</Text>
        </View>
      )}
    </SafeAreaView>
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
