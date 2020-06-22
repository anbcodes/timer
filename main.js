// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');

const store = new Store();
const optionNames = [
  'Youtube',
  'Research',
  'News',
  'Minecraft: Server',
  'Minecraft: Speedrun',
  'Minecraft: Local',
  'StackOverflow',
  'Programming',
  'OS',
];
function initStore() {
  const options = store.get('options', optionNames.map((v) => ({ name: v })));
  store.set('options', options);
  const times = store.get('times', Object.fromEntries(optionNames.map((v) => [v, []])));
  store.set('times', times);
  const selectedOption = store.get('selectedOption', 'Youtube');
  store.set('selectedOption', selectedOption);
}
initStore();
let mainWindow = null;
let secondaryWindow = null;

ipcMain.handle('selectedOption', (_, option) => {
  store.set('selectedOption', option);
  if (store.get('running')) {
    pushTempTimer();
    newTempTimer(option);
  }
});
ipcMain.handle('options', (_, options) => {
  store.set('options', options);
});
ipcMain.handle('running', (_, isrunning) => {
  console.log('received', isrunning);
  if (!isrunning) {
    pushTempTimer();
  } else {
    newTempTimer(store.get('selectedOption'));
  }
  store.set('running', isrunning);
});

function pushTempTimer() {
  const times = store.get('times', {});
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

ipcMain.handle('open', (_, win) => {
  if (win === 'main') {
    onMainOpened();
  } if (win === 'sec') {
    onSecondaryOpened();
  }
});

function onMainOpened() {
  mainWindow.webContents.send('selectedOption', store.get('selectedOptions', 'Youtube'));
  mainWindow.webContents.send('options', store.get('options', null));
  mainWindow.webContents.send('running', store.get('running'));
}
function onSecondaryOpened() {

}

function formatTime(secNum) {
  let hours = Math.floor(secNum / 3600);
  let minutes = Math.floor((secNum - (hours * 3600)) / 60);
  let seconds = secNum - (hours * 3600) - (minutes * 60);

  if (hours < 10) { hours = `0${hours}`; }
  if (minutes < 10) { minutes = `0${minutes}`; }
  if (seconds < 10) { seconds = `0${seconds}`; }
  return `${hours}:${minutes}:${seconds}`;
}

setInterval(() => {
  let tempTimePassed = 0;
  if (store.get('running')) {
    const tempTimer = store.get('tempTimer');
    tempTimePassed = (+(new Date()) - tempTimer.start);
  }
  const times = store.get('times');
  const selectedOption = store.get('selectedOption');
  const eachTimes = Object.fromEntries(Object.entries(times)
    .map(([key, value]) => [key, value.reduce((t, v) => {
      let time = 0;
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      if (v.end > +d && v.start > +d) {
        time = v.end - v.start;
      }
      return t + time;
    }, 0)]));
  const selectedTime = eachTimes[selectedOption] + tempTimePassed;
  sendFormattedTime(selectedTime, 'selectedTime');
  const totalTime = Object.values(eachTimes).reduce((t, v) => t + v, 0) + tempTimePassed;
  sendFormattedTime(totalTime, 'totalTime');
}, 20);

function sendFormattedTime(time, location) {
  const formattedTime = formatTime(Math.round(time / 1000));
  if (secondaryWindow) {
    secondaryWindow.send(location, formattedTime);
  }
}

function createMain() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    // frame: false,
  });

  // and load the index.html of the app.
  mainWindow.loadFile('dist/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('createMain', () => {
  if (!mainWindow) {
    createMain();
  }
});

function createSecondary() {
  secondaryWindow = new BrowserWindow({
    width: 180,
    // width: 1400,
    x: 0,
    y: 0,
    height: 90,
    // height: 500,
    webPreferences: {
      nodeIntegration: true,
      additionalArguments: ['frameWindow'],
    },
    frame: false,
    alwaysOnTop: true,
    transparent: true,
  });

  secondaryWindow.setAlwaysOnTop(true, 'floating');
  secondaryWindow.setVisibleOnAllWorkspaces(true);
  secondaryWindow.setFullScreenable(false);

  secondaryWindow.loadFile('dist/index.html');

  secondaryWindow.on('closed', () => {
    secondaryWindow = null;
  });
}

ipcMain.handle('createSecondary', () => {
  if (!secondaryWindow) {
    createSecondary();
  }
});

function createWindows() {
  createMain();
  createSecondary();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => setTimeout(createWindows, 500));

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindows();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
