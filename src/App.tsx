import { VFC, useState, useEffect } from 'react';
import { LatLng } from 'leaflet';
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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((e) => {
      let position = new LatLng(e.coords.latitude, e.coords.longitude);
      setAltitude({
        fixed: 0,
        h: 0,
        pos: { ...position, zoom: 14 },
        title: '',
        type: '',
      });
    });
  }, []);

  if (!altitude) {
    return <></>;
  } else {
    return (
      <MapContainer center={altitude.pos} zoom={14}>
        <TileLayer
          attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
          url="https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
        />
        <AltitudeArea altitude={altitude} />
        <LocationMarker
          initPos={new LatLng(altitude.pos.lat, altitude.pos.lng)}
          altitude={altitude}
          setAltitude={setAltitude}
        />
      </MapContainer>
    );
  }
};
export default App;
