import { VFC, useState, useEffect, useCallback } from 'react';
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
 * ・位置から標高を取得し、情報表示エリアに引き渡す(state経由)
 */
const LocationMarker: VFC<propType> = ({ altitude, setAltitude }) => {
  const { pos } = altitude;
  const callback = useCallback((e) => setAltitude(e), [setAltitude]);
  const [position, setPosition] = useState<LatLng | null>(
    new LatLng(pos.lat, pos.lng),
  );
  useMapEvents({
    click(e) {
      // setPosition(e.latlng);
      const { lat, lng } = e.latlng;
      // 標高を取得
      getAltitude(lat, lng, (alt, altDetail) => {
        console.log(`標高:${alt}m`);
        console.log(`緯度:${pos.lat} 経度:${pos.lng}`);
        if (altDetail) {
          setAltitude(altDetail);
        }
      });
    },
  });

  useEffect(() => {
    setPosition(new LatLng(pos.lat, pos.lng));
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
