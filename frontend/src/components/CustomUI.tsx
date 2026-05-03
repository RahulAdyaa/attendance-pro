import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, TextInput, LayoutAnimation, Platform, UIManager, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// 0. FadeInUp Wrapper for smooth list staggering
export const FadeInUp = ({ children, delay = 0, style }: any) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        bounciness: 8,
        speed: 14,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

// 0.1 Animated Modal Wrapper
export const AnimatedModal = ({ visible, children, style }: { visible: boolean, children: any, style?: any }) => {
  const scale = React.useRef(new Animated.Value(0.9)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 12,
          speed: 14,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      scale.setValue(0.9);
      opacity.setValue(0);
    }
  }, [visible]);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
};

// 0.2 Animated Button Wrapper for Scale Effects
export const AnimatedTouchable = ({ onPress, children, style, disabled }: any) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 12,
      speed: 20,
    }).start();
  };

  return (
    <TouchableWithoutFeedback 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut} 
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};


import { useTranslation } from 'react-i18next';

// 1. New Rounded Blue Header
interface BlueHeaderProps {
  title: string;
  date?: string;
  userName?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onDatePress?: () => void;
  hasNotifications?: boolean;
}

export const BlueHeader: React.FC<BlueHeaderProps> = ({ 
  title, 
  date, 
  userName,
  onMenuPress, 
  onNotificationPress, 
  onDatePress,
  hasNotifications = false 
}) => {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <View style={styles.header}>
      {/* Decorative circles */}
      <View style={styles.headerDecor1} />
      <View style={styles.headerDecor2} />
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
          <Feather name="menu" color={colors.white} size={22} />
        </TouchableOpacity>
        <View style={styles.headerBrandPill}>
          <Text style={styles.headerBrandText}>Attendance Pro</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
          <Feather name="bell" color={colors.white} size={22} />
          {hasNotifications && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>
      <View style={styles.headerBottom}>
        <View style={styles.headerTextContainer}>
          {userName ? (
            <Text style={styles.headerGreeting}>{getGreeting()} 👋</Text>
          ) : null}
          <Text style={styles.headerTitle}>{userName || title}</Text>
          <Text style={styles.headerSubtitle}>{userName ? t('wonderfulDay') : t('today')}</Text>
        </View>
        <TouchableOpacity style={styles.dateContainer} onPress={onDatePress}>
          <Feather name="calendar" color={colors.white} size={16} />
          <Text style={styles.dateText}>{date}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 2. Overlapping Profile Card
export const ProfileCard = ({ name, role, subRole, image, onEditPress }: { name: string, role: string, subRole: string, image?: string, onEditPress?: () => void }) => {
  const styles = useStyles();
  const { colors } = useAppTheme();
  return (
  <View style={styles.profileCard}>
    <View style={styles.profileInner}>
      <View style={styles.avatarContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
             <Text style={styles.placeholderText}>{name.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{name}</Text>
        <View style={styles.tagRow}>
          <View style={styles.roleTag}>
             <Text style={styles.tagText}>{role}</Text>
          </View>
          <View style={[styles.roleTag, styles.subRoleTag]}>
             <Text style={[styles.tagText, styles.subRoleText]}>{subRole}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.editBtn} onPress={onEditPress}>
        <Feather name="edit-2" size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  </View>
  );
};

// 3. Vertical Stat Box — Premium with colored top border
export const StatBox = ({ label, value, color, icon: Icon, onPress }: { label: string, value: string | number, color: string, icon: any, onPress?: () => void }) => {
  const styles = useStyles();
  return (
  <AnimatedTouchable style={[styles.statBox, { borderTopWidth: 3, borderTopColor: color }]} onPress={onPress} disabled={!onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
      {typeof Icon === 'string' ? <Feather name={Icon as any} size={18} color={color} /> : <Icon size={18} color={color} />}
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </AnimatedTouchable>
  );
};

// 4. Tab Switcher
export const TabSwitcher = ({ tabs, activeTab, onTabPress }: { tabs: string[], activeTab: string, onTabPress: (tab: string) => void }) => {
  const styles = useStyles();
  const { colors } = useAppTheme();
  
  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity 
            key={tab} 
            activeOpacity={0.7}
            style={[styles.tabItem, isActive && styles.activeTabItem]}
            onPress={() => onTabPress(tab)}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// 5. High-Fidelity Input
export const CustomInput = ({ label, placeholder, value, onChangeText, secureTextEntry, keyboardType }: any) => {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = React.useState(false);
  const borderAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary]
  });

  return (
  <View style={styles.inputContainer}>
    <Animated.Text style={[styles.inputLabel, { color: isFocused ? colors.primary : colors.text }]}>{label}</Animated.Text>
    <Animated.View style={[styles.textInputWrapper, { borderColor }]}>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </Animated.View>
  </View>
  );
};

// 6. Profile Menu Item
export const MenuItem = ({ label, icon: Icon, onPress, color }: any) => {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const iconColor = color || colors.text;
  return (
  <AnimatedTouchable style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconBox}>
      {typeof Icon === 'string' ? <Feather name={Icon as any} size={20} color={iconColor} /> : <Icon size={20} color={iconColor} />}
    </View>
    <Text style={[styles.menuLabel, { color: iconColor }]}>{label}</Text>
    <Feather name="chevron-right" size={18} color={colors.textMuted} />
  </AnimatedTouchable>
  );
};

const useStyles = () => {
  const { colors } = useAppTheme();
  return StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconBox: {
    marginRight: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  textInputWrapper: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  textInput: {
    padding: 16,
    fontSize: 15,
    color: colors.text,
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    backgroundColor: colors.danger,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  profileCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 25,
    borderRadius: 22,
    marginTop: -80, // Overlap
    padding: 20,
    elevation: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.primary + '15',
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  roleTag: {
    backgroundColor: colors.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  tagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  subRoleTag: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subRoleText: {
    color: colors.textMuted,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBox: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    width: (width - 70) / 4,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 3,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    marginVertical: 20,
    justifyContent: 'space-between',
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  activeTabItem: {
    backgroundColor: colors.primary + '1A', // 10% opacity
    borderWidth: 1,
    borderColor: colors.primary + '33', // 20% opacity
  },
  tabText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  header: {
    backgroundColor: colors.primary,
    height: 270,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingHorizontal: 25,
    overflow: 'hidden',
  },
  headerDecor1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: 20,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerBrandPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerBrandText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  headerGreeting: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateText: {
    color: colors.white,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  });
};
