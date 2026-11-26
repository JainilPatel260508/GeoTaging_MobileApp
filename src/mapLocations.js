const { validCoordinates } = require('./records');

function groupLocations(records) {
  const groups = new Map();
  for (const record of records) {
    if (!validCoordinates(record)) continue;
    const { latitude, longitude } = record;
    const key = latitude + ',' + longitude;
    if (!groups.has(key)) groups.set(key, { key, coordinate: { latitude, longitude }, records: [] });
    groups.get(key).records.push(record);
  }
  return [...groups.values()];
}

module.exports = { groupLocations };
