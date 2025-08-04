export function parseGeoData(rawText) {
  let data = [];
  
  // Очищаем входные данные
  const cleanText = rawText.trim();
  
  if (!cleanText) {
    return data;
  }

  // Пробуем разные способы разделения данных
  let rows = [];
  
  // Способ 1: Разделение по переносам строк
  if (cleanText.includes('\n')) {
    rows = cleanText.split('\n');
  }
  // Способ 2: Разделение по IP-адресам (если данные в одной строке)
  else {
    // Ищем паттерн IP-адресов для разделения
    const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const matches = cleanText.match(ipPattern);
    
    if (matches && matches.length > 1) {
      // Разделяем по IP-адресам
      const parts = cleanText.split(/(?=\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)/);
      rows = parts.filter(part => part.trim().length > 0);
    } else {
      // Если только один IP или не найдены IP, обрабатываем как одну строку
      rows = [cleanText];
    }
  }

  // Обрабатываем каждую строку
  for (const row of rows) {
    const trimmedRow = row.trim();
    if (!trimmedRow) continue;
    
    // Разделяем по запятым, но учитываем кавычки
    const parts = parseCSVRow(trimmedRow);
    
    if (parts.length >= 10) { // Минимум 10 полей (IP + 9 других)
      try {
        const item = {
          ip: parts[0]?.trim() || '',
          country: cleanField(parts[1]) || 'Unknown',
          city: cleanField(parts[2]) || 'Unknown', 
          region: cleanField(parts[3]) || 'Unknown',
          zip: cleanField(parts[4]) || '',
          timezone: cleanField(parts[5]) || 'Unknown',
          isp: cleanField(parts[6]) || 'Unknown',
          org: cleanField(parts[7]) || 'Unknown',
          asn: cleanField(parts[8]) || 'Unknown',
          lat: parseFloat(parts[9]) || 0,
          lon: parseFloat(parts[10]) || 0,
        };
        
        // Проверяем валидность IP и координат
        if (isValidIP(item.ip) && isValidCoordinates(item.lat, item.lon)) {
          data.push(item);
        } else {
          console.warn('Невалидные данные:', item);
        }
      } catch (error) {
        console.warn('Ошибка парсинга строки:', trimmedRow, error);
      }
    } else {
      console.warn('Недостаточно полей в строке:', trimmedRow, 'Найдено:', parts.length);
    }
  }

  return data;
}

// Функция для парсинга CSV строки с учетом кавычек
function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Добавляем последнее поле
  if (current) {
    result.push(current);
  }
  
  return result;
}

// Функция для очистки поля от кавычек и лишних пробелов
function cleanField(field) {
  if (!field) return '';
  return field.replace(/^"|"$/g, '').trim();
}

// Функция для проверки валидности IP-адреса
function isValidIP(ip) {
  if (!ip) return false;
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip.trim());
}

// Функция для проверки валидности координат
function isValidCoordinates(lat, lon) {
  return !isNaN(lat) && !isNaN(lon) && 
         lat >= -90 && lat <= 90 && 
         lon >= -180 && lon <= 180 &&
         (lat !== 0 || lon !== 0); // Исключаем нулевые координаты
}