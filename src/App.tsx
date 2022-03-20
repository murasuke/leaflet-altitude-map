import { VFC, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import './utils/initLeaflet';
import { AltitudeDetail } from './utils/altitude';
import AltitudeArea from './AltitudeArea';
import LocationMarker from './LocationMarker';

import 'leaflet/dist/leaflet.css';
import './App.css';

/**
 * 地図表示
 * ・上記で作成した「情報エリア」「位置表示アイコン」を表示する
 * ・位置情報をstateで保持する
 */
const App: VFC = () => {
  const [altitude, setAltitude] = useState<AltitudeDetail>();

  return (
    <MapContainer center={{ lat: 35.3607411, lng: 138.727262 }} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
        url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
      />
      <AltitudeArea altitude={altitude} />
      <LocationMarker altitude={altitude} setAltitude={setAltitude} />
    </MapContainer>
  );
};
export default App;
