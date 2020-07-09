<template>
  <div class="profile">
    <div class="blurLayer"></div>
    <img :src="profilePhoto" alt class="profilePhoto" />
    <div class="textView">
      <div class="name">{{ name }}</div>

      <div class="socialMediaIcons">
        <a class="iconContainer" href="https://github.com/endaytrer">
          <font-awesome-icon :icon="['fab','github']" size="1x" />
        </a>
        <a class="iconContainer" href="https://twitter.com/endaytrer">
          <font-awesome-icon :icon="['fab','twitter']" size="1x" />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Profile",
  props: {
    name: {
      type: String,
      default: "Endaytrer"
    },
    profilePhoto: {
      type: String,
      default:
        "https://avatars3.githubusercontent.com/u/49216312?s=400&u=f1699afc6ee4c233cc002a16fcba29215efd16d4&v=4"
    }
  }
};
</script>

<style>
.profile {
  width: 300px;
  height: 100px;
  margin: 0px 0px 20px;
  border-radius: var(--corner-radius);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  backdrop-filter: blur(50px);
  background-color: var(--sec-background-color);
  box-shadow: 2px 8px 16px rgba(0, 0, 0, 0.07);
  transition: all ease-out 300ms;
}
.profilePhoto {
  margin: 0px 20px;
  width: 60px;
  height: 60px;
  background-size: cover;
  border-radius: 30px;
}
.textView {
  font-size: 1.15em;
  display: flex;
  flex-direction: column;
}
.socialMediaIcons {
  display: flex;
}
.iconContainer {
  text-decoration: none;
  color: var(--sec-foreground-color);
  margin: 5px 10px 0px 0px;
  transition: all ease-out 200ms;
}
.iconContainer:hover {
  color: var(--main-foreground-color);
}
.noBackground {
  background-color: transparent;
}
</style>
