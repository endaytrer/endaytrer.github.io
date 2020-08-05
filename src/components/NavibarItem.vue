<template>
  <button class="navibarItem" :class="{active : isActive}" @click="$emit('change')">
    <a :href="link" class="hyperlink">
      <div class="icon" :class="{newIcon: isActive}">
        <font-awesome-icon :icon="iconText" />
      </div>
      <div class="text">{{ navitemText }}</div>
    </a>
  </button>
</template>
<script>
export default {
  name: "NavibarItem",
  props: {
    link: {
      type: String,
      default: "#",
    },
    iconText: {
      type: Array,
      default: function () {
        return ["fab", "font-awesome"];
      },
    },
    navitemText: {
      type: String,
      default: "Need to be edited",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style scoped>
.navibarItem {
  z-index: 5;
  font-family: "SF Pro Display", Helvetica, Arial, sans-serif;
  color: var(--main-foreground-color);
  font-size: 1em;
  outline: none;
  border: none;
  background: transparent;
  position: relative;
  min-height: 35px;
  width: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  /* background-color: red; */
  padding: 0.15em 0;
  margin: 0.1em 0 0 15px;
  border-radius: 12px;
  transition: all ease-out 100ms;
}
.icon {
  display: inline-block;
  margin: 0px 10px;
  color: var(--accent-color);
}
.text {
  display: inline-block;
}
@media only screen and (max-width: 1000px) {
  .active .newIcon {
    color: var(--foreground-color);
  }
}
.text {
  position: absolute;
  left: 50px;
}
.hyperlink {
  text-decoration: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}
</style>  