import { VFC, useState, useRef, useEffect } from 'react';
import { Popup as PopupRef, Marker as MarkerRef } from 'leaflet';
import { useMap, Polyline, Marker, Popup } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { FaSearchLocation } from 'react-icons/fa';
import { normalize } from '@geolonia/normalize-japanese-addresses';
import { setLocationState } from './utils/altitude';

type MEvent = React.MouseEvent<HTMLDivElement | SVGElement, MouseEvent>;
type propType = {
  setLocation: setLocationState;
};

const SearchLocation: VFC<propType> = ({ setLocation }) => {
  const iconSize = '30px';
  const regexp = /^\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*$/;
  const [enter, setEnter] = useState(false);
  const [address, setAddress] = useState('');
  const map = useMap();

  const onMouseEnter = (e: MEvent) => {
    console.log(e.currentTarget.getBoundingClientRect());

    setEnter(true);
  };

  const onMouseLeave = (e: MEvent) => {
    console.log(e.currentTarget.getBoundingClientRect());
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width &&
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height
    ) {
      return;
    }

    setEnter(false);
  };

  const onClick = () => {
    const result = regexp.exec(address);
    if (result) {
      const [all, lat, lng] = result;
      const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };
      map.flyTo(latLng, 14);
      setLocation(latLng);
      setAddress('');
    }

    normalize(address).then((result) => {
      console.log(address);
      const { lat, lng } = result;
      if (lat && lng) {
        map.flyTo({ lat, lng }, 14);
        setLocation({ lat, lng });
        setAddress('');
      }
    });
  };

  return (
    <Control
      position="topleft"
      style={{ backgroundColor: '#FFF', height: iconSize }}
    >
      <div
        onMouseEnter={(e) => onMouseEnter(e)}
        onMouseLeave={(e) => onMouseLeave(e)}
      >
        {!enter ? (
          <FaSearchLocation size={iconSize} />
        ) : (
          <div className="search-location">
            <input
              type="text"
              value={address}
              size={40}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onClick()}
            />

            <button onClick={() => onClick()}>検索</button>
          </div>
        )}
      </div>
    </Control>
  );
};

export default SearchLocation;
