import React, { useEffect, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import * as Picker from 'expo-image-picker';
import { discardCapture } from './photos';
import { Button, s } from './ui';

export default function PlantationPhoto({ uri, onCapture, onRemove, disabled, onBusyChange, existing }) {
  const [failedUri, setFailedUri] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function takePhoto() {
    if (lock.current || disabled) return;
    lock.current = true;
    setBusy(true);
    onBusyChange?.(true);
    setError('');
    try {
      const permission = await Picker.requestCameraPermissionsAsync();
      if (!mounted.current) return;
      if (!permission.granted) {
        setError(permission.canAskAgain ? 'Camera permission denied. Tap again to retry.'
          : 'Allow camera access in Android app settings, then try again.');
        return;
      }
      const result = await Picker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (result.canceled) return;
      const capture = result.assets[0].uri;
      if (mounted.current) await onCapture(capture);
      else discardCapture(capture);
    } catch {
      if (mounted.current) setError('Could not capture or save the photo. Please try again.');
    } finally {
      lock.current = false;
      if (mounted.current) {
        setBusy(false);
        onBusyChange?.(false);
      }
    }
  }

  const available = uri && uri !== failedUri;
  let title = existing ? 'Add photo' : 'Take photo';
  if (available) title = existing ? 'Replace photo' : 'Retake photo';
  return <View style={{ gap: 8 }}>
    <Text style={s.label}>Plantation photo (optional)</Text>
    {!!available && <Image key={uri} source={{ uri }} accessibilityLabel="Plantation photo"
      style={{ width: '100%', height: 240 }} resizeMode="contain" onError={() => setFailedUri(uri)} />}
    {!!uri && !available && <Text style={s.body}>Photo unavailable. You can attach another.</Text>}
    <Button secondary title={busy ? 'Camera in progress…' : title} onPress={takePhoto} disabled={disabled || busy} />
    {!!uri && onRemove && <Button secondary title="Remove photo" onPress={onRemove} disabled={disabled || busy} />}
    {!!error && <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
  </View>;
}
