import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, TextInput, LayoutAnimation, Platform, UIManager, Animated, Easing } from 'react-native';
import { Bell, Edit2, ChevronRight, Menu } from 'lucide-react-native';
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


// 1. New Rounded Blue Header
export const BlueHeader = ({ title, date, onMenuPress, onNotificationPress, onDatePress }: { title: string, date?: string, onMenuPress?: () => void, onNotificationPress?: () => void, onDatePress?: () => void }) => {
  const styles = useStyles();
  const { colors } = useAppTheme();
  return (
  <View style={styles.headerBackground}>
    <View style={styles.headerContent}>
      <TouchableOpacity style={styles.headerLogoBox} onPress={onMenuPress}>
        <Menu size={24} color={colors.white} />
      </TouchableOpacity>
      <View style={styles.headerTitleBox}>
        <Text style={styles.headerTitle}>{title}</Text>
        {date && (
          <TouchableOpacity onPress={onDatePress}>
            <Text style={[styles.headerDate, onDatePress && { textDecorationLine: 'underline' }]}>{date}</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.notificationBtn} onPress={onNotificationPress}>
        <Bell size={20} color={colors.white} />
        <View style={styles.notificationDot} />
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
        <Edit2 size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  </View>
  );
};

// 3. Vertical Stat Box
export const StatBox = ({ label, value, color, icon: Icon, onPress }: { label: string, value: string | number, color: string, icon: any, onPress?: () => void }) => {
  const styles = useStyles();
  return (
  <TouchableOpacity style={styles.statBox} activeOpacity={0.7} onPress={onPress} disabled={!onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
      <Icon size={18} color={color} />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </TouchableOpacity>
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
  return (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.textInput}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </View>
  );
};

// 6. Profile Menu Item
export const MenuItem = ({ label, icon: Icon, onPress, color }: any) => {
  const styles = useStyles();
  const { colors } = useAppTheme();
  const iconColor = color || colors.text;
  return (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconBox}>
      <Icon size={20} color={iconColor} />
    </View>
    <Text style={[styles.menuLabel, { color: iconColor }]}>{label}</Text>
    <ChevronRight size={18} color={colors.textMuted} />
  </TouchableOpacity>
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
    borderBottomColor: 'rgba(0,0,0,0.02)',
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
  textInput: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 15,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  headerBackground: {
    backgroundColor: colors.primary,
    height: 200,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    paddingTop: 60,
    paddingHorizontal: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogoBox: {
    width: 32,
    height: 32,
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerTitleBox: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  headerDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  notificationBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 25,
    marginTop: -80, // Overlap
    padding: 20,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  profileInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 65,
    height: 65,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: colors.background,
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
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  roleTag: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  tagText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  subRoleTag: {
    backgroundColor: '#F7F9FC',
  },
  subRoleText: {
    color: colors.textMuted,
  },
  editBtn: {
    padding: 8,
  },
  statBox: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    width: (width - 70) / 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
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
  });
};
