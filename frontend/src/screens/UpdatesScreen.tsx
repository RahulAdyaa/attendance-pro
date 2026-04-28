import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { BlueHeader } from '../components/CustomUI';

const MOCK_UPDATES = [
  { id: '1', title: 'New Feature: Social Login', description: 'You can now log in using Google or Facebook!', date: 'Today, 10:00 AM', icon: 'star', color: '#FFD700' },
  { id: '2', title: 'System Maintenance', description: 'Scheduled maintenance this weekend from 2 AM to 4 AM.', date: 'Yesterday', icon: 'wrench', color: '#888' },
  { id: '3', title: 'Welcome to Attendance Pro', description: 'Explore our new bottom tab navigation.', date: 'April 25', icon: 'bell', color: '#4CAF50' },
];

export default function UpdatesScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <BlueHeader 
        title="Updates" 
        onMenuPress={() => navigation.openDrawer()} 
      />
      <FlatList
        data={MOCK_UPDATES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
              <FontAwesome name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.contentContainer}>
              <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.description, { color: colors.textMuted }]}>{item.description}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="bell-slash" size={48} color={colors.textMuted} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No new updates</Text>
          </View>
        }
      />
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
    listContainer: {
      padding: 15,
    },
    card: {
      flexDirection: 'row',
      padding: 15,
      borderRadius: 12,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      marginBottom: 8,
      lineHeight: 20,
    },
    date: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 100,
    },
    emptyText: {
      marginTop: 15,
      fontSize: 16,
      fontWeight: '500',
    },
  });
};
