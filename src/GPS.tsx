import { VFC } from 'react';
import { useMap } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { BiCurrentLocation } from 'react-icons/bi';
import { setLocationState } from './utils/altitude';

type propType = {
  setLocation: setLocationState;
};

/**
 * GPSアイコン
 * ・現在位置を取得
 * ・マップを移動する
 */
const GPS: VFC<propType> = ({ setLocation }) => {
  const iconSize = '30px';
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
      <BiCurrentLocation size={iconSize} onClick={() => onclick()} />
    </Control>
  );
};

export default GPS;
