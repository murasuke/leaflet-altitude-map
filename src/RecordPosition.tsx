import { VFC, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { BsRecordCircle } from 'react-icons/bs';

type propType = {
  setPosArray: React.Dispatch<React.SetStateAction<[number, number][]>>;
};

const RecordPosition: VFC<propType> = ({ setPosArray }) => {
  const iconSize = '30px';
  const timerId = useRef<NodeJS.Timer | number>(null!);
  const [redording, setRecording] = useState(false);

  const positionRecordTimer = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      console.log(pos);
      setPosArray((ary) => {
        const cpy = ary.slice();
        cpy.push([pos.coords.latitude, pos.coords.longitude]);
        return cpy;
      });
      // localStorage.setItem(
      //   pos.timestamp.toString(),
      //   JSON.stringify(pos.coords),
      // );
    });
  };

  // 現在位置を取得してマップを移動すると共に、標高の再表示を行う
  const onclick = () => {
    if (!timerId.current) {
      console.log('start timer');
      setRecording(true);
      timerId.current = setInterval(positionRecordTimer, 10000);
    } else {
      console.log('stop timer');
      setRecording(false);
      setPosArray([]);
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
        color={redording ? 'red' : 'black'}
        size={iconSize}
        onClick={() => onclick()}
      />
    </Control>
  );
};

export default RecordPosition;
