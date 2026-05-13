/**
 * UI Upgrade Index - Where to Find Everything
 */

// ============================================
// 📚 DOCUMENTATION FILES
// ============================================

// Complete upgrade guide with examples and migration instructions
// READ THIS FIRST
→ app/UI_UPGRADE_GUIDE.md

// Quick summary of what was upgraded
→ UPGRADE_SUMMARY.md

// Quick copy-paste code examples
→ QUICK_REFERENCE.js

// ============================================
// 🎨 THEME & CONFIG
// ============================================

// Main theme system with colors, typography, spacing, shadows
import theme from 'app/config/theme';
→ app/config/theme.js

// Preset styles and utilities (row, card, divider, badge, etc.)
import commonStyles from 'app/config/commonStyles';
→ app/config/commonStyles.js

// Legacy colors (redirects to theme)
import colors from 'app/config/colors';
→ app/config/colors.js

// ============================================
// 🧩 COMPONENTS (UPGRADED)
// ============================================

// Button with variants, sizes, loading state
<Button 
  title="Click"
  variant="primary"
  size="md"
  onPress={onPress}
/>
→ app/components/Button.js

// Text with semantic variants (h1-h4, body, caption, etc.)
<Text variant="h3" color="textPrimary">Title</Text>
→ app/components/Text.js

// Input with labels, error states, password toggle
<TextInput
  label="Email"
  icon="email"
  value={email}
  error={error}
/>
→ app/components/TextInput.js

// Card component with improved styling
<Card title="Product" subTitle={99} imageUrl={url} />
→ app/components/Card.js

// Screen wrapper with safe area and scrolling
<Screen paddingSize="lg" scrollable={true}>
  {children}
</Screen>
→ app/components/Screen.js

// ============================================
// ⭐ NEW COMPONENTS
// ============================================

// Consistent spacing component
<Spacer size="md" direction="vertical" />
→ app/components/Spacer.js

// ============================================
// 🎯 QUICK START EXAMPLES
// ============================================

// Example 1: Basic Screen
<Screen paddingSize="lg">
  <Text variant="h2">Title</Text>
  <Spacer size="md" />
  <Text variant="body">Content</Text>
</Screen>

// Example 2: Button Group
<View>
  <Button title="Primary" variant="primary" />
  <Spacer size="md" />
  <Button title="Secondary" variant="secondary" />
</View>

// Example 3: Form
<Screen>
  <TextInput label="Name" icon="person" />
  <TextInput label="Email" icon="email" />
  <Spacer size="lg" />
  <Button title="Submit" variant="primary" />
</Screen>

// Example 4: Card List
<FlatList
  data={items}
  renderItem={({ item }) => (
    <Card 
      title={item.title}
      subTitle={item.price}
      imageUrl={item.image}
      onPress={() => viewItem(item)}
    />
  )}
/>

// ============================================
// 📊 THEME STRUCTURE
// ============================================

theme = {
  colors: {
    primary: "#006D6F",
    secondary: "#C37D4E",
    success: "#4BB543",
    danger: "#FF5252",
    warning: "#FFC107",
    textPrimary: "#1A1A1A",
    textSecondary: "#666666",
    // ... and more
  },
  
  typography: {
    fontSize: { xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl },
    fontWeight: { thin, light, normal, medium, semibold, bold, extrabold },
    lineHeight: { tight, normal, relaxed, loose },
  },
  
  spacing: { xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl },
  
  borderRadius: { xs, sm, md, lg, xl, 2xl, 3xl, full },
  
  shadows: {
    none: {...},
    xs: {...},
    sm: {...},
    md: {...},
    lg: {...},
    xl: {...},
  },
}

// ============================================
// 🔄 MIGRATION CHECKLIST
// ============================================

// Step 1: Update imports in your screens
[ ] Remove: import colors from '../config/colors'
[ ] Add: import theme from '../config/theme'

// Step 2: Update Screen wrapper
[ ] Change: <Screen> to <Screen paddingSize="lg">
[ ] Add scrollable prop if needed

