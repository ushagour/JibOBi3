# FrontEnd UI/Style Upgrade Guide

## 🎨 What's Been Upgraded

### 1. **New Theme System** (`app/config/theme.js`)
A comprehensive design system with:
- **Enhanced Color Palette** - Better contrast, semantic colors, and accessibility
- **Typography System** - Predefined font sizes, weights, and line heights
- **Spacing Scale** - Consistent spacing throughout the app
- **Border Radius** - Rounded corner utilities
- **Shadow System** - Material Design elevation system
- **Modern Shadows** - Soft, elegant shadows for depth

### 2. **Upgraded Components**

#### Button Component
**Before:**
```jsx
<Button title="Click me" onPress={onPress} />
```

**After - Multiple Variants:**
```jsx
// Primary button
<Button 
  title="Save" 
  variant="primary" 
  onPress={onPress}
  size="md"
/>

// Outline button
<Button 
  title="Cancel" 
  variant="outline" 
  onPress={onPress}
/>

// Danger button
<Button 
  title="Delete" 
  variant="danger" 
  onPress={onPress}
/>

// With loading state
<Button 
  title="Saving..." 
  loading={true}
  onPress={onPress}
/>

// With icon
<Button 
  title="Upload" 
  icon={<Icon />}
  onPress={onPress}
/>
```

#### Text Component
**Before:**
```jsx
<Text>Hello World</Text>
```

**After - Semantic Typography:**
```jsx
// Headings
<Text variant="h1">Main Title</Text>
<Text variant="h2">Section Title</Text>
<Text variant="h3">Subsection</Text>

// Body text
<Text variant="body">Regular text</Text>
<Text variant="bodyLarge">Larger text</Text>
<Text variant="bodySmall">Smaller text</Text>

// Special text
<Text variant="caption">Small caption text</Text>
<Text variant="overline">UPPERCASE LABEL</Text>

// With colors
<Text color="textPrimary">Main text</Text>
<Text color="success">Success message</Text>
<Text color="danger">Error message</Text>
```

#### TextInput Component
**Before:**
```jsx
<TextInput icon="email" placeholder="Email" />
```

**After - Enhanced Input:**
```jsx
<TextInput 
  icon="email"
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  disabled={false}
/>

// Password input with toggle
<TextInput 
  icon="lock"
  label="Password"
  placeholder="Enter password"
  secureTextEntry={true}
  value={password}
  onChangeText={setPassword}
/>
```

#### Card Component
**Before:**
```jsx
<Card 
  title="Product" 
  subTitle="99.99" 
  imageUrl={url}
  onPress={onPress}
/>
```

**After - Better Styling:**
```jsx
<Card 
  title="Premium Listing"
  subTitle={99.99}
  imageUrl={url}
  thumbnailUrl={thumbUrl}
  onPress={onPress}
  status="Sold Out"
  ownerName="John Doe"
  createdAt="Jan 28, 2025"
/>
```

#### Screen Component
**Before:**
```jsx
<Screen style={{ backgroundColor: '#f0f0f0' }}>
  {children}
</Screen>
```

**After - Enhanced Safe Area:**
```jsx
// With scrolling
<Screen 
  scrollable={true}
  paddingSize="md"
  backgroundColor={theme.colors.background}
>
  {children}
</Screen>

// Without scrolling
<Screen 
  scrollable={false}
  paddingSize="lg"
>
  {children}
</Screen>
```

### 3. **New Spacer Component**
```jsx
import Spacer from '@/app/components/Spacer';

<Text variant="h3">Title</Text>
<Spacer size="md" />
<Text variant="body">Content</Text>
<Spacer size="lg" direction="vertical" />
```

---

## 🎯 Using the Theme System

### Import the Theme
```jsx
import theme from '../config/theme';
```

### Access Theme Properties
```jsx
// Colors
theme.colors.primary          // #006D6F
theme.colors.success          // #4BB543
theme.colors.textPrimary      // #1A1A1A

// Typography
theme.typography.fontSize.lg  // 16
theme.typography.fontWeight.bold // "700"

// Spacing
theme.spacing.md              // 12
theme.spacing.lg              // 16

// Border Radius
theme.borderRadius.lg         // 12

// Shadows
theme.shadows.md              // { shadowColor, shadowOffset, ... }
```

