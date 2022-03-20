import { VFC, useState } from 'react';
import { LatLng } from 'leaflet';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import { getAltitude, AltitudeDetail } from './utils/altitude';

type propType = {
  altitude?: AltitudeDetail;
  setAltitude: React.Dispatch<React.SetStateAction<AltitudeDetail | undefined>>;
};

/**
 * 位置表示アイコン
 * ・クリックした位置にアイコン表示する
 * ・位置から標高を取得し、情報表示エリアに引き渡す(state経由)
 */
const LocationMarker: VFC<propType> = ({ setAltitude, altitude }) => {
  const [position, setPosition] = useState<LatLng | null>(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      const { lat, lng } = e.latlng;
      // 標高を取得
      getAltitude(lat, lng, (alt, altDetail) => {
        console.log(`標高:${alt}m`);
        console.log(`緯度:${altDetail?.pos.lat} 経度:${altDetail?.pos.lng}`);
        setAltitude(altDetail);
      });
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>{`Alt(${(altitude?.h ?? 0).toFixed(1) + 'm'}) ${position}`}</Popup>
    </Marker>
  );
};

export default LocationMarker;
