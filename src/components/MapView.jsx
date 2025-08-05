import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CACHED_ICONS = {
  normal: null,
  selected: null
};

const createNormalIcon = () => {
  if (!CACHED_ICONS.normal) {
    CACHED_ICONS.normal = L.divIcon({
      className: 'normal-marker',
      html: '<div class="marker-dot normal-dot"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }
  return CACHED_ICONS.normal;
};

const createSelectedIcon = () => {
  if (!CACHED_ICONS.selected) {
    CACHED_ICONS.selected = L.divIcon({
      className: 'selected-marker',
      html: '<div class="marker-dot selected-dot"></div>',
      iconSize: [25, 25],
      iconAnchor: [12, 12]
    });
  }
  return CACHED_ICONS.selected;
};

function SmoothMapController({ selectedItem, previousSelectedItem }) {
  const map = useMap();
  const animationRef = useRef(null);
  
  useEffect(() => {
    const safeStopAnimation = () => {
      try {
        if (animationRef.current && map && map.stop) {
          map.stop();
        }
      } catch (error) {
        console.warn('Ошибка при остановке анимации карты:', error);
      } finally {
        animationRef.current = null;
      }
    };

    safeStopAnimation();

    if (selectedItem && selectedItem.lat && selectedItem.lon && map) {
      try {
        const currentZoom = map.getZoom();
        const targetZoom = currentZoom < 8 ? 10 : Math.max(currentZoom, 8);
        
        animationRef.current = map.flyTo(
          [selectedItem.lat, selectedItem.lon], 
          targetZoom,
          {
            duration: 1.2,
            easeLinearity: 0.1,
            animate: true,
            pan: {
              animate: true,
              duration: 1.2
            },
            zoom: {
              animate: true,
              duration: 1.2
            }
          }
        );
      } catch (error) {
        console.warn('Ошибка при запуске анимации карты:', error);
        animationRef.current = null;
      }
    }
    
    return () => {
      safeStopAnimation();
    };
  }, [selectedItem, map]);
  
  return null;
}

const MemoizedMarker = React.memo(({ item, isSelected, onMarkerClick }) => {
  const handleClick = useCallback(() => {
    onMarkerClick(item);
  }, [item, onMarkerClick]);
  
  const icon = useMemo(() => {
    return isSelected ? createSelectedIcon() : createNormalIcon();
  }, [isSelected]);
  
  return (
    <Marker 
      position={[item.lat, item.lon]}
      icon={icon}
      eventHandlers={{
        click: handleClick
      }}
    >
      <Popup>
        <div className="popup-content">
          <strong>{item.ip}</strong><br />
          <span>{item.country}, {item.city}</span><br />
          <span>{item.region}, {item.zip}</span><br />
          <span><strong>Часовой пояс:</strong> {item.timezone}</span><br />
          <span><strong>ISP:</strong> {item.isp}</span>
        </div>
      </Popup>
    </Marker>
  );
});

export default function MapView({ data, onSelect, selectedItem }) {
  const mapRef = useRef();
  const previousSelectedItemRef = useRef();

  const handleMarkerClick = useCallback((item) => {
    onSelect(item);
  }, [onSelect]);

  const markers = useMemo(() => {
    return data.map((item, index) => {
      const isSelected = selectedItem && selectedItem.ip === item.ip;
      
      return (
        <MemoizedMarker
          key={`${item.ip}-${index}`}
          item={item}
          isSelected={isSelected}
          onMarkerClick={handleMarkerClick}
        />
      );
    });
  }, [data, selectedItem, handleMarkerClick]);

  useEffect(() => {
    previousSelectedItemRef.current = selectedItem;
  }, [selectedItem]);

  return (
    <MapContainer 
      ref={mapRef}
      center={[20, 0]} 
      zoom={2} 
      style={{ height: '500px', width: '100%', borderRadius: '12px' }}
      className="leaflet-map"
      preferCanvas={true}
      zoomAnimation={true}
      fadeAnimation={true}
      markerZoomAnimation={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        updateWhenIdle={false}
        updateWhenZooming={false}
        keepBuffer={4}
      />
      
      <SmoothMapController 
        selectedItem={selectedItem} 
        previousSelectedItem={previousSelectedItemRef.current}
      />
      
      {markers}
    </MapContainer>
  );
}