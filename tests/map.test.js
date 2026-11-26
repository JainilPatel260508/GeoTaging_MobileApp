const test = require('node:test');
const assert = require('node:assert/strict');
const { groupLocations } = require('../src/mapLocations');

test('groups shared coordinates, keeps zero and selects same-species plantations by ID', () => {
  const first = { id: 'a', species: 'Neem', latitude: 0, longitude: 10 };
  const second = { ...first, id: 'b' };
  const third = { ...first, id: 'c', latitude: 10, longitude: 0 };
  const records = Object.freeze([first, second, third, { ...first, longitude: 181 }, { id: 'old' }]);
  const groups = groupLocations(records);
  assert.deepEqual(groups.map(g => g.coordinate), [{ latitude: 0, longitude: 10 }, { latitude: 10, longitude: 0 }]);
  assert.deepEqual(groups[0].records.map(r => r.id), ['a', 'b']);
  assert.strictEqual(groups[1].records[0], third);
  assert.equal(records.length, 5);
});

test('handles empty, invalid-only and single-location collections', () => {
  assert.deepEqual(groupLocations([]), []);
  assert.deepEqual(groupLocations([{ latitude: null, longitude: 0 }]), []);
  assert.equal(groupLocations([{ id: 'one', latitude: 0, longitude: 0 }]).length, 1);
});
