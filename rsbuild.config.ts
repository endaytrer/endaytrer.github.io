import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import blogConfig from './blog.config';


export default defineConfig({
  plugins: [
    pluginReact(),
  ],
  html: {
    title: `${blogConfig.realName}'s Blog`,
    template: "./static/index.html"
  },
  source: {
    entry: {
      index: "./src/index.tsx",
      blogs: "./src/blogs.tsx",
    }
  }
});
