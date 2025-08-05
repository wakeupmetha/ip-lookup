import { useEffect, useState } from 'react';
import MapView from './components/MapView';
import DataTable from './components/DataTable';
import Statistics from './components/Statistics';
import { parseGeoData } from './utils/parseGeoData';
import './App.css';

// отладочные примеры
const sampleData = `8.8.8.8,"United States","Mountain View","California","94043","America/Los_Angeles","Google LLC","Google LLC","AS15169",37.4056,-122.0775,1000
1.1.1.1,"Australia","Sydney","New South Wales","2000","Australia/Sydney","Cloudflare, Inc.","APNIC and Cloudflare DNS Resolver project","AS13335",-33.8688,151.2093,1000
95.173.136.71,Russia,Moscow,Moscow,103132,Europe/Moscow,"The Federal Guard Service of the Russian Federation",Rsnet,"AS8291 The Federal Guard Service of the Russian Federation",55.753194,37.619195, 1000
184.24.77.32,Germany,"Frankfurt am Main",Hesse,60313,Europe/Berlin,"Akamai International B.V.","Akamai Technologies, Inc.","AS20940 Akamai International B.V.",50.1169,8.6837
157.112.148.185,Japan,"Chiyoda City",Tokyo,100-8111,Asia/Tokyo,"Xserver Inc.","XSERVER Inc.","AS131965 Xserver Inc.",35.6916,139.768
41.79.191.161,Zimbabwe,Harare,Harare,Unknown,Africa/Harare,"Powertel Communications",Telecel,"AS37184 Powertel Communications",-17.8351,31.1057
200.160.0.10,Brazil,"São Paulo","São Paulo",01000-000,America/Cuiaba,"Núcleo de Inf. e Coord. do Ponto BR - NIC.BR","Núcleo de Inf. e Coord. do Ponto BR - NIC.BR","AS22548 Núcleo de Inf. e Coord. do Ponto BR - NIC.BR",-23.5558,-46.6396
94.56.129.19,"United Arab Emirates",Dubai,Dubai,Unknown,Asia/Dubai,"EMIRATES TELECOMMUNICATIONS GROUP COMPANY (ETISALAT GROUP) PJSC","Crowne Plaza and Staybridge Suites Hotel","AS5384 Emirates Internet",25.0734,55.2979
51.148.180.200,"United Kingdom",London,England,W1B,Europe/London,"Zen Internet Ltd","Zen Internet Ltd","AS13037 Zen Internet Ltd",51.5072,-0.127586
31.15.32.100,Sweden,Gothenburg,"Västra Götaland County","400 10",Europe/Stockholm,"Tele2 Sverige AB","AddSecure AB","AS1257 Tele2 Sverige AB",57.7089,11.9746
223.112.9.2,China,Qinnan,Jiangsu,Unknown,Asia/Shanghai,"China Mobile communications corporation","China Mobile","AS56046 China Mobile communications corporation",33.1402,119.789`;

function App() {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputData, setInputData] = useState('');
  const [showDataInput, setShowDataInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('map');
  const [sortField, setSortField] = useState('original');
  const [sortDirection, setSortDirection] = useState('asc');

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
        setData(parsed);
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

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField('original');
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedData = (dataToSort) => {
    if (sortField === 'original') {
      return dataToSort;
    }

    const sorted = [...dataToSort].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'country':
          aValue = a.country || '';
          bValue = b.country || '';
          break;
        case 'ip':
          aValue = a.ip.split('.').map(num => parseInt(num).toString().padStart(3, '0')).join('.');
          bValue = b.ip.split('.').map(num => parseInt(num).toString().padStart(3, '0')).join('.');
          break;
        case 'city':
          aValue = a.city || '';
          bValue = b.city || '';
          break;
        case 'isp':
          aValue = a.isp || '';
          bValue = b.isp || '';
          break;
        case 'org':
          aValue = a.org || '';
          bValue = b.org || '';
          break;
        case 'lat':
          aValue = parseFloat(a.lat) || 0;
          bValue = parseFloat(b.lat) || 0;
          break;
        case 'lon':
          aValue = parseFloat(a.lon) || 0;
          bValue = parseFloat(b.lon) || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const comparison = aValue.toString().toLowerCase().localeCompare(bValue.toString().toLowerCase());
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  };

  const filteredData = data.filter(item => 
    item.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.isp && item.isp.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.org && item.org.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedAndFilteredData = getSortedData(filteredData);

  const placeholderText = `Вставьте ваши IP-данные здесь...

Пример формата:
8.8.8.8,"United States","Mountain View","California","94043","America/Los_Angeles","Google LLC","Google LLC","AS15169",37.4056,-122.0775,1000`;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📍 IP Location Viewer</h1>
        
        {/* Система вкладок */}
        <div className="tabs-container">
          <button 
            className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            🗺️ Карта и данные
          </button>
          <button 
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Статистика
          </button>
        </div>
        
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
        
        {activeTab === 'map' && (
          <div className="search-and-sort-container">
            <div className="search-container">
              <input
                type="text"
                placeholder="Поиск по IP, стране, городу или ISP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        )}
      </header>
      
      <main className="main-content">
        {data.length > 0 ? (
          <>
            {activeTab === 'map' && (
              <>
                <div className="map-section">
                  <MapView 
                    data={sortedAndFilteredData} 
                    onSelect={setSelectedItem}
                    selectedItem={selectedItem}
                  />
                </div>
                
                {selectedItem && (
                  <div className="selected-info">
                    <h3>Выбранный IP: {selectedItem.ip}</h3>
                    <p><strong>Страна:</strong> {selectedItem.country}</p>
                    <p><strong>Город:</strong> {selectedItem.city}</p>
                    <p><strong>ISP:</strong> {selectedItem.isp}</p>
                    <p><strong>Организация:</strong> {selectedItem.org}</p>
                    <p><strong>ASN:</strong> {selectedItem.asn}</p>
                    <p>
                      <strong>Координаты:</strong>{' '}
                      <a 
                        href={`https://maps.apple.com/?q=IP+${selectedItem.ip}&ll=${selectedItem.lat},${selectedItem.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ip-api-link"
                      >
                        {selectedItem.lat}, {selectedItem.lon}
                      </a>
                    </p>
                    <p>
                      <strong>Подробная информация:</strong>{' '}
                      <a 
                        href={`https://ip-api.com/#${selectedItem.ip}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ip-api-link"
                      >
                        🔗 Открыть на ip-api.com
                      </a>
                    </p>
                  </div>
                )}
                
                <div className="table-section">
                  <h2>Данные IP-адресов ({sortedAndFilteredData.length})</h2>
                  {/*ataTable*/}
                  <DataTable 
                    data={sortedAndFilteredData} 
                    onRowSelect={setSelectedItem}
                    selectedItem={selectedItem}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </div>
              </>
            )}
            
            {activeTab === 'stats' && (
              <Statistics data={data} />
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <h2>🌍 Добро пожаловать в IP Location Viewer!</h2>
              <p>Загрузите ваши IP-данные, чтобы увидеть их на карте и в таблице.</p>
              {}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
