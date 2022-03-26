import { VFC, useEffect, useState } from 'react';
import { LatLngLiteral } from 'leaflet';

import Control from 'react-leaflet-custom-control';
import { getAltitude, AltitudeDetail } from './utils/altitude';

/**
 * 位置表示エリア
 * ・クリックした位置の「標高」「緯度」「経度」を表示するエリア
 * ・propsで受け取った値を表示する
 */
const LocationIndicator: VFC<{ location: LatLngLiteral }> = ({ location }) => {
  const f = (num: number, fixed = 6) =>
    ('             ' + num.toFixed(fixed)).slice(-6 - fixed);
  const formatAlt = (alt: AltitudeDetail) =>
    `標高:${f(alt.h ?? 0, alt.fixed)}m
緯度:${f(alt.pos.lat)}
経度:${f(alt.pos.lng)}`;

  const [altitude, setAlt] = useState<AltitudeDetail>();

  // 位置から標高を取得する
  useEffect(() => {
    getAltitude(location.lat, location.lng, (height, detail) => {
      setAlt(detail);
    });
  }, [location]);

  return (
    <Control position="topright">
      <div style={{ backgroundColor: 'Lavender' }}>
        <pre className="coords">{altitude ? formatAlt(altitude) : ''}</pre>
      </div>
    </Control>
  );
};

export default LocationIndicator;
