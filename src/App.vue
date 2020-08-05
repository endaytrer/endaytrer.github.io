<template>
  <div id="app" :class="{show:!isFirstPage}">
    <div
      class="background"
      :class="{show: isFirstPage || canshown, slightlyLeft: canshown, downBrightness: canshown}"
    ></div>

    <Startify :class="{textHidden: !isFirstPage && !canshown, bluring: canshown}" />
    <profile :class="{noBackground: isFirstPage,  toLeft: canshown}" />
    <navibar
      v-model="selection"
      :class="{noBackground: isFirstPage, toLeft: canshown}"
      :isLeft="canshown"
      @bing="para => {bingBackground = para}"
    />
    <div class="about" :class="{shown: canshown}">
      <h1>
        <pre>Hello World!</pre>
      </h1>
      <br />
      <pre>Powered by Github Pages, Hexo & Vue. </pre>
      <pre>programmed by Endaytrer with &lt;3 </pre>
      <br />
      <hr />
      <br />
      <pre>design: Endayrter</pre>
      <pre>front-end develop: Endayrter</pre>
      <br />
      <pre> Project management: Vue-cli </pre>
      <pre> Project framework: Vue </pre>
      <pre> Blog framework: Hexo </pre>
      <pre> Blog style: White </pre>
      <pre> Code hosting: Github(c) </pre>
      <pre> Deployment server: Github Pages </pre>
      <br />
      <pre> Monospace font: Jetbrains Mono by JetBrains(c)</pre>
      <pre> Sans-serif font: SF Pro Display by Apple(c)</pre>
      <pre> Background image: from Unsplash(c)</pre>
    </div>
  </div>
</template>

<script>
import Navibar from "./components/Navibar.vue";
import Profile from "./components/Profile.vue";
import Startify from "./components/Startify.vue";
export default {
  name: "App",
  data: function () {
    return {
      selection: 0,
      usingBing: false,
      bingBackground: false,
    };
  },
  computed: {
    isFirstPage: function () {
      return this.selection === 0;
    },
    canshown: function () {
      return this.selection === 2;
    },
  },
  components: {
    Navibar,
    Profile,
    Startify,
  },
};
</script>

<style>
#app {
  --main-background-color: #fff;
  --startify-background: url("./assets/lightBackground.jpg");
  --panel-background-color: rgba(248, 248, 248, 0.6);
  --sec-background-color: rgba(233, 233, 233, 0.8);
  --deactivated-background-color: rgba(227, 234, 240, 0.8);
  --activated-background-color: rgba(189, 224, 255, 0.8);
  --focused-background-color: rgba(255, 255, 255, 0.2);

  /* Foregrounds */
  --main-foreground-color: #2c3e50;
  --sec-foreground-color: #666;
  --unimportant-foreground-color: #999;

  --accent-color: #5780ff;

  --corner-radius: 14px;
  --default-transition: all 200ms ease-out;
}
@media only screen and (prefers-color-scheme: dark) {
  #app {
    --main-background-color: #232425;

    --startify-background: url("./assets/darkBackground.jpg");
    --panel-background-color: rgba(40, 40, 40, 0.6);
    --sec-background-color: rgba(45, 45, 45, 0.8);
    --deactivated-background-color: rgba(51, 55, 59, 0.8);
    --activated-background-color: rgba(35, 98, 153, 0.8);
    --focused-background-color: rgba(100, 100, 100, 0.2);

    --main-foreground-color: #eee;
    --sec-foreground-color: #ccc;
  }
}
#app {
  font-family: "SF Pro Display", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
  justify-content: center;
  color: var(--main-foreground-color);
  background-color: var(--main-background-color);
  background-size: cover;
  transition: var(--default-transition);
  overflow-x: hidden;
}
.contain {
  width: 60vw;
}
.columnContainer {
  width: auto;
  padding: 0px;
  display: flex;
  flex-direction: column;
}
.mainPanel {
  z-index: 10;
  transition: var(--default-transition);
  width: 60vw;
  min-height: calc(60vh + 140px);
  background-color: var(--panel-background-color);
  border-radius: var(--corner-radius);
  box-shadow: 2px 8px 16px rgba(0, 0, 0, 0.07);
  margin: 80px 20px 20px;
  padding: 5px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: var(--default-transition);
}
@media screen and (max-width: 800px) {
  .mainPanel {
    width: calc(100vh - 40px);
  }
}
.background {
  z-index: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-size: cover;
  opacity: 0;
  background-image: var(--startify-background);
  transition: var(--default-transition);
}
.show {
  opacity: 1;
}

.noBackgroundAndShadow {
  background-color: transparent !important;
  box-shadow: none;
}
#projectsRenderer {
  width: calc(100% - 10px);
}
.about {
  color: var(--main-foreground-color);
  padding: 50px;
  border-radius: var(--corner-radius);
  transform: translateX(620px);
  background-color: var(--main-background-color);
  position: fixed;
  top: 0px;
  right: 0px;
  width: calc(80% - 100px);
  max-width: 520px;
  height: calc(100% - 100px);
  transition: var(--default-transition);
}
.shown {
  z-index: 10;
  transform: translateX(0px);
  box-shadow: -10px 0px 20px rgba(0, 0, 0, 0.5);
}

.slightlyLeft {
  transform: translateX(-1%);
}
.downBrightness {
  filter: brightness(40%);
}
</style>