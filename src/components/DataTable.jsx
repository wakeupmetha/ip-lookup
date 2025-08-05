export default function DataTable({ data, onRowSelect, sortField, sortDirection, onSort, selectedItem }) {
  const handleRowClick = (item) => {
    onRowSelect(item);
  };

  const handleHeaderClick = (field) => {
    onSort(field);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '';
    if (sortField === 'original') return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="sortable-header" onClick={() => handleHeaderClick('ip')}>
              IP Адрес{getSortIcon('ip')}
            </th>
            <th className="sortable-header" onClick={() => handleHeaderClick('country')}>
              Страна{getSortIcon('country')}
            </th>
            <th className="sortable-header" onClick={() => handleHeaderClick('city')}>
              Город{getSortIcon('city')}
            </th>
            <th className="sortable-header" onClick={() => handleHeaderClick('isp')}>
              ISP{getSortIcon('isp')}
            </th>
            <th className="sortable-header" onClick={() => handleHeaderClick('org')}>
              Организация{getSortIcon('org')}
            </th>
            <th className="sortable-header" onClick={() => handleHeaderClick('asn')}>
              ASN{getSortIcon('asn')}
            </th>
            <th className="sortable-header" onClick={() => handleHeaderClick('lat')}>
              Широта{getSortIcon('lat')}
            </th>
            <th className="sortable-header" onClick={() => handleHeaderClick('lon')}>
              Долгота{getSortIcon('lon')}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const isSelected = selectedItem && selectedItem.ip === item.ip;
            
            return (
              <tr 
                key={index} 
                className={`table-row ${isSelected ? 'selected' : ''}`}
                onClick={() => handleRowClick(item)}
              >
                <td className="ip-cell">{item.ip}</td>
                <td>{item.country}</td>
                <td>{item.city}</td>
                <td>{item.isp}</td>
                <td>{item.org}</td>
                <td>{item.asn}</td>
                <td>{item.lat.toFixed(4)}</td>
                <td>{item.lon.toFixed(4)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}