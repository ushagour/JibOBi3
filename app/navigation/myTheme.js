import { DefaultTheme } from "@react-navigation/native";
import colors from "../config/colors";

export const getNavigationTheme = () => ({
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.lightGray,
    notification: colors.primary,
  },
});

export default getNavigationTheme();
