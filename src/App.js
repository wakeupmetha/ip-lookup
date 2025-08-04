import { useEffect, useState } from 'react';
import MapView from './components/MapView';
import DataTable from './components/DataTable';
import { parseGeoData } from './utils/parseGeoData';
import './App.css';

// отладочные примеры
const sampleData = `8.8.8.8,"United States","Mountain View","California","94043","America/Los_Angeles","Google LLC","Google LLC","AS15169",37.4056,-122.0775,1000
1.1.1.1,"Australia","Sydney","New South Wales","2000","Australia/Sydney","Cloudflare, Inc.","APNIC and Cloudflare DNS Resolver project","AS13335",-33.8688,151.2093,1000
208.67.222.222,"United States","San Francisco","California","94102","America/Los_Angeles","Cisco OpenDNS, LLC","Cisco OpenDNS, LLC","AS36692",37.7749,-122.4194,1000`;

function App() {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputData, setInputData] = useState('');
  const [showDataInput, setShowDataInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const parsed = parseGeoData(sampleData);
    setData(parsed);
  }, []);

  const handleDataLoad = () => {
    if (!inputData.trim()) {
      setError('Пожалуйста, введите данные для обработки');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const parsed = parseGeoData(inputData);
      if (parsed.length === 0) {
        setError('Не удалось распарсить данные. Проверьте формат данных.');
      } else {
        setData(prevData => {
          const existingIPs = new Set(prevData.map(item => item.ip));
          const newItems = parsed.filter(item => !existingIPs.has(item.ip));
          return [...prevData, ...newItems];
        });
        setShowDataInput(false);
        setInputData('');
        setSelectedItem(null);
      }
    } catch (err) {
      setError('Ошибка при обработке данных: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSampleData = () => {
    setInputData(prev => {
      const newData = prev ? prev + '\n' + sampleData : sampleData;
      return newData;
    });
  };

  const handleClearData = () => {
    setData([]);
    setInputData('');
    setSelectedItem(null);
    setSearchTerm('');
    setError('');
  };

  const handleOpenBulkLookup = () => {
    window.open('https://www.showmyip.com/bulk-ip-lookup/', '_blank', 'noopener,noreferrer');
  };

  const filteredData = data.filter(item => 
    item.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const placeholderText = `Вставьте ваши IP-данные здесь...

Пример формата:
8.8.8.8,"United States","Mountain View","California","94043","America/Los_Angeles","Google LLC","Google LLC","AS15169",37.4056,-122.0775,1000`;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📍 IP Location Viewer</h1>
        
        <div className="controls-section">
          <div className="control-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => setShowDataInput(!showDataInput)}
            >
              {showDataInput ? '🔼 Скрыть загрузку' : '📥 Загрузить данные'}
            </button>
            
            <button 
              className="btn btn-info"
              onClick={handleOpenBulkLookup}
              title="Открыть Bulk IP Lookup для получения данных"
            >
              🌐 Получить данные IP
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={handleClearData}
              disabled={data.length === 0}
            >
              🗑️ Очистить все
            </button>
            
            <span className="data-counter">
              Загружено: <strong>{data.length}</strong> записей
            </span>
          </div>

          {showDataInput && (
            <div className="data-input-section">
              <div className="input-header">
                <h3>Загрузка IP-данных</h3>
                <p className="input-description">
                  Вставьте данные в формате CSV: IP,Country,City,Region,ZIP,Timezone,ISP,Org,ASN,Lat,Lon
                  <br />
                  <span className="help-text">
                    💡 Совет: Используйте кнопку "🌐 Получить данные IP" для получения данных с сайта Bulk IP Lookup
                  </span>
                </p>
              </div>
              
              <div className="input-controls">
                <button 
                  className="btn btn-outline"
                  onClick={handleAddSampleData}
                >
                  ➕ Добавить пример данных
                </button>
                
                <button 
                  className="btn btn-info btn-outline"
                  onClick={handleOpenBulkLookup}
                >
                  🌐 Открыть Bulk IP Lookup
                </button>
              </div>
              
              <textarea
                className="data-textarea"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder={placeholderText}
                rows={8}
              />
              
              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}
              
              <div className="input-actions">
                <button 
                  className="btn btn-success"
                  onClick={handleDataLoad}
                  disabled={isLoading || !inputData.trim()}
                >
                  {isLoading ? '⏳ Обработка...' : '✅ Загрузить данные'}
                </button>
                
                <button 
                  className="btn btn-outline"
                  onClick={() => setInputData('')}
                >
                  🧹 Очистить поле
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Поиск по IP, стране или городу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </header>
      
      <main className="main-content">
        {data.length > 0 ? (
          <>
            <div className="map-section">
              <MapView data={filteredData} onSelect={setSelectedItem} />
            </div>
            
            {selectedItem && (
              <div className="selected-info">
                <h3>Выбранный IP: {selectedItem.ip}</h3>
                <p><strong>Страна:</strong> {selectedItem.country}</p>
                <p><strong>Город:</strong> {selectedItem.city}</p>
                <p><strong>ISP:</strong> {selectedItem.isp}</p>
                <p><strong>Координаты:</strong> {selectedItem.lat}, {selectedItem.lon}</p>
              </div>
            )}
            
            <div className="table-section">
              <h2>Данные IP-адресов ({filteredData.length})</h2>
              <DataTable data={filteredData} onRowSelect={setSelectedItem} />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <h2>🌍 Добро пожаловать в IP Location Viewer!</h2>
              <p>Загрузите ваши IP-данные, чтобы увидеть их на карте и в таблице.</p>
              <div className="empty-actions">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => setShowDataInput(true)}
                >
                  📥 Начать загрузку данных
                </button>
                <button 
                  className="btn btn-info btn-large"
                  onClick={handleOpenBulkLookup}
                >
                  🌐 Получить данные IP
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
