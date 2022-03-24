import { VFC, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { BsRecordCircle } from 'react-icons/bs';
import { distance } from './utils/distance';

type propType = {
  setPosArray: React.Dispatch<React.SetStateAction<[number, number][]>>;
};

const RecordPosition: VFC<propType> = ({ setPosArray }) => {
  const iconSize = '30px';
  const map = useMap();
  const timerId = useRef<NodeJS.Timer | number>(null!);
  const [redording, setRecording] = useState(false);

  const recordPosition = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      map.flyTo([latitude, longitude], map.getZoom());
      setPosArray((ary) => {
        if (ary.length > 0) {
          const [lastLat, lastLng] = ary.slice(-1)[0];
          if (distance(lastLat, lastLng, latitude, longitude) < 5 / 1000) {
            // 移動距離が5m未満の場合追加しない
            return ary;
          }
        }

        const cpy = ary.slice();
        cpy.push([latitude, longitude]);
        return cpy;
      });
    });
  };

  // 現在位置を取得してマップを移動すると共に、標高の再表示を行う
  const onclick = () => {
    if (!redording) {
      console.log('start timer');
      //setPosArray([]);
      setRecording(true);
      recordPosition();
      timerId.current = setInterval(recordPosition, 3000);
    } else {
      console.log('stop timer');
      setRecording(false);
      clearInterval(timerId.current as NodeJS.Timer);
      timerId.current = 0;
    }
  };

  return (
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
  );
};

export default RecordPosition;
