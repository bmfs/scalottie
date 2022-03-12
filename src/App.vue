<script setup lang="ts">
import { computed, PropType, ref } from 'vue';
import UploadField from './components/UploadField.vue';
import Minifier from './libs/minifier';
import { scaleLottie } from "./libs/scale";

const props = defineProps({
  worker: { type: Object as PropType<Minifier>, required: true }
})

const scale = ref("0.5");
const loading = ref(false)

const currentAnimation = ref<any | null>(null);
const originalAnimation = ref<any | null>(null);
const currentFile = ref<File | null>(null);

function onGenerate() {
  if (!currentFile) return;

  loading.value = false;

  var reader = new FileReader();
  reader.onload = (e) => {
    const blob = <any>e.target?.result;
    if (typeof blob !== "string") return;
    const spec = JSON.parse(blob)
    originalAnimation.value = JSON.parse(blob);

    scaleLottie(spec, parseFloat(scale.value)).then((result) => {
      currentAnimation.value = result;
      loading.value = false;
    })

  };
  reader.readAsText(currentFile.value as Blob);
}

function onUpload(data: File) {
  console.log(data, typeof data)

  if (!data.name.endsWith('.json')) {
    console.log('expected a .json file')
    return;
  }

  loading.value = false;
  currentAnimation.value = null;
  originalAnimation.value = null;
  currentFile.value = data;
}

function onDownload() {
  const data = JSON.stringify(currentAnimation.value)

  const filename: string = currentFile.value?.name || 'animation.json';
  const basename = filename.split('.')[0]

  var element = document.createElement('a')
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(data))
  element.setAttribute('download', `${basename}_scale${Math.floor(scale.value * 100)}.json`)

  element.style.display = 'none'
  document.body.appendChild(element)
  element.click();
  document.body.removeChild(element);
}
</script>

<template>
  <div>
    <UploadField @upload="onUpload" />
    <div>
      <div class>
        <label for="scale">Scale</label>
        <input type="text" v-model="scale" />
      </div>
      <button @click="onGenerate" :disabled="!currentFile">Go</button>
    </div>

    <div v-if="loading">Loading</div>
    <div v-if="currentAnimation">
      <div>
        <Vue3Lottie :animationData="originalAnimation" :height="300" :loop="true" />
        <span>Original</span>
      </div>
      <div>
        <Vue3Lottie :animationData="currentAnimation" :height="300" :loop="true" />
        <span>Scaled</span>
      </div>

      <button @click="onDownload">Download</button>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
