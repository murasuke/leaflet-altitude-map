import { VFC, useEffect, useCallback } from 'react';
import { LatLng } from 'leaflet';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { getAltitude, AltitudeDetail, setAltState } from './utils/altitude';

type propType = {
  altitude: AltitudeDetail;
  setAltitude: setAltState;
};

/**
 * 位置表示アイコン
 * ・クリックした位置にアイコン表示する
 * ・位置から標高を取得し、位置表示エリアに引き渡す(state経由)
 * ・親から渡された位置が変わった場合、標高を再取得する
 */
const LocationMarker: VFC<propType> = ({ altitude, setAltitude }) => {
  const { pos } = altitude;
  const callback = useCallback((e) => setAltitude(e), [setAltitude]);
  const position = new LatLng(pos.lat, pos.lng);
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      // クリックされた位置の標高を取得
      getAltitude(lat, lng, (alt, altDetail) => {
        console.log(`標高:${alt}m`);
        console.log(`緯度:${pos.lat} 経度:${pos.lng}`);
        if (altDetail) {
          setAltitude(altDetail);
        }
      });
    },
  });

  // 親から渡された位置が変わった場合、標高を再取得
  useEffect(() => {
    getAltitude(pos.lat, pos.lng, (alt, altDetail) => {
      if (altDetail) {
        callback(altDetail);
      }
    });
  }, [pos.lat, pos.lng, callback]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>{`Alt(${(altitude?.h ?? 0).toFixed(1) + 'm'}) ${position}`}</Popup>
    </Marker>
  );
};

export default LocationMarker;