### Using in StyleSheets
```jsx
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
});
```

---

## 📊 Color Palette

### Primary Colors
- `primary` (#006D6F) - Main brand teal
- `primaryLight` (#1A9FA1) - Hover states
- `primaryDark` (#004D4F) - Active states

### Semantic Colors
- `success` (#4BB543) - Success states
- `danger` (#FF5252) - Error/danger states
- `warning` (#FFC107) - Warning states
- `info` (#2196F3) - Information

### Text Colors
- `textPrimary` - Main text (dark)
- `textSecondary` - Secondary text (medium gray)
- `textTertiary` - Tertiary text (light gray)
- `textInverse` - Text on dark backgrounds

### Neutral Colors
- `white` - Pure white
- `background` - Page background (light beige)
- `surface` - Card/component background
- `lightGray`, `mediumGray`, `darkGray`, etc.

---

## 📏 Spacing Scale

```
xs   = 4px
sm   = 8px
md   = 12px
lg   = 16px
xl   = 20px
2xl  = 24px
3xl  = 32px
4xl  = 40px
5xl  = 48px
```

---

## 🔤 Typography

### Font Sizes
```
xs = 10   (captions)
sm = 12   (labels)
base = 14 (body)
lg = 16   (body large)
xl = 18
2xl = 20
3xl = 24
4xl = 28
5xl = 32 (headings)
```

### Font Weights
```
light = "300"
normal = "400"
medium = "500"
semibold = "600"
bold = "700"
extrabold = "800"
```

---

## 🚀 Migration Guide

### Step 1: Update Imports
**Before:**
```jsx
import colors from '../config/colors';
import styles from '../config/styles';
```

**After:**
```jsx
import theme from '../config/theme';
```

### Step 2: Update Color References
**Before:**
```jsx
backgroundColor: colors.primary,
color: colors.dark,
```

**After:**
```jsx
backgroundColor: theme.colors.primary,
color: theme.colors.textPrimary,
```

### Step 3: Update Component Usage
**Before:**
```jsx
<Button title="Click" onPress={onPress} />
<Text>Hello</Text>
<TextInput icon="email" placeholder="Email" />
```

**After:**
```jsx
<Button title="Click" variant="primary" onPress={onPress} />
<Text variant="body" color="textPrimary">Hello</Text>
<TextInput icon="email" label="Email" placeholder="Email" />
```

---

## 💡 Best Practices

1. **Always use theme spacing** instead of hardcoding values
2. **Use semantic color names** (success, danger) instead of random colors
3. **Use component variants** (primary, secondary, outline) for consistency
4. **Use Text variants** for semantic typography
5. **Leverage shadows** for depth and visual hierarchy
6. **Use Spacer component** for consistent spacing

---

## 📚 Example: Building a Modern Screen

```jsx
import React, { useState } from 'react';
import Screen from '@/app/components/Screen';
import Text from '@/app/components/Text';
import TextInput from '@/app/components/TextInput';
import Button from '@/app/components/Button';
import Spacer from '@/app/components/Spacer';
import theme from '@/app/config/theme';
import { StyleSheet } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen paddingSize="lg">
      <Text variant="h2" color="textPrimary">
        Welcome Back
      </Text>
      
      <Spacer size="md" />
      
      <Text variant="body" color="textSecondary">
        Sign in to your account
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
        placeholder="Enter your password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      
      <Spacer size="2xl" />
      
      <Button
        title="Sign In"
        variant="primary"
        size="md"
        onPress={handleLogin}
        fullWidth={true}
      />
      
      <Button
        title="Don't have an account? Sign Up"
        variant="ghost"
        onPress={handleSignUp}
      />
    </Screen>
  );
}
```

---

## ✨ Features Added

- ✅ Comprehensive design system
- ✅ Modern shadows and elevation
- ✅ Better contrast and accessibility
- ✅ Consistent spacing and typography
- ✅ Multiple button variants and states
- ✅ Enhanced input validation and feedback
- ✅ Better card layouts
- ✅ Safe area handling
- ✅ Loading and disabled states
- ✅ Color system with semantic naming

Enjoy your upgraded UI! 🎉
