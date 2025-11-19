// import { defineConfig } from "vite";
// import vue from "@vitejs/plugin-vue";

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [vue()],
//   test: {
//     globals: true,
//     environment: "jsdom", // supaya bisa akses DOM seperti <form>, <input>
//   },
// });

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // <— ini penting
    },
  },
  test: {
    globals: true,
    environment: "jsdom", // supaya bisa akses DOM
  },
});
