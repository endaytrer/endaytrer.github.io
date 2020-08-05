<template>
  <div class="naviBar">
    <div class="selectionIndicator" :style="{transform: translation}"></div>
    <navibar-item
      v-for="item in items"
      :key="item.index"
      :icon-text="item.icon"
      :isActive="getActiveComponent(item.index)"
      :navitem-text="item.text"
      :link="getLinkText(item.index)"
      @change="setActiveComponent(item.index)"
    />
  </div>
</template>
<script>
import NavibarItem from "./NavibarItem.vue";
export default {
  name: "NaviBar",
  components: {
    NavibarItem,
  },
  props: {
    isLeft: {
      type: Boolean,
    },
    items: {
      type: Array,
      default: function () {
        return [
          {
            index: 0,
            text: "Main Page",
            icon: ["fas", "home"],
          },
          {
            index: 1,
            text: "Blog",
            icon: ["fas", "user-friends"],
            link: "./blog",
          },
          {
            index: 2,
            text: "About",
            icon: ["fa", "handshake"],
          },
        ];
      },
    },
  },
  methods: {
    getActiveComponent: function (index) {
      return this.value === index && this.isLeft;
    },
    setActiveComponent: function (index) {
      this.value = index;
      this.$emit("input", index);
    },
    getLinkText: function (index) {
      return this.items[index].link;
    },
  },
  data: function () {
    return {
      value: 0,
    };
  },
  model: {
    prop: "value",
    event: "input",
  },
  computed: {
    translation: function () {
      return "translateY(" + (6 + 36 * this.value) + "px)";
    },
  },
};
</script>
<style scoped>
.naviBar {
  left: 10%;
  max-width: 320px;
  width: calc(100% - 40px);
  position: fixed;
  bottom: 20px;
  height: auto;
  background-color: var(--panel-background-color);
  border-radius: var(--corner-radius);
  display: flex;
  margin-top: 20px;
  flex-direction: column;
  align-items: baseline;
  justify-content: flex-start;
  overflow: hidden;
  padding: 10px 0px;
  box-shadow: 2px 8px 16px rgba(0, 0, 0, 0.07);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: var(--default-transition);
}

.selectionIndicator {
  background-color: var(--accent-color);
  position: absolute;
  left: 12px;
  width: 5px;
  height: 25px;
  border-radius: 10px;
  transform: translateY(0px);
  transition: transform 0.2s ease-in-out;
}
.noBackground {
  background-color: transparent;
}
.naviBar:hover {
  background-color: var(--focused-background-color);
  box-shadow: 4px 12px 20px rgba(0, 0, 0, 0.15);
}
.toLeft {
  left: 20px;
}
@media only screen and (max-width: 1000px) {
  .toLeft {
    left: 25px;
    width: 50px;
    border-radius: 25px;
  }

  .toLeft .selectionIndicator {
    left: 10px;
    top: 8px !important;
    height: 30px;
    width: 30px;
    border-radius: 50%;
  }
  .toLeft .navibarItem {
    margin: 0.1em 0 0 5px;
  }
  .toLeft .navibarItem .icon {
    color: var(--foreground-color) !important;
  }
}
</style>