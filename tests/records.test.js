const test = require('node:test');
const assert = require('node:assert/strict');
const { canSave, makeRecord, addRecord, readRecords } = require('../src/records');

const form = { catchment: ' Koyna ', species: ' Neem ', count: '1', notes: '' };
const gps = { latitude: 17.40123456, longitude: 73.75123456, accuracy: 4.6 };

test('requires names, a positive safe integer and in-range coordinates', () => {
  assert.ok(canSave(form, { latitude: 0, longitude: 0 }));
  for (const count of ['', '0', '-2', '1.5', '1e3', '9007199254740992']) {
    assert.equal(canSave({ ...form, count }, gps), false);
  }
  for (const field of ['catchment', 'species']) {
    assert.equal(canSave({ ...form, [field]: ' ' }, gps), false);
  }
  for (const invalid of [null, {}, { ...gps, latitude: 91 }, { ...gps, longitude: -181 }, { ...gps, latitude: NaN }]) {
    assert.equal(canSave(form, invalid), false);
  }
});

test('reloads two serialized records newest first with their original fixes', async () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  assert.deepEqual(await readRecords(storage), []);
  const reading = { ...gps };
  const first = makeRecord(form, reading);
  await addRecord(storage, [], first);
  reading.latitude = 18;
  reading.accuracy = null;
  const second = makeRecord({ ...form, notes: 'Near stream' }, reading);
  await addRecord(storage, await readRecords(storage), second);
  const loaded = await readRecords(storage);
  assert.deepEqual(loaded, [second, first]);
  assert.equal(loaded[1].latitude, gps.latitude);
  assert.equal(loaded[1].longitude, gps.longitude);
  assert.equal(loaded[1].accuracy, gps.accuracy);
  assert.equal(loaded[0].accuracy, null);
  assert.equal(loaded[1].catchment, 'Koyna');
  assert.notEqual(first.id, second.id);
  assert.ok(Number.isFinite(Date.parse(first.createdAt)));
});

test('propagates a write failure and preserves the previous list', async () => {
  const records = [];
  const storage = { setItem: async () => { throw new Error('storage full'); } };
  await assert.rejects(addRecord(storage, records, makeRecord(form, gps)), /storage full/);
  assert.deepEqual(records, []);
});

test('reports unreadable storage instead of treating it as an empty list', async () => {
  for (const value of ['{', '{}']) {
    await assert.rejects(readRecords({ getItem: async () => value }));
  }
});
