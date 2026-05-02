import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function HelpCenterScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = useStyles();
  const { t } = useTranslation();

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
        <Text style={styles.title}>{t('helpCenter')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>{t('howCanWeHelp')}</Text>
        <View style={styles.cardsContainer}>
          <HelpCard icon="file-text" title={t('readFaqs')} description={t('readFaqsDesc')} />
          <HelpCard icon="message-circle" title={t('chatSupport')} description={t('chatSupportDesc')} />
          <HelpCard icon="mail" title={t('emailUs')} description={t('emailUsDesc')} />
        </View>
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>{t('faqs')}</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t('faq1Q')}</Text>
            <Text style={styles.faqAnswer}>{t('faq1A')}</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t('faq2Q')}</Text>
            <Text style={styles.faqAnswer}>{t('faq2A')}</Text>
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
