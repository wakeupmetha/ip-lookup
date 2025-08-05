import React, { useState, useMemo } from 'react';

const getContinentByCoordinates = (lat, lon) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return 'Unknown';
  }
  if (latitude >= 15 && latitude <= 85 && longitude >= -180 && longitude <= -30) {
    return 'North America';
  }
  if (latitude >= -60 && latitude <= 15 && longitude >= -90 && longitude <= -30) {
    return 'South America';
  }
  if (latitude >= 35 && latitude <= 75 && longitude >= -15 && longitude <= 60) {
    return 'Europe';
  }
  if (latitude >= -40 && latitude <= 40 && longitude >= -20 && longitude <= 55) {
    return 'Africa';
  }
  if (latitude >= 5 && latitude <= 85 && longitude >= 60 && longitude <= 180) {
    return 'Asia';
  }
  if (latitude >= 35 && latitude <= 85 && longitude >= 25 && longitude <= 60) {
    return 'Asia';
  }
  if (latitude >= -50 && latitude <= 25 && longitude >= 110 && longitude <= 180) {
    return 'Oceania';
  }
  if (latitude < -60) {
    return 'Antarctica';
  }
  return 'Other';
};

const Statistics = ({ data }) => {
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const countryStats = useMemo(() => {
    return data.reduce((acc, item) => {
      acc[item.country] = (acc[item.country] || 0) + 1;
      return acc;
    }, {});
  }, [data]);

  const cityStats = useMemo(() => {
    return data.reduce((acc, item) => {
      const key = `${item.city}, ${item.country}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [data]);

  const continentStats = useMemo(() => {
    return data.reduce((acc, item) => {
      const continent = getContinentByCoordinates(item.lat, item.lon);
      acc[continent] = (acc[continent] || 0) + 1;
      return acc;
    }, {});
  }, [data]);

  const hostStats = useMemo(() => {
    return data.reduce((acc, item) => {
      const host = item.isp || item.org || 'Unknown';
      acc[host] = (acc[host] || 0) + 1;
      return acc;
    }, {});
  }, [data]);

  const getAllEntries = (stats) => {
    return Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .map((entry, index) => [...entry, index + 1]);
  };

  return (
    <div className="statistics-container">
      <div className="stats-header">
        <h2>📊 Статистика IP-адресов</h2>
        <p className="stats-summary">
          Всего проанализировано: <strong>{data.length}</strong> IP-адресов
        </p>
      </div>
      
      <div className="stats-main-grid">
        <StatCard 
          title="По странам" 
          data={getAllEntries(countryStats)} 
          icon="🌍"
          searchValue={countrySearch}
          onSearchChange={setCountrySearch}
          placeholder="Поиск по странам..."
        />
        
        <StatCard 
          title="По городам" 
          data={getAllEntries(cityStats)} 
          icon="🏙️"
          searchValue={citySearch}
          onSearchChange={setCitySearch}
          placeholder="Поиск по городам и странам..."
        />
        
        <StatCard 
          title="По континентам" 
          data={getAllEntries(continentStats)} 
          icon="🌎"
        />
        
        <StatCard 
          title="По хостерам/организациям" 
          data={getAllEntries(hostStats)} 
          icon="🏢"
        />
      </div>
    </div>
  );
};

export default Statistics;

const filterAndKeepRanks = (entries, searchTerm) => {
  if (!searchTerm.trim()) {
    return entries.map(([name, count, originalRank]) => ({
      name,
      count,
      originalRank,
      isHighlighted: false
    }));
  }
  
  const searchLower = searchTerm.toLowerCase();
  return entries
    .filter(([name]) => name.toLowerCase().includes(searchLower))
    .map(([name, count, originalRank]) => ({
      name,
      count,
      originalRank,
      isHighlighted: true
    }));
};

const StatCard = ({ title, data, icon, searchValue, onSearchChange, placeholder }) => {
  const processedData = searchValue ? 
    filterAndKeepRanks(data, searchValue) : 
    data.map(([name, count, originalRank]) => ({
      name,
      count,
      originalRank
    }));

  const maxCount = processedData.length > 0 ? Math.max(...processedData.map(item => item.count)) : 1;

  return (
    <div className="stat-card">
      <h3 className="stat-title">
        <span className="stat-icon">{icon}</span>
        {title}
        <span className="stat-total">({processedData.length})</span>
      </h3>
      {onSearchChange && (
        <div className="stat-search">
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="stat-search-input"
          />
        </div>
      )}
      <div className="stat-content">
        {processedData.length === 0 ? (
          <p className="no-data">Нет данных</p>
        ) : (
          <div className="stat-grid-items">
            {processedData.map((item, index) => (
              <div 
                key={item.name} 
                className={`stat-grid-item ${item.isHighlighted ? 'highlighted' : ''}`}
              >
                <div className="stat-item-header">
                  <span className="stat-rank">#{item.originalRank}</span>
                  <span className="stat-count">{item.count}</span>
                </div>
                <div className="stat-name" title={item.name}>{item.name}</div>
                <div className="stat-bar">
                  <div 
                    className="stat-bar-fill" 
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};