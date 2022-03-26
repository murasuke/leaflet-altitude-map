import { VFC, useState, useEffect } from 'react';
import { LatLng } from 'leaflet';
import { ScaleControl } from 'react-leaflet';
import './utils/initLeaflet';
import { AltitudeDetail } from './utils/altitude';
import LayredMap from './LayeredMap';
import LocationIndicator from './LocationIndicator';
import LocationMarker from './LocationMarker';
import GPS from './GPS';
import LocationTracer from './LocationTracer';

import 'leaflet/dist/leaflet.css';
import './App.css';

/**
 * 地図表示
 * ・上記で作成した「情報エリア」「位置表示アイコン」を表示する
 * ・位置情報をstateで保持する。値を更新するためLocationMakerに更新メソッドを引き渡す
 * ・初期表示時、現在位置を取得してstateを更新する
 */
const App: VFC = () => {
  const [altitude, setAltitude] = useState<AltitudeDetail>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((e) => {
      const position = new LatLng(e.coords.latitude, e.coords.longitude);
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
      <LayredMap center={altitude.pos}>
        <LocationMarker altitude={altitude} setAltitude={setAltitude} />
        <LocationIndicator altitude={altitude} />
        <GPS setAltitude={setAltitude} />
        <LocationTracer />
        <ScaleControl />
      </LayredMap>
    );
  }
};
export default App;
