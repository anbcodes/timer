const Store = require('electron-store');

module.exports = function getDefaultStore() {
  const store = new Store();
  const options = store.get('options', []);
  store.set('options', options);
  const times = store.get('times', {});
  store.set('times', times);
  const selectedOption = store.get('selectedOption', options[0] || null);
  store.set('selectedOption', selectedOption);
  const tempTimer = store.get('tempTimer', {});
  store.set('tempTimer', tempTimer);

  return store;
};
