import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export default function Reports() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Reports Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, justifyContent: 'center', alignItems: 'center' },
  text: { color: colors.text, fontSize: 18 }
});
