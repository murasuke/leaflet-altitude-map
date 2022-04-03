import { VFC, useState } from 'react';
import { useMap } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { FaSearchLocation } from 'react-icons/fa';
import { normalize } from '@geolonia/normalize-japanese-addresses';
import { setLocationState } from './utils/altitude';

type MEvent = React.MouseEvent<HTMLDivElement | SVGElement, MouseEvent>;
type propType = {
  setLocation: setLocationState;
};

/**
 * 住所を検索しその場所へ移動する。
 * ・緯度,経度 を入力した場合、その場所へ移動する(googlemapでコピーした経緯を貼り付け)
 * https://github.com/geolonia/normalize-japanese-addresses
 * @param param0
 * @returns
 */
const SearchLocation: VFC<propType> = ({ setLocation }) => {
  const iconSize = '30px';
  const regexp = /^\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*$/;
  const [address, setAddress] = useState('');
  const map = useMap();
  const onClick = () => {
    const result = regexp.exec(address);
    if (result) {
      const [all, lat, lng] = result;
      const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };
      map.flyTo(latLng, 14);
      setLocation(latLng);
    }

    normalize(address).then((result) => {
      const { lat, lng } = result;
      if (lat && lng) {
        map.flyTo({ lat, lng }, 14);
        setLocation({ lat, lng });
      }
    });
  };

  return (
    <Control position="topleft" style={{ backgroundColor: '#FFF' }}>
      <div className="search-location" style={{ height: iconSize }}>
        <FaSearchLocation className="search-location-icon" size={iconSize} />
        <div className="search-location-input">
          <input
            type="text"
            value={address}
            size={40}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
          />

          <button onClick={() => onClick()}>検索</button>
        </div>
      </div>
    </Control>
  );
};

export default SearchLocation;
