import { useThemeStore } from '../store/useThemeStore';
import { lightColors, darkColors } from '../theme/colors';

export const useAppTheme = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  
  return {
    colors: isDarkMode ? darkColors : lightColors,
    isDarkMode,
  };
};
