import { VFC } from 'react';
import { AltitudeDetail } from './utils/altitude';

/**
 * 情報表示エリア
 * ・クリックした位置の「標高」「緯度」「経度」を表示するエリア
 * ・propsで受け取った値を表示する
 */
const AltitudeArea: VFC<{ altitude?: AltitudeDetail }> = ({ altitude }) => {
  const f = (num: number, fixed = 7) =>
    ('             ' + num.toFixed(fixed)).slice(-6 - fixed);
  const formatAlt = (alt: AltitudeDetail) =>
    `標高:${f(alt.h ?? 0, alt.fixed)}m\n緯度:${f(alt.pos.lat)}\n経度:${f(
      alt.pos.lng,
    )}`;

  return (
    <div className={'leaflet-top leaflet-right'}>
      <div
        className="leaflet-control leaflet-bar"
        style={{ width: '200px', backgroundColor: 'Lavender' }}
      >
        <pre className="coords">{altitude ? formatAlt(altitude) : ''}</pre>
      </div>
    </div>
  );
};

export default AltitudeArea;
