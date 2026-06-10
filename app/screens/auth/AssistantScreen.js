import React from 'react';
import { StyleSheet, View } from 'react-native';

import Screen from '../../components/Screen';
import useAuth from '../../auth/useAuth';
import AIPopup from '../../components/chatboot/AIPopup';

function AssistantScreen({ navigation }) {
  const { user } = useAuth();

  return (
    <Screen style={styles.screen} scrollable={false}>
      <View style={styles.container}>
        <AIPopup
          visible
          onClose={() => navigation.goBack()}
          user={user}
          onNavigate={(routeName, params) => navigation.navigate(routeName, params)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default AssistantScreen;
