/**
 * QUICK REFERENCE - FrontEnd UI Upgrade
 * Copy-paste these examples into your components
 */

// ============================================
// 1. IMPORT THEME
// ============================================
import theme from '../config/theme';
import commonStyles from '../config/commonStyles';

// ============================================
// 2. BUTTON USAGE
// ============================================
<Button 
  title="Primary Button" 
  variant="primary"
  size="md"
  onPress={handlePress}
  fullWidth={true}
/>

<Button 
  title="Loading..."
  variant="primary"
  loading={true}
  disabled={true}
/>

<Button 
  title="Outline Button"
  variant="outline"
/>

<Button 
  title="Danger"
  variant="danger"
/>

// ============================================
// 3. TEXT USAGE
// ============================================
<Text variant="h1">Main Heading</Text>
<Text variant="h2">Section Title</Text>
<Text variant="h3">Subsection</Text>
<Text variant="h4">Small Title</Text>

<Text variant="body">Regular paragraph text</Text>
<Text variant="bodyLarge">Larger body text</Text>
<Text variant="bodySmall">Smaller body text</Text>

<Text variant="caption">Tiny caption text</Text>
<Text variant="overline">UPPERCASE LABEL</Text>

// With colors
<Text color="success">Success message</Text>
<Text color="danger">Error message</Text>
<Text color="warning">Warning message</Text>
<Text color="info">Info message</Text>

// ============================================
// 4. TEXT INPUT USAGE
// ============================================
<TextInput
  icon="email"
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
/>

<TextInput
  icon="lock"
  label="Password"
  placeholder="Enter password"
  secureTextEntry={true}
  value={password}
  onChangeText={setPassword}
/>

// With error validation
<TextInput
  icon="phone"
  label="Phone Number"
  placeholder="Enter phone"
  value={phone}
  onChangeText={setPhone}
  error={phoneError}
/>

// Disabled input
<TextInput
  placeholder="Disabled input"
  disabled={true}
/>

// ============================================
// 5. CARD USAGE
// ============================================
<Card 
  title="Product Title"
  subTitle={99.99}
  imageUrl="https://example.com/image.jpg"
  thumbnailUrl="https://example.com/thumb.jpg"
  onPress={handleCardPress}
  status="Sold Out"
  ownerName="John Doe"
  createdAt="Jan 28, 2025"
/>

// ============================================
// 6. SPACER USAGE
// ============================================
<Text variant="h3">Title</Text>
<Spacer size="md" />
<Text variant="body">Content below</Text>

<Spacer size="lg" />
<Spacer size="xl" />

// Horizontal spacer
<View style={{ flexDirection: 'row' }}>
  <Text>Left</Text>
  <Spacer size="md" direction="horizontal" />
  <Text>Right</Text>
</View>

// ============================================
// 7. SCREEN USAGE
// ============================================
<Screen 
  scrollable={true}
  paddingSize="md"
  backgroundColor={theme.colors.background}
>
  <Text variant="h2">Title</Text>
  <Spacer size="md" />
  <Text variant="body">Content goes here</Text>
</Screen>

// Non-scrollable screen
<Screen 
  scrollable={false}
  paddingSize="lg"
>
  {children}
</Screen>

// ============================================
// 8. COMMON STYLES USAGE
// ============================================
import { commonStyles } from '../config/commonStyles';

<View style={commonStyles.rowBetween}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>

<View style={commonStyles.card}>
  {/* Card content */}
</View>

<View style={commonStyles.divider} />

// ============================================
// 9. THEME COLOR USAGE
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  
  successBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
});

// ============================================
// 10. FLEXBOX UTILITIES
// ============================================
// Row layout with centering
<View style={commonStyles.rowCenter}>
  <Icon />
  <Text>Text here</Text>
</View>

// Space between items
<View style={commonStyles.rowBetween}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>

// Centered content
<View style={commonStyles.center}>
  <Text>Centered text</Text>
</View>

