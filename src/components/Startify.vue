<template>
  <div class="container">
    <h1>Yesen, study!</h1>
  </div>
</template>

<script>
export default {
  name: "Startify",
};
</script>

<style scoped>
.container {
  margin-left: 10%;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 50vw;
  overflow: hidden;
  transform: translateX(0px);
  transition: var(--default-transition);
}

.textHidden h1 {
  color: transparent !important;
  border-color: transparent !important;
}
h1 {
  font-family: "Jetbrains Mono", "Fira Code", "Consolas", monospace;
  font-size: 6vw;
  font-weight: 300;
  border-right: 4px solid;
  animation: grow 5s steps(13) normal both infinite, blink 1s normal infinite;
  white-space: nowrap;
  overflow: hidden;
  transition: var(--default-transition);
}

@keyframes grow {
  0% {
    width: 0;
  }
  30% {
    width: 14ex;
  }
  85% {
    width: 14ex;
  }
  95% {
    width: 0;
  }
  100% {
    width: 0;
  }
}
@keyframes blink {
  from {
    border-right-color: var(--main-foreground-color);
  }
  to {
    border-right-color: transparent;
  }
}
.bluring h1 {
  filter: blur(10px);
}
.bluring {
  filter: brightness(40%);
  transform: translateX(-6%);
}
</style>