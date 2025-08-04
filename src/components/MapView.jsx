import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapView({ data, onSelect }) {
  const handleMarkerClick = (item) => {
    onSelect(item);
  };

  return (
    <div className="map-container">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '500px', width: '100%' }}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((item, index) => (
          <Marker 
            key={index} 
            position={[item.lat, item.lon]}
            eventHandlers={{
              click: () => handleMarkerClick(item)
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
        ))}
      </MapContainer>
    </div>
  );
}