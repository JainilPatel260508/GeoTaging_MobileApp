import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function Button({ title, onPress, disabled, secondary }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }}
      disabled={disabled} onPress={onPress}
      style={({ pressed }) => [s.button, secondary && s.secondary, disabled && s.disabled, pressed && s.pressed]}>
      <Text style={[s.buttonText, secondary && s.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

export function Coordinates({ location }) {
  return <View style={s.panel}>
    <Text style={s.label}>Latitude</Text><Text selectable style={s.coordinate}>{location.latitude.toFixed(6)}°</Text>
    <Text style={s.label}>Longitude</Text><Text selectable style={s.coordinate}>{location.longitude.toFixed(6)}°</Text>
    <Text style={s.body}>Accuracy · {Number.isFinite(location.accuracy) && location.accuracy >= 0
      ? location.accuracy.toFixed(1) + ' m' : 'Unavailable'}</Text>
  </View>;
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f7f0' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  title: { fontSize: 33, fontWeight: '700', color: '#193d30' },
  heading: { fontSize: 22, fontWeight: '700', color: '#193d30' },
  label: { fontSize: 16, fontWeight: '600', color: '#284838' },
  body: { fontSize: 17, lineHeight: 25, color: '#374b40' },
  coordinate: { fontSize: 19, color: '#173c2e', fontVariant: ['tabular-nums'] },
  panel: { padding: 16, gap: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#c6d3c5', borderRadius: 12 },
  input: { minHeight: 50, borderWidth: 1, borderColor: '#809687', borderRadius: 8, padding: 12,
    fontSize: 17, color: '#193d30', backgroundColor: '#fff' },
  button: { minHeight: 50, padding: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#23583e', borderRadius: 8 },
  secondary: { backgroundColor: '#e4ecdf' },
  buttonText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secondaryText: { color: '#244c33' },
  disabled: { backgroundColor: '#68796e' },
  pressed: { opacity: 0.75 },
  error: { color: '#8c3523', fontSize: 16 },
});
