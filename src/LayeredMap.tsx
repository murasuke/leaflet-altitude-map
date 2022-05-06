import { FC } from 'react';
import { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, LayersControl } from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import { baseLayers, overlayLayers } from './utils/layerList';

type propType = {
  center: LatLngExpression;
  zoom?: number;
  mapIndex?: number;
  overlay?: boolean[];
};

const LayeredMap: FC<propType> = ({
  center,
  children,
  overlay,
  zoom = 14,
  mapIndex = 0,
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
