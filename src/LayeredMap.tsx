import { FC } from 'react';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { baseLayers, overlayLayers } from './utils/layerList';
import { MapParam } from './utils/useMapParams';

/**
 * 地図表示、選択コントロール
 * ・baseLayer(複数の地図から1つを選択)
 * ・overlayLayer(baseLayerに重ねて表示)
 * ※表示する地図の詳細情報は「./utils/layerList」に設定する
 * @param param0
 * @returns
 */
const LayeredMap: FC<MapParam> = ({
  center,
  children,
  overlay,
  zoom,
  mapIndex,
}) => {
  return (
    <MapContainer center={center} zoom={zoom}>
      <Control position="topright">
        <LayersControl>
          {baseLayers.map((map, index) => (
            <LayersControl.BaseLayer
              checked={index === mapIndex}
              name={map.name}
              key={map.name}
            >
              <TileLayer attribution={map.attribution} url={map.url} />
            </LayersControl.BaseLayer>
          ))}
          {overlayLayers.map((map, index) => (
            <LayersControl.Overlay
              checked={overlay && overlay.length > index && overlay[index]}
              name={map.name}
              key={map.name}
            >
              <TileLayer
                attribution={map.attribution}
                url={map.url}
                opacity={map.opacity}
              />
            </LayersControl.Overlay>
          ))}
        </LayersControl>
      </Control>

      {children}
    </MapContainer>
  );
};

export default LayeredMap;
