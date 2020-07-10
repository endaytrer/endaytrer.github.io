<template>
  <div class="naviBar">
    <NavibarItem
      v-for="item in items"
      :key="item.index"
      :accent-color="accentColor"
      :icon-text="item.icon"
      :navitem-text="item.text"
      :is-active="getActiveComponent(item.index)"
      @change="setActiveComponent(item.index)"
    />
  </div>
</template>
<script>
import NavibarItem from "./NavibarItem.vue";
export default {
  name: "NaviBar",
  components: {
    NavibarItem
  },
  props: {
    items: {
      type: Array,
      default: function() {
        return [
          {
            index: 0,
            text: "Main Page",
            icon: ["fas", "home"]
          },
          {
            index: 1,
            text: "Projects",
            icon: ["fas", "boxes"]
          },
          {
            index: 2,
            text: "Design",
            icon: ["fas", "drafting-compass"]
          },
          {
            index: 3,
            text: "Collaboration",
            icon: ["fas", "user-friends"]
          }
        ];
      }
    },
    accentColor: {
      type: String,
      default: "#5780FF"
    }
  },
  data: function() {
    return {
      value: 0
    };
  },
  methods: {
    getActiveComponent: function(index) {
      return this.value === index;
    },
    setActiveComponent: function(index) {
      this.value = index;
      this.$emit("input", index);
    }
  }
};
</script>
<style>
.naviBar {
  width: 300px;
  height: 60vh;
  background-color: var(--panel-background-color);
  border-radius: var(--corner-radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 20px;
  box-shadow: 2px 8px 16px rgba(0, 0, 0, 0.07);
  backdrop-filter: blur(50px);
  transition: all ease-out 300ms;
}
</style>