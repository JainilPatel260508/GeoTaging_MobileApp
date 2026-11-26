const test = require('node:test');
const assert = require('node:assert/strict');
const { readRecords, saveWithPhoto } = require('../src/records');

test('adds legacy and new record photos, reloads both and safely replaces one', async () => {
  const data = new Map();
  const disk = new Map();
  const storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const files = { copy: capture => { disk.set('doc/' + capture, capture); return 'doc/' + capture; },
    remove: uri => { assert.ok(!Array.from(data.values())[0].includes(uri)); disk.delete(uri); } };
  const old = { id: '1', species: 'Neem', createdAt: 'first', latitude: 0, longitude: 1 };
  const newer = { ...old, id: '2', createdAt: 'second', latitude: 5 };
  let records = await saveWithPhoto(storage, files, [old], old, 'tree1');
  records = await saveWithPhoto(storage, files, records, newer, 'tree2');
  await saveWithPhoto(storage, files, records, records[1], 'replacement');
  assert.deepEqual(await readRecords(storage), [
    { ...newer, photoUri: 'doc/tree2' }, { ...old, photoUri: 'doc/replacement' },
  ]);
  assert.deepEqual([...disk.keys()], ['doc/tree2', 'doc/replacement']);
});

test('failed metadata write discards the new copy and keeps the old photo', async () => {
  const old = { id: '1', photoUri: 'doc/original' };
  const removed = [];
  const files = { copy: () => 'doc/new', remove: uri => removed.push(uri) };
  const storage = { setItem: () => { throw new Error('storage full'); } };
  await assert.rejects(saveWithPhoto(storage, files, [old], old, 'draft'), /storage full/);
  assert.deepEqual(removed, ['doc/new']);
  assert.equal(old.photoUri, 'doc/original');
});
