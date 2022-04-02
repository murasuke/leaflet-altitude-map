import { VFC, useState, useEffect } from 'react';
import { LatLngLiteral } from 'leaflet';
import { ScaleControl } from 'react-leaflet';
import './utils/initLeaflet';

import LayredMap from './LayeredMap';
import LocationMarker from './LocationMarker';
import LocationDispArea from './LocationDispArea';
import GPS from './GPS';
import LocationTracer from './LocationTracer';
import ClickMeasure from './ClickMeasure';
import SearchLocation from './SearchLocation';

import 'leaflet/dist/leaflet.css';
import './App.css';

/**
 * 地図表示
 * ・上記で作成した「情報エリア」「位置表示アイコン」を表示する
 * ・位置情報をstateで保持する。値を更新するためLocationMakerに更新メソッドを引き渡す
 * ・初期表示時、現在位置を取得してstateを更新する
 */
const App: VFC = () => {
  const [location, setLocation] = useState<LatLngLiteral>();
  const [measureMode, setMeasureMode] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((e) => {
      const { latitude: lat, longitude: lng } = e.coords;
      setLocation({ lat, lng });
    });
  }, []);

  return !location ? null : (
    <LayredMap center={location}>
      {!measureMode && (
        <LocationMarker location={location} setLocation={setLocation} />
      )}
      <LocationDispArea location={location} />
      <GPS setLocation={setLocation} />
      <LocationTracer />

      <ClickMeasure
        location={location}
        setLocation={setLocation}
        measureMode={measureMode}
        setMeasureMode={setMeasureMode}
      />

      <SearchLocation setLocation={setLocation} />

      <ScaleControl />
    </LayredMap>
  );
};
export default App;
