import { VFC } from 'react';
import { useMap } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { BiCurrentLocation } from 'react-icons/bi';

import { setAltState, getAltitude } from './utils/altitude';

type propType = {
  setAltitude: setAltState;
};

const GPS: VFC<propType> = ({ setAltitude }) => {
  const iconSize = '30px';
  const map = useMap();

  // 現在位置を取得してマップを移動すると共に、標高の再表示を行う
  const onclick = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      map.flyTo([latitude, longitude], map.getZoom());
      getAltitude(latitude, longitude, (alt, altDetail) => {
        if (altDetail) {
          setAltitude(altDetail);
        }
      });
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
