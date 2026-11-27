import React, { useMemo } from 'react';
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import assets from './leaflet.generated';

const copyright = 'https://www.openstreetmap.org/copyright';
const project = 'https://github.com/JainilPatel260508/GeoTaging_MobileApp';

export default function OpenStreetMap({ groups, onSelect }) {
  const source = useMemo(() => {
    const points = groups.map(({ coordinate }) => [coordinate.latitude, coordinate.longitude]);
    // Only validated numeric coordinates enter the local HTML document.
    const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https://tile.openstreetmap.org data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
      <style>${assets.css}html,body,#map{height:100%;margin:0}</style></head>
      <body><div id="map"></div><!-- ${assets.license} --><script>${assets.script}
      </script><script>
      const points = ${JSON.stringify(points)};
      const map = L.map('map');
      map.attributionControl.setPrefix(false);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '© <a href="${copyright}">OpenStreetMap contributors</a>'
      }).addTo(map);
      points.forEach((point, index) => L.circleMarker(point, {
        radius: 10, color: '#fff', weight: 2, fillColor: '#23583e', fillOpacity: 1
      }).addTo(map).on('click', () => window.ReactNativeWebView.postMessage(String(index))));
      if (points.length === 1) map.setView(points[0], 16);
      else map.fitBounds(points, {padding: [32,32], maxZoom: 18});
      </script></body></html>`;
    return { html, baseUrl: project + '/' };
  }, [groups]);

  return <WebView source={source} style={{ flex: 1 }} originWhitelist={['https://*', 'about:blank']}
    applicationNameForUserAgent="PlantationMapper/1.0" allowFileAccess={false}
    onShouldStartLoadWithRequest={({ url }) => {
      if (url === copyright) Linking.openURL(url).catch(() => {});
      return url === 'about:blank' || url === source.baseUrl;
    }}
    onMessage={({ nativeEvent }) => {
      const group = groups[Number(nativeEvent.data)];
      if (group) onSelect(group.key);
    }} />;
}
