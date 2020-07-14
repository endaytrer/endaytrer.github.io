<template>
  <div class="container">
    <div class="placeTaker"></div>
    <h1>Yesen, study!</h1>
  </div>
</template>

<script>
export default {
  name: "Startify"
};
</script>

<style scoped>
.container {
  height: calc(60vh + 140px);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  overflow: hidden;
}

.placeTaker {
  height: 100px;
}
h1 {
  font-family: "Jetbrains Mono", "Fira Code", "Consolas", monospace;
  font-size: 5vw;
  font-weight: 300;
  border-right: 4px solid;
  animation: grow 5s steps(13) normal both infinite, blink 1s normal infinite;
  white-space: nowrap;
}
@media only screen and (max-width: 800px) {
  .container {
    overflow: unset;
  }
  h1 {
    font-size: 8vw;
    animation: none;
    border-right: none;
  }
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
</style>