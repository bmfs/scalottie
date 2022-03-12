<template>
  <div>
    <input type="file" @change="onFileChange" />
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'

const emit = defineEmits<{
  (e: 'upload', data: File): void
}>()

function onFileChange(e: Event) {
  var files = (<HTMLInputElement>e.target).files || (<DragEvent>e).dataTransfer?.files;
  if (!files?.length) return;

  emit('upload', files[0])
};

</script>