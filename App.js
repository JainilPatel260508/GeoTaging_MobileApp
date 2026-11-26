import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddPlantation from './src/AddPlantation';
import { readRecords, addRecord } from './src/records';
import { Button, Coordinates, s } from './src/ui';

function dateLabel(record) {
  return new Date(record.createdAt).toLocaleString();
}

function Mapper() {
  const [records, setRecords] = useState([]);
  const [loadState, setLoadState] = useState('loading');
  const [screen, setScreen] = useState('home');
  const [selected, setSelected] = useState(null);
  const writing = useRef(false);

  async function load() {
    setLoadState('loading');
    try {
      setRecords(await readRecords(AsyncStorage));
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }
  useEffect(() => { load(); }, []);

  const back = useCallback(() => {
    if (screen === 'home') return false;
    if (!writing.current) setScreen('home');
    return true;
  }, [screen]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', back);
    return () => subscription.remove();
  }, [back]);

  async function save(record) {
    writing.current = true;
    try {
      setRecords(await addRecord(AsyncStorage, records, record));
      setScreen('home');
    } finally {
      writing.current = false;
    }
  }

  if (screen === 'add') return <AddPlantation onSave={save} onBack={back} />;
  if (screen === 'detail') return <ScrollView contentContainerStyle={s.content}>
    <Button secondary title="Back to records" onPress={back} />
    <Text accessibilityRole="header" style={s.title}>{selected.species}</Text>
    <View style={s.panel}>
      <Text style={s.label}>Hydro project or catchment</Text><Text style={s.body}>{selected.catchment}</Text>
      <Text style={s.label}>Number of saplings</Text><Text style={s.body}>{selected.count}</Text>
      <Text style={s.label}>Created</Text><Text style={s.body}>{dateLabel(selected)}</Text>
      <Text style={s.label}>Notes</Text><Text style={s.body}>{selected.notes || 'No notes recorded.'}</Text>
    </View>
    <Text style={s.heading}>Planting location</Text>
    <Coordinates location={selected} />
    <Text selectable style={s.body}>Record ID · {selected.id}</Text>
  </ScrollView>;

  return <FlatList contentContainerStyle={s.content} data={loadState === 'ready' ? records : []}
    keyExtractor={item => item.id}
    ListHeaderComponent={<View style={{ gap: 14 }}>
      <Text accessibilityRole="header" style={s.title}>Plantation Mapper</Text>
      {loadState === 'loading' && <ActivityIndicator accessibilityLabel="Loading saved records" />}
      {loadState === 'error' && <>
        <Text style={s.error}>Could not read saved records on this phone.</Text>
        <Button secondary title="Retry loading" onPress={load} />
      </>}
      {loadState === 'ready' && <>
        <Text style={s.body}>{records.length} saved {records.length === 1 ? 'record' : 'records'}</Text>
        <Button title="Add plantation" onPress={() => setScreen('add')} />
      </>}
    </View>}
    ListEmptyComponent={loadState === 'ready' && <Text style={s.body}>Your first planting location will appear here.</Text>}
    renderItem={({ item }) => <Pressable accessibilityRole="button" style={({ pressed }) => [s.panel, pressed && s.pressed]}
      onPress={() => { setSelected(item); setScreen('detail'); }}>
      <Text style={s.heading}>{item.species}</Text>
      <Text style={s.body}>{item.catchment} · {item.count} {item.count === 1 ? 'sapling' : 'saplings'}</Text>
      <Text style={s.body}>{dateLabel(item)}</Text>
    </Pressable>} />;
}

export default function App() {
  return <SafeAreaProvider><SafeAreaView style={s.screen}>
    <StatusBar barStyle="dark-content" /><Mapper />
  </SafeAreaView></SafeAreaProvider>;
}
