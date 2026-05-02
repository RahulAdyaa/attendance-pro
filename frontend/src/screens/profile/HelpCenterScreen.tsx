import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';

export default function HelpCenterScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles();

  const HelpCard = ({ icon, title, description }: any) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.iconBox}><Feather name={icon as any} size={24} color={colors.primary} /></View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>How can we help you today?</Text>
        <View style={styles.cardsContainer}>
          <HelpCard icon="file-text" title="Read FAQs" description="Find answers to common questions about using Attendance Pro." />
          <HelpCard icon="message-circle" title="Chat Support" description="Start a live chat with our support team (Available 9AM-5PM)." />
          <HelpCard icon="mail" title="Email Us" description="Send us a detailed message at support@attendancepro.com." />
        </View>
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do students join my class?</Text>
            <Text style={styles.faqAnswer}>When you create a class, a unique Class Code is generated. Share this code with your students to enter during their sign-up process.</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I edit an attendance record?</Text>
            <Text style={styles.faqAnswer}>Currently, once a session is submitted, it is locked. We are working on an edit feature for the next update.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: colors.surface },
    backButton: { padding: 8, marginLeft: -8 },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    content: { padding: 20 },
    subtitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 25 },
    cardsContainer: { marginBottom: 30 },
    card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
    cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
    faqSection: { marginTop: 10 },
    faqTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 },
    faqItem: { marginBottom: 20, backgroundColor: colors.surface, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
    faqQuestion: { fontSize: 15, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    faqAnswer: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  });
};
