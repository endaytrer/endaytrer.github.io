<template>
  <div id="app" :class="{show:!isFirstPage}">
    <div class="background" :class="{show: isFirstPage}"></div>
    <div class="columnContainer">
      <Profile :class="{noBackground: isFirstPage}" />
      <Navibar v-model="selection" :class="{noBackground: isFirstPage}" />
    </div>
    <div class="mainPanel" :class="{noBackgroundAndShadow: isFirstPage}">
      <Startify v-if="isFirstPage" />
      <div id="projectsRenderer" v-if="selection === 1">
        <Article title="你好!"></Article>
        <Article title="桂家彬, 学!"></Article>
        <Article></Article>
        <Article></Article>
      </div>
    </div>
  </div>
</template>

<script>
import Navibar from "./components/Navibar.vue";
import Profile from "./components/Profile.vue";
import Startify from "./components/Startify.vue";
import Article from "./components/Article.vue";
export default {
  name: "App",
  data: function() {
    return {
      selection: 0
    };
  },
  computed: {
    isFirstPage: function() {
      return this.selection === 0;
    }
  },
  components: {
    Navibar,
    Profile,
    Startify,
    Article
  }
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

  /* Foregrounds */
  --main-foreground-color: #2c3e50;
  --sec-foreground-color: #666;
  --unimportant-foreground-color: #999;

  --corner-radius: 25px;
  --default-transition: all 300ms ease-out;
}
@media only screen and (prefers-color-scheme: dark) {
  #app {
    --main-background-color: #232425;

    --startify-background: url("./assets/darkBackground.jpg");
    --panel-background-color: rgba(40, 40, 40, 0.6);
    --sec-background-color: rgba(45, 45, 45, 0.8);

    --main-foreground-color: #eee;
    --sec-foreground-color: #ccc;
  }
}
#app {
  /* background-image: url("https://images.unsplash.com/photo-1593642633279-1796119d5482?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1400&q=60"); */
  font-family: "SF Pro Display", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: flex-start;
  justify-content: center;
  color: var(--main-foreground-color);
  background-color: var(--main-background-color);
  background-size: cover;
  transition: var(--default-transition);
}

.columnContainer {
  height: 100vh;
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
</style>