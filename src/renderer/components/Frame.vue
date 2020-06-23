<template>
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
      <v-btn icon @click="openSettings()"><v-icon>mdi-cog</v-icon></v-btn>
    </v-col>
  </v-row>
</template>

<script>

const { ipcRenderer } = window.require('electron');

export default {
  data: () => ({
    totalTime: '',
    selectedTime: '',
  }),

  mounted() {
    document.body.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    document.body.className = 'dragable-area';
    document.getElementById('mainApp').style.backgroundColor = '#00000000';

    ipcRenderer.on('setTotalTime', (ev, time) => {
      this.totalTime = time;
    });
    ipcRenderer.on('setSelectedTime', (ev, time) => {
      this.selectedTime = time;
    });

    // ipcRenderer.invoke('frameOpened');
  },

  methods: {
    openSettings() {
      ipcRenderer.invoke('openSettings');
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
