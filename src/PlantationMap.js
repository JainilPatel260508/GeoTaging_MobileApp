import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';
import OpenStreetMap from './OpenStreetMap';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { groupLocations } from './mapLocations';
import { Button, s } from './ui';

const padding = { top: 48, right: 48, bottom: 48, left: 48 };

function localRegion(coordinate) {
  return { ...coordinate, latitudeDelta: 0.012, longitudeDelta: 0.012 };
}

export default function PlantationMap({ records, onBack, onAdd, onOpen }) {
  const googleMaps = Constants.executionEnvironment === 'storeClient' || Constants.expoConfig?.extra?.useGoogleMaps;
  const groups = useMemo(() => groupLocations(records), [records]);
  const [selectedKey, setSelectedKey] = useState(null);
  const selected = groups.find(group => group.key === selectedKey);
  const map = useRef(null);
  const [ready, setReady] = useState(false);
  const [laidOut, setLaidOut] = useState(false);
  useEffect(() => {
    if (!ready || !laidOut || !groups.length) return;
    if (groups.length === 1) map.current?.animateToRegion(localRegion(groups[0].coordinate), 0);
    else map.current?.fitToCoordinates(groups.map(group => group.coordinate), { edgePadding: padding, animated: false });
  }, [groups, ready, laidOut]);

  return <View style={s.screen}>
    <View style={{ padding: 16, gap: 8 }}>
      <Button secondary title="Back to records" onPress={onBack} />
      <Text accessibilityRole="header" style={s.heading}>Plantation map</Text>
    </View>
    {groups.length === 0 ? <View style={s.content}>
      <Text style={s.body}>No geotagged plantations yet.</Text>
      <Button title="Add plantation" onPress={onAdd} />
    </View> : <>
      {googleMaps ? <MapView ref={map} provider={PROVIDER_GOOGLE} style={{ flex: 1 }}
        initialRegion={localRegion(groups[0].coordinate)} moveOnMarkerPress={false}
        toolbarEnabled={false} showsUserLocation={false} showsMyLocationButton={false}
        onMapReady={() => setReady(true)}
        onLayout={({ nativeEvent: { layout } }) => setLaidOut(layout.width > 0 && layout.height > 0)}>
        {groups.map(group => <Marker key={group.key} coordinate={group.coordinate}
          accessibilityLabel={group.records.map(record => record.species + ', ' + record.catchment).join('; ')}
          onPress={() => setSelectedKey(group.key)} />)}
      </MapView> : <OpenStreetMap groups={groups} onSelect={setSelectedKey} />}
      {selected && <ScrollView style={{ flexGrow: 0, maxHeight: '40%' }} contentContainerStyle={{ padding: 12, gap: 8 }}>
        {selected.records.map(record => <View key={record.id} style={s.panel}>
          <Text style={s.label}>{record.species} · {record.catchment}</Text>
          <Text style={s.body}>{new Date(record.createdAt).toLocaleString()} · {record.id}</Text>
          <Button title="Open details" onPress={() => onOpen(record.id)} />
        </View>)}
      </ScrollView>}
    </>}
  </View>;
}
