<template>
  <div class="container" :class="{fullsized: isViewing}">
    <div class="contContainer" :class="{strongColor: isViewing}">
      <h1 class="title">{{ title }}</h1>
      <p
        class="authorTime"
      >Written by {{author}} at {{uploadTime.getFullYear() + "/" + (uploadTime.getMonth() + 1) + "/" + uploadTime.getDate()}}</p>
      <button
        class="expandButton"
        @click="isViewing = !isViewing"
      >View {{isViewing ? "Less" : "More"}}...</button>
    </div>
    <VueMarkdown class="markdown-body" :class="{expanded: isViewing}">{{ content }}</VueMarkdown>
  </div>
</template>

<script>
import VueMarkdown from "vue-markdown";
export default {
  name: "Article",
  components: {
    VueMarkdown
  },
  props: {
    title: {
      type: String,
      default: "Lorem Ipsum Dolor"
    },
    author: {
      type: String,
      default: "Endaytrer"
    },
    uploadTime: {
      type: Date,
      default: new Date("1926-08-17")
    },
    content: {
      type: String,
      default:
        "## Hello World!\n\n- [ ] This is a selection box\n- [x] This is a selected box\n\n![There shall be an image here](/Volumes/Data/Files/ACM/endaytrer.github.io/src/assets/logo.png)"
    }
  },
  data: function() {
    return {
      isViewing: false
    };
  }
};
</script>

<style scoped>
.container {
  margin: 0px 0px 20px;
  height: 4em;
  border-radius: calc(var(--corner-radius) - 2px);
  box-shadow: inset 0px 1px 5px rgba(0, 0, 0, 0.1);
  text-align: left;
  overflow: hidden;

  transition: var(--default-transition);
}
.contContainer {
  position: relative;
  display: flex;
  /* position: absolute; */
  justify-content: flex-start;
  align-items: center;
  padding: 0 20px;
  background-color: var(--deactivated-background-color);
  height: 4em;
  border-radius: calc(var(--corner-radius) - 2px);
  color: var(--main-foreground-color);
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);

  transition: var(--default-transition);
}
.expandButton {
  position: absolute;
  right: 20px;
  z-index: 100;
  font-size: 1em;
  color: var(--unimportant-foreground-color);
  background: none;
  border: none;
  outline: none;
  height: 40%;
  transition: var(--default-transition);
}
.expandButton:hover {
  color: var(--main-foreground-color);
}
h1 {
  text-transform: uppercase;
  font-family: Avenir Next, Helvetica Condensed, sans-serif;
  font-weight: 600;
}
.authorTime {
  text-transform: uppercase;
  color: var(--unimportant-foreground-color);
  padding-left: 20px;
}
.markdown-body {
  transform: translateY(-60px);
  margin: 20px;
  filter: blur(10px);
  transition: var(--default-transition);
}
.fullsized {
  height: 100vh;
}
.expanded {
  filter: blur(0px);
  transform: translateY(0px);
}
.strongColor {
  background-color: var(--activated-background-color);
}
</style>