// ============================================
// 11. SPACING SCALE REFERENCE
// ============================================
xs   = 4px     (minimal)
sm   = 8px     (small)
md   = 12px    (medium - default)
lg   = 16px    (large)
xl   = 20px    (extra large)
2xl  = 24px
3xl  = 32px
4xl  = 40px
5xl  = 48px    (maximum)

// Usage example
padding: theme.spacing.md        // 12px
marginVertical: theme.spacing.lg // 16px

// ============================================
// 12. FONT SIZE REFERENCE
// ============================================
xs      = 10   (caption)
sm      = 12   (small)
base    = 14   (body - default)
lg      = 16   (body large)
xl      = 18
2xl     = 20
3xl     = 24
4xl     = 28
5xl     = 32   (heading)

// ============================================
// 13. BUTTON VARIANTS
// ============================================
primary    → Filled, primary color
secondary  → Filled, secondary color
outline    → Outlined, primary border
ghost      → No background, primary text
danger     → Filled, red for destructive actions
success    → Filled, green for positive actions

// ============================================
// 14. TEXT VARIANTS
// ============================================
h1         → Heading 1 (32px, bold)
h2         → Heading 2 (28px, bold)
h3         → Heading 3 (24px, semibold)
h4         → Heading 4 (20px, semibold)
body       → Regular body text (14px)
bodyLarge  → Large body text (16px)
bodySmall  → Small body text (12px)
caption    → Captions (10px)
overline   → Labels (10px, uppercase, semibold)

// ============================================
// 15. SEMANTIC COLORS
// ============================================
primary        → Main brand color
secondary      → Secondary brand color
success        → Success/positive states
danger         → Error/danger states
warning        → Warning states
info           → Information states
textPrimary    → Main text
textSecondary  → Secondary text
textTertiary   → Tertiary text
background     → Page background
surface        → Card/component background

// ============================================
// FULL EXAMPLE SCREEN
// ============================================

import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import Screen from '@/app/components/Screen';
import Text from '@/app/components/Text';
import TextInput from '@/app/components/TextInput';
import Button from '@/app/components/Button';
import Spacer from '@/app/components/Spacer';
import theme from '@/app/config/theme';

export default function ExampleScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Perform login
    setLoading(false);
  };

  return (
    <Screen paddingSize="lg">
      <Text variant="h2" color="textPrimary">
        Welcome
      </Text>

      <Spacer size="md" />

      <Text variant="body" color="textSecondary">
        Please log in to continue
      </Text>

      <Spacer size="2xl" />

      <TextInput
        icon="email"
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        icon="lock"
        label="Password"
        placeholder="Enter password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <Spacer size="xl" />

      <Button
        title="Sign In"
        variant="primary"
        loading={loading}
        onPress={handleLogin}
        fullWidth={true}
      />

      <Button
        title="Don't have account? Sign Up"
        variant="ghost"
        onPress={() => {}}
      />
    </Screen>
  );
}

// ============================================
// COMMON PATTERNS
// ============================================

// Pattern 1: List item with icon
<View style={commonStyles.rowCenter}>
  <Icon name="check" size={20} color={theme.colors.success} />
  <Spacer size="md" direction="horizontal" />
  <Text>Item name</Text>
</View>

// Pattern 2: Header with back button
<View style={commonStyles.rowBetween}>
  <TouchableOpacity onPress={goBack}>
    <Icon name="arrow-left" size={24} />
  </TouchableOpacity>
  <Text variant="h3">Title</Text>
  <View style={{ width: 24 }} />
</View>

// Pattern 3: Card container
<View style={[commonStyles.card, theme.shadows.md]}>
  <Text variant="h4">Card Title</Text>
  <Spacer size="md" />
  <Text variant="body">Card content</Text>
</View>

// ============================================
// TROUBLESHOOTING
// ============================================

/*
Q: Component not showing colors correctly?
A: Make sure you're importing theme correctly:
   import theme from '../config/theme';

Q: Spacing looks inconsistent?
A: Use theme.spacing scale:
   padding: theme.spacing.lg

Q: Text too small/large?
A: Use Text variant prop:
   <Text variant="h3">Title</Text>

Q: Button styling not working?
A: Check variant prop is correct:
   <Button variant="primary" />
*/
