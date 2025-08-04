export default function DataTable({ data, onRowSelect }) {
  const handleRowClick = (item) => {
    onRowSelect(item);
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>IP Адрес</th>
            <th>Страна</th>
            <th>Город</th>
            <th>ISP</th>
            <th>Организация</th>
            <th>ASN</th>
            <th>Широта</th>
            <th>Долгота</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={index} 
              className="table-row"
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
          ))}
        </tbody>
      </table>
    </div>
  );
}