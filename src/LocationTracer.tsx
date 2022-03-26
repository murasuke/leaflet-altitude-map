import { VFC, useState, useRef, useEffect } from 'react';
import { Popup as LeafletPopup } from 'leaflet';
import { useMap, Polyline, Marker, Popup } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { BsRecordCircle } from 'react-icons/bs';
import { distance, polylineDistance } from './utils/distance';

const PositionTracer: VFC = () => {
  const iconSize = '30px';
  const [recordPosArray, setRecordPosArray] = useState<[number, number][]>([]);
  const [recording, setRecording] = useState(false);
  const map = useMap();
  const timerId = useRef<NodeJS.Timer | number>(null!);

  const markerRef = useRef<any>(null);
  const popRef = useRef<LeafletPopup>(null);

  const recordPosition = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;

      setRecordPosArray((ary) => {
        if (ary.length > 0) {
          const [lastLat, lastLng] = ary.slice(-1)[0];
          if (distance(lastLat, lastLng, latitude, longitude) < 5 / 1000) {
            // 移動距離が5m未満の場合追加しない
            return ary;
          }
        }
        map.flyTo([latitude, longitude]);
        if (ary.length > 1) {
          popRef.current?.openOn(map);
        }
        // popRef.current?.openOn(map);
        return [...ary, [latitude, longitude]];
      });
    });
  };

  // 現在位置を取得してマップを移動すると共に、標高の再表示を行う
  const onclick = () => {
    if (!recording) {
      recordPosition();
      markerRef.current.setOpacity(1);
      timerId.current = setInterval(recordPosition, 3000);
    } else {
      clearInterval(timerId.current as NodeJS.Timer);
      markerRef.current.setOpacity(0);
      timerId.current = 0;
    }
    setRecording(!recording);
  };

  useEffect(() => {
    // .tracer-marker { filter: hue-rotate(120deg) }
    markerRef.current.getElement().classList.add('tracer-marker');
    markerRef.current.setOpacity(0);
  }, []);

  return (
    <>
      <Control
        position="topleft"
        style={{ backgroundColor: '#FFF', height: iconSize }}
      >
        <BsRecordCircle
          color={timerId.current ? 'red' : 'black'}
          size={iconSize}
          onClick={() => onclick()}
        />
      </Control>

      <Polyline color="red" positions={recordPosArray} />

      <Marker
        draggable={false}
        position={
          recordPosArray.length ? recordPosArray.slice(-1)[0] : [35, 136]
        }
        ref={markerRef}
      >
        <Popup ref={popRef}>
          {polylineDistance(
            recordPosArray.map((item) => {
              return { lat: item[0], lng: item[1] };
            }),
          ).toFixed(3) + 'km'}
        </Popup>
      </Marker>
    </>
  );
};

export default PositionTracer;
