import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { colors } from '../../theme/colors';
import { Plus, Search, BookOpen, Users, Copy, Check } from 'lucide-react-native';
import api from '../../utils/api';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
  classCode: string;
}

export default function ClassList({ navigation }: any) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes/teacher');
      // The backend needs to return student count, for now we map what we have
      setClasses(response.data.map((c: any) => ({
        ...c,
        studentCount: c._count?.students || 0
      })));
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async () => {
    if (!newClassName || !newClassSubject) return;
    
    setIsCreating(true);
    try {
      await api.post('/classes', {
        name: newClassName,
        subject: newClassSubject
      });
      setNewClassName('');
      setNewClassSubject('');
      setModalVisible(false);
      fetchClasses();
    } catch (error) {
      alert('Failed to create class');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderClassItem = ({ item }: { item: ClassItem }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('MarkAttendance', { classId: item.id, className: item.name })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <BookOpen size={24} color={colors.primary} />
        </View>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{item.classCode}</Text>
        </View>
      </View>
      
      <Text style={styles.className}>{item.name}</Text>
      <Text style={styles.subjectText}>{item.subject}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.stat}>
          <Users size={16} color={colors.textMuted} />
          <Text style={styles.statText}>{item.studentCount} Students</Text>
        </View>
        <TouchableOpacity style={styles.markButton} onPress={() => navigation.navigate('MarkAttendance', { classId: item.id, className: item.name })}>
          <Text style={styles.markButtonText}>Mark Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Classes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search classes..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setQuery => setSearchQuery(setQuery)}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredClasses}
          renderItem={renderClassItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={fetchClasses} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No classes found. Add your first class!</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Class</Text>
            
            <Text style={styles.label}>Class Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10-A Mathematics"
              placeholderTextColor={colors.textMuted}
              value={newClassName}
              onChangeText={setNewClassName}
            />

            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Calculus"
              placeholderTextColor={colors.textMuted}
              value={newClassSubject}
              onChangeText={setNewClassSubject}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton, isCreating && styles.disabledButton]}
                onPress={handleAddClass}
                disabled={isCreating}
              >
                {isCreating ? <ActivityIndicator color={colors.white} /> : <Text style={styles.createButtonText}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: colors.primary + '20',
    padding: 10,
    borderRadius: 10,
  },
  codeBadge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codeText: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: colors.textMuted,
    marginLeft: 6,
    fontSize: 14,
  },
  markButton: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 40,
    marginBottom: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  createButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  }
});
