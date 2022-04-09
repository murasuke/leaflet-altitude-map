import { VFC } from 'react';
import { useMap } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import ReactTooltip from 'react-tooltip';
import { BiCurrentLocation } from 'react-icons/bi';
import { setLocationState } from './utils/altitude';
import { iconSize } from './utils/const';

type propType = {
  setLocation: setLocationState;
};

/**
 * GPSアイコン
 * ・現在位置を取得
 * ・マップを移動する
 */
const GPS: VFC<propType> = ({ setLocation }) => {
  const map = useMap();

  // 現在位置を取得してマップを移動する
  const onclick = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      map.flyTo([lat, lng], 14);
      setLocation({ lat, lng });
    });
  };

  return (
    <Control
      position="topleft"
      style={{ backgroundColor: '#FFF', height: iconSize }}
    >
      <div data-tip={'現在位置へ移動'}>
        <BiCurrentLocation size={iconSize} onClick={() => onclick()} />
        <ReactTooltip type="info" place="right" />
      </div>
    </Control>
  );
};

export default GPS;
