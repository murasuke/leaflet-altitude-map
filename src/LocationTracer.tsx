import { VFC, useState, useRef } from 'react';
import { useMap, Polyline } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { BsRecordCircle } from 'react-icons/bs';
import { distance } from './utils/distance';

const PositionTracer: VFC = () => {
  const iconSize = '30px';
  const [recordPosArray, setRecordPosArray] = useState<[number, number][]>([]);
  const [redording, setRecording] = useState(false);
  const map = useMap();
  const timerId = useRef<NodeJS.Timer | number>(null!);

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
        return [...ary, [latitude, longitude]];
      });
    });
  };

  // 現在位置を取得してマップを移動すると共に、標高の再表示を行う
  const onclick = () => {
    if (!redording) {
      //setPosArray([]);
      recordPosition();
      timerId.current = setInterval(recordPosition, 3000);
    } else {
      clearInterval(timerId.current as NodeJS.Timer);
      timerId.current = 0;
    }
    setRecording(!redording);
  };

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
    </>
  );
};

export default PositionTracer;
