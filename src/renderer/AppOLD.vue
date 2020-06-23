<template>
  <!-- eslint-disable max-len -->
  <v-app
    id="mainApp"
  >
    <v-main>
      <template v-if="frame">
        <v-row>
          <v-col cols="auto" ref="together" class="draggable-area">
            <div class="text-h6 myshadow">
              {{totalTime}}
            </div>
            <div style="margin-left: 20px" class="text-h5 myshadow">
              {{selectedTime}}
            </div>
          </v-col>
          <v-spacer />
          <v-col cols="auto" ref="together">
            <v-btn icon @click="openMain()"><v-icon>mdi-cog</v-icon></v-btn>
          </v-col>
        </v-row>
      </template>
      <template v-else>
        <v-row justify="center">
          <v-col v-if="!running" cols="auto" ref="together">
            <v-btn color="green" @click="startStop()">Start</v-btn>
          </v-col>
          <v-col v-else cols="auto" ref="together">
            <v-btn color="red" @click="startStop()">Stop</v-btn>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="auto" ref="together" v-for="option in options" :key="option.name">
            <v-btn :color="option.selected ? 'white' : 'grey'" outlined @click="setOption(option.name)">{{option.name}}</v-btn>
          </v-col>
        </v-row>
      </template>
    </v-main>
  </v-app>
  <!-- eslint-enable max-len -->
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies, no-unused-vars
const { ipcRenderer } = window.require('electron');

export default {
  name: 'App',
  data: () => ({
    grouping: '',
    optionNames: [
      'Youtube',
      'Research',
      'Minecraft: Server',
      'Minecraft: Speedrun',
      'Minecraft: Local',
      'StackOverflow',
      'Programming',
      'OS',
    ],
    options: [],
    frame: window.process.argv.slice(-1)[0] === 'frameWindow',
    selectedOption: '',
    totalTime: '',
    selectedTime: '',
    running: false,
  }),
  async mounted() {
    this.options = this.optionNames.map((v) => ({ name: v }));
    ipcRenderer.on('totalTime', (ev, time) => {
      this.totalTime = time;
    });
    ipcRenderer.on('selectedTime', (ev, time) => {
      this.selectedTime = time;
    });
    ipcRenderer.on('selectedOption', (ev, option) => {
      this.selectedOption = option;
    });
    ipcRenderer.on('options', (ev, options) => {
      this.options = options || this.options;
    });
    ipcRenderer.on('running', (ev, isRunning) => {
      console.log('running');
      this.running = isRunning;
    });
    if (this.frame) {
      console.log(this.$refs);
      document.body.style.backgroundColor = 'rgba(0, 0, 0, 0)';
      document.body.className = 'dragable-area';
      document.getElementById('mainApp').style.backgroundColor = '#00000000';
      ipcRenderer.invoke('open', 'sec');
    } else {
      ipcRenderer.invoke('open', 'main');
    }
  },
  methods: {
    setOption(option) {
      this.options = this.options.map((v) => ({ ...v, selected: v.name === option }));
      this.selectedOption = option;
      ipcRenderer.invoke('options', this.options);
      ipcRenderer.invoke('selectedOption', this.selectedOption);
    },
    openMain() {
      console.log('opening main');
      ipcRenderer.invoke('createMain');
    },

    startStop() {
      this.running = !this.running;
      ipcRenderer.invoke('running', this.running);
    },
  },
};
</script>
<!-- eslint-disable max-len -->
<style>
.draggable-area{
    -webkit-app-region: drag;
}
.myshadow {
  text-shadow: 2px 2px 0 #000000, 2px -2px 0 #000000, -2px 2px 0 #000000, -2px -2px 0 #000000, 2px 0px 0 #000000, 0px 2px 0 #000000, -2px 0px 0 #000000, 0px -2px 0 #000000, 1px 1px 4px #000000;
  margin-left: 5px
}
</style>
