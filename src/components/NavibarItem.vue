<template>
  <button class="navibarItem" :class="{active : isActive}" @click="$emit('change')">
    <div class="icon" :style="{color: accentColor}">
      <font-awesome-icon :icon="iconText" />
    </div>
    <div class="text">{{ navitemText }}</div>
  </button>
</template>
<script>
export default {
  name: "NavibarItem",
  props: {
    iconText: {
      type: Array,
      default: function() {
        return ["fab", "font-awesome"];
      }
    },
    navitemText: {
      type: String,
      default: "Need to be edited"
    },
    accentColor: {
      type: String,
      default: "#5780FF"
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }
};
</script>
<style scoped>
.navibarItem {
  font-family: "SF Pro Display", Helvetica, Arial, sans-serif;
  color: var(--main-foreground-color);
  font-size: inherit;
  outline: none;
  border: none;
  background: transparent;
  position: relative;
  height: 2em;
  width: 220px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  /* background-color: red; */
  padding: 0.15em 0;
  margin: 0.1em 0;
  border-radius: 12px;
  transition: all ease-out 100ms;
}
.active {
  background-color: var(--sec-background-color);
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.03);
}
.icon {
  margin: 0px 10px;
}
.text {
  position: absolute;
  left: 50px;
}
</style>