// Step 3: Update Text components
[ ] Change: <Text> to <Text variant="body" color="textPrimary">
[ ] Use semantic variants for headings (h2, h3, etc.)

// Step 4: Update Button components
[ ] Change: <Button title="X" /> to <Button title="X" variant="primary" />
[ ] Add size prop if needed

// Step 5: Use new Spacer component
[ ] Replace hardcoded margins with <Spacer size="md" />
[ ] Update spacing values to use theme.spacing

// Step 6: Update TextInput
[ ] Add label prop
[ ] Add error prop for validation
[ ] Update icon usage

// ============================================
// 🎨 COLOR CHEAT SHEET
// ============================================

Primary Brand:       theme.colors.primary          (#006D6F)
Light Variant:       theme.colors.primaryLight     (#1A9FA1)
Dark Variant:        theme.colors.primaryDark      (#004D4F)

Text Colors:
  Main:              theme.colors.textPrimary      (#1A1A1A)
  Secondary:         theme.colors.textSecondary    (#666666)
  Tertiary:          theme.colors.textTertiary     (#999999)

Semantic:
  Success:           theme.colors.success          (#4BB543)
  Error:             theme.colors.danger           (#FF5252)
  Warning:           theme.colors.warning          (#FFC107)
  Info:              theme.colors.info             (#2196F3)

Backgrounds:
  Page:              theme.colors.background       (#F9F4EF)
  Cards:             theme.colors.surface          (#FFFFFF)
  Light Gray:        theme.colors.lightGray        (#E5E5E5)

// ============================================
// 💡 PRO TIPS
// ============================================

// 1. Always use theme values, never hardcode
❌ const padding = 16;
✅ const padding = theme.spacing.lg;

// 2. Use semantic color names
❌ color: "#FF0000"
✅ color: theme.colors.danger

// 3. Use Text variants for hierarchy
❌ <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
✅ <Text variant="h3">

// 4. Use Spacer for consistent gaps
❌ marginBottom: 15
✅ <Spacer size="md" />

// 5. Combine utilities with StyleSheet
const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    ...theme.shadows.md,
  },
});

// ============================================
// 📞 FREQUENTLY ASKED QUESTIONS
// ============================================

Q: Where do I start?
A: Read app/UI_UPGRADE_GUIDE.md

Q: How do I use the theme?
A: Import it: import theme from '../config/theme'
   Then: theme.colors.primary, theme.spacing.md, etc.

Q: What if I need a custom color not in theme?
A: Add it to theme.js colors object, or pass hex directly to color prop

Q: Can I still use StyleSheet.create()?
A: Yes! Use it with theme values: { padding: theme.spacing.lg }

Q: How do I know what variant to use?
A: Check the component's variant options in the updated file

Q: Which files can I delete?
A: None! All old files are still there for backward compatibility

Q: What about existing custom styles?
A: Use commonStyles for reusable preset styles

Q: How to add new colors?
A: Edit theme.js colors object, then use: theme.colors.myNewColor

// ============================================
// 📈 BEFORE & AFTER
// ============================================

BEFORE:
<Screen style={{ backgroundColor: colors.light, paddingHorizontal: 10 }}>
  <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.dark }}>
    Title
  </Text>
  <View style={{ marginTop: 15 }} />
  <Button title="Click me" onPress={onPress} color="primary" />
</Screen>

AFTER:
<Screen paddingSize="lg">
  <Text variant="h2" color="textPrimary">Title</Text>
  <Spacer size="md" />
  <Button title="Click me" variant="primary" onPress={onPress} />
</Screen>

// ============================================
// 🚀 NEXT STEPS
// ============================================

1. [ ] Read the UPGRADE_GUIDE.md
2. [ ] Review theme.js to understand structure
3. [ ] Start using new components in new screens
4. [ ] Gradually migrate existing screens
5. [ ] Test on multiple screen sizes
6. [ ] Customize colors/spacing as needed

Enjoy your upgraded UI! 🎉
