/* eslint-disable no-multiple-empty-lines */
// eslint-disable-next-line import/no-extraneous-dependencies
const { ipcMain } = require('electron');
const createApp = require('./windows.js');
const getDefaultStore = require('./store.js');

const store = getDefaultStore();


function pushTempTimer() {
  const times = store.get('times');
  const tempTimer = store.get('tempTimer');
  if (!times[tempTimer.name]) {
    times[tempTimer.name] = [];
  }
  times[tempTimer.name].push({ start: tempTimer.start, end: +(new Date()) });
  store.set('times', times);
}

function newTempTimer(type) {
  store.set('tempTimer', {
    name: type,
    start: +(new Date()),
  });
}

ipcMain.handle('setSelectedOption', (_, option) => {
  const isRunning = store.get('isRunning');
  store.set('selectedOption', option);
  if (isRunning) {
    pushTempTimer();
    newTempTimer(option);
  }
});

ipcMain.handle('setIsRunning', (_, isRunning) => {
  if (!isRunning) {
    pushTempTimer();
  } else {
    const selectedOption = store.get('selectedOption');
    newTempTimer(selectedOption);
  }
  store.set('isRunning', isRunning);
});


const windows = createApp();

ipcMain.handle('addOption', (_, option) => {
  const options = store.get('options');
  options.push(option);
  store.set('options', options);
  windows.settings.send('setAvailableOptions', options);
});

ipcMain.handle('removeOption', (_, option) => {
  let options = store.get('options');
  const times = store.get('times');
  delete times[option];
  options = options.filter((v) => v !== option);
  console.log(options, option);
  store.set('options', options);
  store.set('times', times);
  windows.settings.send('setAvailableOptions', options);
});

ipcMain.handle('settingsOpened', () => {
  const options = store.get('options');
  const selectedOption = store.get('selectedOption');
  const isRunning = store.get('isRunning');
  windows.settings.webContents.send('setSelectedOption', selectedOption);
  windows.settings.webContents.send('setAvailableOptions', options);
  windows.settings.webContents.send('setIsRunning', isRunning);
});


function formatTime(secNum) {
  let hours = Math.floor(secNum / 3600);
  let minutes = Math.floor((secNum - (hours * 3600)) / 60);
  let seconds = (secNum - (hours * 3600) - (minutes * 60)).toFixed(2);

  if (hours < 10) { hours = `0${hours}`; }
  if (minutes < 10) { minutes = `0${minutes}`; }
  if (seconds < 10) { seconds = `0${seconds}`; }
  return `${hours}:${minutes}:${seconds}`;
}

function sendTimeTo(location, time) {
  if (windows.frame) {
    windows.frame.send(`set${location}Time`, time);
  }
}

function timeRangeWithinToday(timeRange) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return timeRange.end > +d && timeRange.start > +d;
}

function calculateTimeInSeconds() {
  const selectedOption = store.get('selectedOption');
  const times = store.get('times');
  const tempTimer = store.get('tempTimer');
  const isRunning = store.get('isRunning');
  const timeDurations = Object.fromEntries(
    Object.entries(times)
      .map(([key, value]) => [
        key,
        value.reduce((t, v) => (timeRangeWithinToday(v) ? t + v.end - v.start : t), 0),
      ]),
  );
  let tempTimeDuration = 0;
  if (isRunning) {
    tempTimeDuration = +(new Date()) - tempTimer.start;
  }
  const timeDurationsSum = Object.values(timeDurations).reduce((t, v) => v + t, 0);
  const totalTime = (timeDurationsSum + tempTimeDuration) / 1000;

  let selectedTime = tempTimeDuration / 1000;
  if (timeDurations[selectedOption]) {
    selectedTime = (timeDurations[selectedOption] + tempTimeDuration) / 1000;
  }
  return { totalTime, selectedTime };
}

setInterval(() => {
  const { totalTime, selectedTime } = calculateTimeInSeconds();
  const formattedTotalTime = formatTime(totalTime);
  const formattedSelectedTime = formatTime(selectedTime);
  sendTimeTo('Total', formattedTotalTime);
  sendTimeTo('Selected', formattedSelectedTime);
}, 20);
