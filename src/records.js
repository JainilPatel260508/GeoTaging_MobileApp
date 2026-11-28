const STORAGE_KEY = 'plantation-mapper.records.v1';

function validCoordinates(coords) {
  return !!coords && Number.isFinite(coords.latitude) && Math.abs(coords.latitude) <= 90
    && Number.isFinite(coords.longitude) && Math.abs(coords.longitude) <= 180;
}

function validCount(text) {
  return /^\d+$/.test(text.trim()) && Number.isSafeInteger(Number(text)) && Number(text) > 0;
}

function canSave(form, coords) {
  return Boolean(form.catchment.trim() && form.species.trim()
    && validCount(form.count) && validCoordinates(coords));
}

function makeRecord(form, coords) {
  if (!canSave(form, coords)) throw new Error('Incomplete record');
  const now = new Date();
  return {
    id: now.getTime().toString(36) + '-' + Math.random().toString(36).slice(2),
    createdAt: now.toISOString(),
    catchment: form.catchment.trim(),
    species: form.species.trim(),
    count: Number(form.count),
    notes: form.notes.trim(),
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: Number.isFinite(coords.accuracy) && coords.accuracy >= 0 ? coords.accuracy : null,
  };
}

async function readRecords(storage) {
  const value = await storage.getItem(STORAGE_KEY);
  if (value === null) return [];
  const records = JSON.parse(value);
  if (!Array.isArray(records)) throw new Error('Invalid saved records');
  return records;
}

async function addRecord(storage, records, record) {
  const updated = [record, ...records];
  await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

async function saveWithPhoto(storage, files, records, record, capture) {
  const index = records.findIndex(item => item.id === record.id);
  const photoUri = await files.copy(capture);
  const updated = records.slice();
  if (index < 0) updated.unshift({ ...record, photoUri });
  else updated[index] = { ...records[index], photoUri };
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    files.remove(photoUri);
    throw error;
  }
  if (index >= 0 && records[index].photoUri) files.remove(records[index].photoUri);
  return updated;
}

function catchmentName(record) {
  return record.catchment?.trim() || 'Unspecified';
}

function summarizeCatchments(records) {
  const groups = new Map();
  for (const record of records) {
    const name = catchmentName(record);
    const key = name.toLowerCase();
    if (!groups.has(key)) groups.set(key, { key, name, records: [], total: 0 });
    const group = groups.get(key);
    // Prefer a saved spelling with capitalization when both spellings occur.
    if (group.name === key && name !== key) group.name = name;
    group.records.push(record);
    group.total += record.count;
  }
  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function searchRecords(records, query) {
  const term = query.trim().toLowerCase();
  if (!term) return records;
  return records.filter(record =>
    record.species.toLowerCase().includes(term) || catchmentName(record).toLowerCase().includes(term));
}

module.exports = { validCount, validCoordinates, canSave, makeRecord, readRecords, addRecord, saveWithPhoto, searchRecords, catchmentName, summarizeCatchments };
