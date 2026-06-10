import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '../config/i18n';
import colors from '../config/colors';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const getBaseLanguage = (lng) => String(lng || 'en').split('-')[0].toLowerCase();
  const [currentLanguage, setCurrentLanguage] = useState(
    getBaseLanguage(i18n.resolvedLanguage || i18n.language)
  );

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(getBaseLanguage(lng));
    };

    i18n.on('languageChanged', handleLanguageChanged);
    setCurrentLanguage(getBaseLanguage(i18n.resolvedLanguage || i18n.language));

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const toggleLanguage = async () => {
    const newLng = currentLanguage === 'en' ? 'fr' : 'en';
    // Use helper to change language and persist selection
    await setAppLanguage(newLng);
    setCurrentLanguage(getBaseLanguage(newLng));
  };

  const nextLanguageLabel = useMemo(
    () => (currentLanguage === 'en' ? 'FR' : 'EN'),
    [currentLanguage]
  );

  return (
    <TouchableOpacity style={styles.container} onPress={toggleLanguage}>
      <Text style={styles.text}>
        {nextLanguageLabel}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary || '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});
