<template>
<!-- eslint-disable max-len -->
  <v-container>
    <v-row justify="center">
      <v-col>
        <v-btn :disabled="!selectedOption" :color="running ? 'red' : 'green'" @click="startOrStop()">{{running ? 'Stop' : 'Start'}}</v-btn>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="auto" v-for="option in options" :key="option">
        <v-btn :color="option === selectedOption ? 'white' : 'grey'" outlined @click="setOrRemoveOption(option)">{{option}}</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn :disabled="options.length === 0 || running" @click="removeSelectedOption()">
          <v-icon >mdi-minus</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn @click="optionNameDialogOpen = true"><v-icon>mdi-plus</v-icon></v-btn>
      </v-col>
    </v-row>
    <v-dialog v-model="optionNameDialogOpen">
      <v-card>
        <v-card-text>
          <v-text-field label="Name" :error-messages="optionNameErrors" v-model="optionName" />
        </v-card-text>
        <v-card-actions>
          <v-container>
            <v-row>
              <v-col cols="auto">
                <v-btn color="green" @click="addOption()"> Create </v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn color="red" @click="optionNameDialogOpen = false"> Exit </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
<!-- eslint-enable max-len -->
</template>

<script>

const { ipcRenderer } = window.require('electron');

export default {

  data: () => ({
    options: [],
    selectedOption: '',
    optionNameDialogOpen: false,
    optionName: '',
    optionNameErrors: '',
    running: false,
  }),

  mounted() {
    ipcRenderer.on('setSelectedOption', (ev, option) => {
      this.selectedOption = option;
    });
    ipcRenderer.on('setAvailableOptions', (ev, options) => {
      this.options = options;
    });
    ipcRenderer.on('running', (ev, isRunning) => {
      console.log('running');
      this.running = isRunning;
    });

    ipcRenderer.invoke('settingsOpened');
  },

  methods: {
    setOrRemoveOption(option) {
      this.selectedOption = option;
      ipcRenderer.invoke('setSelectedOption', this.selectedOption);
    },

    startOrStop() {
      this.running = !this.running;
      ipcRenderer.invoke('setIsRunning', this.running);
    },

    addOption() {
      if (this.options.includes(this.optionName.trim())) {
        this.optionNameErrors = 'A timer already created!';
        setTimeout(() => { this.optionNameErrors = ''; }, 5000);
      } else if (this.optionName.trim()) {
        ipcRenderer.invoke('addOption', this.optionName);
        this.optionNameDialogOpen = false;
      } else {
        this.optionNameErrors = 'A name is required';
        setTimeout(() => { this.optionNameErrors = ''; }, 5000);
      }
    },

    async removeSelectedOption() {
      const option = this.selectedOption;
      this.selectedOption = null;
      ipcRenderer.invoke('setSelectedOption', null);
      await this.$nextTick();
      ipcRenderer.invoke('removeOption', option);
    },
  },
};
</script>

<style>

</style>
