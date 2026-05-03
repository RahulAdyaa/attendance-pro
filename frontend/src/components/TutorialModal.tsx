import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface TutorialModalProps {
  visible: boolean;
  onClose: () => void;
  role?: string;
}

export default function TutorialModal({ visible, onClose, role = 'TEACHER' }: TutorialModalProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const teacherSteps = [
    {
      icon: 'home',
      title: t('tutorialDashTitle', 'Dashboard Overview'),
      desc: t('tutorialDashDesc', 'Get a quick glance at your total classes, students, and recent attendance right from the home screen.')
    },
    {
      icon: 'check-square',
      title: t('tutorialMarkTitle', 'Mark Attendance'),
      desc: t('tutorialMarkDesc', 'Easily mark students as Present, Absent, or Late. You can also use the "All Present" button to save time.')
    },
    {
      icon: 'clipboard',
      title: t('tutorialHistoryTitle', 'Attendance History'),
      desc: t('tutorialHistoryDesc', 'Review past sessions. Tap on Present/Absent/Late badges to quickly filter the student list.')
    },
    {
      icon: 'file-text',
      title: t('tutorialReportTitle', 'Generate Reports'),
      desc: t('tutorialReportDesc', 'Export attendance data for any class and date range into a detailed PDF report.')
    }
  ];

  const studentSteps = [
    {
      icon: 'pie-chart',
      title: t('tutorialStudentDashTitle', 'Your Attendance'),
      desc: t('tutorialStudentDashDesc', 'Track your overall attendance percentage and see how many classes you have attended.')
    },
    {
      icon: 'list',
      title: t('tutorialStudentHistoryTitle', 'Session History'),
      desc: t('tutorialStudentHistoryDesc', 'View a detailed history of your past classes and check your status for each one.')
    }
  ];

  const steps = role === 'TEACHER' ? teacherSteps : studentSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Feather name="x" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Feather name={steps[currentStep].icon as any} size={40} color={colors.primary} />
            </View>
            
            <Text style={[styles.title, { color: colors.text }]}>{steps[currentStep].title}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>{steps[currentStep].desc}</Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.dotsContainer}>
              {steps.map((_, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.dot, 
                    { backgroundColor: index === currentStep ? colors.primary : colors.border },
                    index === currentStep && styles.activeDot
                  ]} 
                />
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.nextButton, { backgroundColor: colors.primary }]} 
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? t('gotIt', 'Got it!') : t('next', 'Next')}
              </Text>
              {currentStep < steps.length - 1 && (
                <Feather name="arrow-right" size={18} color="#fff" style={{ marginLeft: 5 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  content: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    minHeight: 180,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeDot: {
    width: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
