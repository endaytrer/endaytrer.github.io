<template>
  <div id="app">
    <div class="colorBackground" :class="{show:!isFirstPage}"></div>
    <div class="columnContainer">
      <Profile :class="{noBackground: isFirstPage}" />
      <Navibar v-model="selection" :class="{noBackground: isFirstPage}" />
    </div>
    <div class="mainPanel" :class="{noBackgroundAndShadow: isFirstPage}">
      <Startify v-if="isFirstPage" />
    </div>
  </div>
</template>

<script>
import Navibar from "./components/Navibar.vue";
import Profile from "./components/Profile.vue";
import Startify from "./components/Startify.vue";
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
    Startify
  }
};
</script>

<style>
:root {
  --main-background-color: #fff;
  --startify-background: url("./assets/lightBackground.jpg");
  --panel-background-color: rgba(248, 248, 248, 0.6);
  --sec-background-color: rgba(233, 233, 233, 0.8);

  /* Foregrounds */
  --main-foreground-color: #2c3e50;
  --sec-foreground-color: #666;

  --corner-radius: 25px;
}
@media only screen and (prefers-color-scheme: dark) {
  :root {
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
  height: 100vh;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  color: var(--main-foreground-color);
  background-image: var(--startify-background);
  background-size: cover;
  transition: all 300ms ease-out;
}
.colorBackground {
  z-index: 0;
  position: absolute;
  opacity: 0;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  background-color: var(--main-background-color);
  transition: all 0.3s ease-out;
}

.columnContainer {
  padding: 0px;
  display: flex;
  flex-direction: column;
}
.mainPanel {
  z-index: 10;
  transition: all ease-out 0.3s;
  width: 60vw;
  min-height: calc(60vh + 140px);
  background-color: var(--panel-background-color);
  border-radius: var(--corner-radius);
  box-shadow: 2px 8px 16px rgba(0, 0, 0, 0.07);
  margin: 20px 40px;
  display: flex;
  flex-direction: column;
}

.show {
  opacity: 1;
}

.noBackgroundAndShadow {
  background-color: transparent !important;
  box-shadow: none;
}
</style>