<template>
  <v-app id="mainApp">
    <v-main>
      <frame-win v-if="windowType === 'frame'"/>
      <settings-win v-else-if="windowType === 'settings'"/>
    </v-main>
  </v-app>
</template>

<script>

import FrameWin from './components/Frame.vue';
import SettingsWin from './components/Settings.vue';

export default {
  components: {
    FrameWin,
    SettingsWin,
  },
  data: () => ({
    windowType: window.process.argv.slice(-1)[0],
  }),
};

</script>

<style>

</style>
