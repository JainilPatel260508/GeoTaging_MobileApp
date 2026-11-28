import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlantationMap from './src/PlantationMap';
import PlantationPhoto from './src/PlantationPhoto';
import { discardCapture, photoFiles } from './src/photos';
import AddPlantation from './src/AddPlantation';
import { readRecords, addRecord, saveWithPhoto, searchRecords, validCoordinates, catchmentName, summarizeCatchments } from './src/records';
import { Button, Coordinates, s } from './src/ui';

function dateLabel(record) {
  return new Date(record.createdAt).toLocaleString();
}

function Mapper() {
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState('');
  const [loadState, setLoadState] = useState('loading');
  const [screen, setScreen] = useState('home');
  const [catchmentKey, setCatchmentKey] = useState(null);
  const [detailOrigin, setDetailOrigin] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const selected = records.find(record => record.id === selectedId);
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
    if (writing.current) return true;
    if (screen === 'detail') setScreen(detailOrigin);
    else if (screen === 'catchment') setScreen('summary');
    else setScreen('home');
    return true;
  }, [screen, detailOrigin]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', back);
    return () => subscription.remove();
  }, [back]);

  async function save(record, capture) {
    writing.current = true;
    try {
      const updated = capture ? await saveWithPhoto(AsyncStorage, photoFiles, records, record, capture)
        : await addRecord(AsyncStorage, records, record);
      setRecords(updated);
      setQuery('');
      setScreen('home');
    } finally {
      writing.current = false;
    }
  }

  async function replacePhoto(capture) {
    writing.current = true;
    try {
      setRecords(await saveWithPhoto(AsyncStorage, photoFiles, records, selected, capture));
    } finally {
      discardCapture(capture);
      writing.current = false;
    }
  }

  function openDetail(id) {
    setSelectedId(id);
    setDetailOrigin(screen);
    setScreen('detail');
  }

  function renderRecord({ item }) {
    return <Pressable accessibilityRole="button" style={({ pressed }) => [s.panel, pressed && s.pressed]}
      onPress={() => openDetail(item.id)}>
      <Text style={s.heading}>{item.species}</Text>
      <Text style={s.body}>{catchmentName(item)} · {item.count} {item.count === 1 ? 'sapling' : 'saplings'}</Text>
      <Text style={s.body}>{dateLabel(item)}</Text>
    </Pressable>;
  }

  if (screen === 'summary' || screen === 'catchment') {
    const groups = summarizeCatchments(records);
    const group = screen === 'catchment' && groups.find(item => item.key === catchmentKey);
    return <FlatList key={screen} contentContainerStyle={s.content} data={group ? group.records : groups}
      keyExtractor={item => group ? item.id : item.key}
      ListHeaderComponent={<View style={{ gap: 14 }}>
        <Button secondary title={group ? 'Back to summary' : 'Back to Home'} onPress={back} />
        <Text accessibilityRole="header" style={s.title}>{group ? group.name : 'Catchment summary'}</Text>
      </View>}
      ListEmptyComponent={<Text style={s.body}>Save a plantation to see catchment totals here.</Text>}
      renderItem={group ? renderRecord : ({ item }) => <Pressable accessibilityRole="button"
        style={({ pressed }) => [s.panel, pressed && s.pressed]}
        onPress={() => { setCatchmentKey(item.key); setScreen('catchment'); }}>
        <Text style={s.heading}>{item.name}</Text>
        <Text style={s.body}>{item.records.length} {item.records.length === 1 ? 'record' : 'records'} · {item.total} {item.total === 1 ? 'sapling' : 'saplings'}</Text>
      </Pressable>} />;
  }

  if (screen === 'map') return <PlantationMap records={records} onBack={back}
    onAdd={() => setScreen('add')} onOpen={openDetail} />;
  if (screen === 'add') return <AddPlantation onSave={save} onBack={back} />;
  if (screen === 'detail') return <ScrollView contentContainerStyle={s.content}>
    <Button secondary title={detailOrigin === 'map' ? 'Back to map' : detailOrigin === 'catchment' ? 'Back to catchment' : 'Back to records'} onPress={back} />
    <Text accessibilityRole="header" style={s.title}>{selected.species}</Text>
    <View style={s.panel}>
      <Text style={s.label}>Hydro project or catchment</Text><Text style={s.body}>{catchmentName(selected)}</Text>
      <Text style={s.label}>Number of saplings</Text><Text style={s.body}>{selected.count}</Text>
      <Text style={s.label}>Created</Text><Text style={s.body}>{dateLabel(selected)}</Text>
      <Text style={s.label}>Notes</Text><Text style={s.body}>{selected.notes || 'No notes recorded.'}</Text>
    </View>
    <Text style={s.heading}>Planting location</Text>
    {validCoordinates(selected) ? <Coordinates location={selected} /> : <Text style={s.body}>Coordinates unavailable.</Text>}
    <PlantationPhoto existing uri={selected.photoUri} onCapture={replacePhoto} />
    <Text selectable style={s.body}>Record ID · {selected.id}</Text>
  </ScrollView>;

  const matches = searchRecords(records, query);
  const searching = query.trim().length > 0;
  return <FlatList contentContainerStyle={s.content} data={loadState === 'ready' ? matches : []}
    keyboardShouldPersistTaps="handled"
    keyExtractor={item => item.id}
    ListHeaderComponent={<View style={{ gap: 14 }}>
      <Text accessibilityRole="header" style={s.title}>Plantation Mapper</Text>
      {loadState === 'loading' && <ActivityIndicator accessibilityLabel="Loading saved records" />}
      {loadState === 'error' && <>
        <Text style={s.error}>Could not read saved records on this phone.</Text>
        <Button secondary title="Retry loading" onPress={load} />
      </>}
      {loadState === 'ready' && <>
        <Button title="Add plantation" onPress={() => setScreen('add')} />
        <Button secondary title="View map" onPress={() => setScreen('map')} />
        <Button secondary title="Catchment summary" onPress={() => setScreen('summary')} />
        {records.length > 0 && <View style={{ gap: 6 }}>
          <Text style={s.label}>Search species or catchment</Text>
          <TextInput accessibilityLabel="Search species or catchment" style={s.input}
            autoCapitalize="none" autoCorrect={false} value={query} onChangeText={setQuery} />
          {query.length > 0 && <Button secondary title="Clear" onPress={() => setQuery('')} />}
        </View>}
        <Text style={s.body} accessibilityLiveRegion="polite">
          {searching ? `${matches.length} of ${records.length}` : `${records.length} saved`} {records.length === 1 ? 'record' : 'records'}
        </Text>
      </>}
    </View>}
    ListEmptyComponent={loadState === 'ready' && <Text style={s.body}>
      {records.length ? 'No matching plantations' : 'Your first planting location will appear here.'}
    </Text>}
    renderItem={renderRecord} />;
}

export default function App() {
  return <SafeAreaProvider><SafeAreaView style={s.screen}>
    <StatusBar barStyle="dark-content" /><Mapper />
  </SafeAreaView></SafeAreaProvider>;
}
