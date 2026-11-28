const test = require('node:test');
const assert = require('node:assert/strict');
const { addRecord, readRecords, summarizeCatchments } = require('../src/records');

test('summary reflects new saves and drills down to the original records in list order', async () => {
  const data = new Map();
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  let records = await readRecords(storage);
  assert.deepEqual(summarizeCatchments(records), []);
  const first = { id: 'a', catchment: 'Upper Basin', count: 10 };
  const second = { id: 'b', catchment: ' upper basin ', count: 15 };
  const third = { id: 'c', catchment: 'Lower Basin', count: 4 };
  records = await addRecord(storage, records, first);
  assert.equal(summarizeCatchments(records)[0].total, 10);
  records = await addRecord(storage, records, second);
  await addRecord(storage, records, third);
  const [lower, upper] = summarizeCatchments(await readRecords(storage));
  assert.deepEqual([lower.name, lower.records.length, lower.total], ['Lower Basin', 1, 4]);
  assert.deepEqual([upper.name, upper.records.length, upper.total], ['Upper Basin', 2, 25]);
  assert.deepEqual(upper.records, [second, first]);
});

test('counts missing and whitespace-only catchments under Unspecified', () => {
  const groups = summarizeCatchments([{ id: 'a', count: 2 }, { id: 'b', catchment: '  ', count: 4 }]);
  assert.deepEqual(groups.map(g => [g.name, g.records.length, g.total]), [['Unspecified', 2, 6]]);
});
