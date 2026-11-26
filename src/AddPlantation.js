import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Linking, ScrollView, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { canSave, makeRecord, validCoordinates, validCount } from './records';
import { Button, Coordinates, s } from './ui';

function Field({ label, value, onChangeText, multiline, numeric, disabled }) {
  return <View style={{ gap: 6 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText}
      editable={!disabled} keyboardType={numeric ? 'number-pad' : 'default'} multiline={multiline}
      style={[s.input, multiline && { minHeight: 88, textAlignVertical: 'top' }]} />
  </View>;
}

export default function AddPlantation({ onSave, onBack }) {
  const [form, setForm] = useState({ catchment: '', species: '', count: '1', notes: '' });
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [settings, setSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const captureLock = useRef(false);
  const saveLock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  function update(field, value) {
    setForm(previous => ({ ...previous, [field]: value }));
  }

  async function capture() {
    if (captureLock.current || saveLock.current) return;
    captureLock.current = true;
    Keyboard.dismiss();
    setLocating(true);
    setCoords(null);
    setError('');
    setSettings(false);
    let timer;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!mounted.current) return;
      if (!permission.granted) {
        setSettings(!permission.canAskAgain);
        setError(permission.canAskAgain ? 'Location permission was denied. Tap capture to try again.'
          : 'Allow location in app settings, return here, then tap capture again.');
        return;
      }
      if (!await Location.hasServicesEnabledAsync()) {
        if (mounted.current) setError('Turn on Location in Android settings, then tap capture again.');
        return;
      }
      if (!mounted.current) return;
      const fix = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Timeout')), 30000); }),
      ]);
      if (!validCoordinates(fix.coords)) throw new Error('Invalid coordinates');
      if (mounted.current) setCoords(fix.coords);
    } catch {
      if (mounted.current) setError('Could not get a location fix. Move into open sky and tap capture again.');
    } finally {
      clearTimeout(timer);
      captureLock.current = false;
      if (mounted.current) setLocating(false);
    }
  }

  async function save() {
    if (captureLock.current || saveLock.current || !canSave(form, coords)) return;
    saveLock.current = true;
    setSaving(true);
    setError('');
    try {
      await onSave(makeRecord(form, coords));
    } catch {
      setError('Could not save on this phone. Check available storage and try saving again.');
      saveLock.current = false;
      setSaving(false);
    }
  }

  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
    <Button title="Back to records" secondary disabled={saving} onPress={onBack} />
    <Text accessibilityRole="header" style={s.title}>Add Plantation</Text>
    <Field label="Hydro project or catchment name" value={form.catchment} onChangeText={v => update('catchment', v)} disabled={saving} />
    <Field label="Species" value={form.species} onChangeText={v => update('species', v)} disabled={saving} />
    <Field label="Number of saplings" value={form.count} numeric onChangeText={v => update('count', v)} disabled={saving} />
    {!validCount(form.count) && <Text style={s.error}>Enter a positive whole number.</Text>}
    <Field label="Notes (optional)" value={form.notes} multiline onChangeText={v => update('notes', v)} disabled={saving} />
    <Button secondary title={locating ? 'Getting location…' : 'Capture current location'} disabled={locating || saving} onPress={capture} />
    {locating && <ActivityIndicator accessibilityLabel="Getting location" color="#23583e" />}
    {coords && <Coordinates location={coords} />}
    {!!error && <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
    {settings && <Button secondary title="Open app settings" onPress={() => Linking.openSettings().catch(() => setError('Open Android Settings and allow location for this app.'))} />}
    <Button title={saving ? 'Saving…' : 'Save plantation'} disabled={saving || locating || !canSave(form, coords)} onPress={save} />
  </ScrollView>;
}
