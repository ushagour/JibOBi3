import { useColorScheme } from 'react-native';
import colors from '../config/colors';
import darkThemeColors from '../config/darkTheme';

/**
 * Hook to get theme colors based on system dark mode preference
 * Returns the appropriate color set (light or dark)
 */
const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? darkThemeColors : colors,
    isDark,
    colorScheme,
  };
};

export default useTheme;
