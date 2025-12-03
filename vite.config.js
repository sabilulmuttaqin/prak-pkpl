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

// import { defineConfig } from "vite";
// import vue from "@vitejs/plugin-vue";
// import path from "path";

// export default defineConfig({
//   plugins: [vue()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"), // <— ini penting
//     },
//   },
//   test: {
//     globals: true,
//     environment: "jsdom", // supaya bisa akses DOM
//     coverage: {
//       provider: "v8", // bawaan vitest
//       reporter: ["text", "html"], // tabel terminal + halaman HTML
//       reportsDirectory: "./coverage", // folder hasil report
//       exclude: ["node_modules/", "tests/helpers/*"],
//     },
//   },
// });

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  test: {
    globals: true,
    environment: "jsdom",

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",

      // Tambahan untuk membuat JS + Vue ikut semua
      // all: true,
      // include: ["src/**/*.{js,vue}"],

      exclude: [
        "node_modules/",
        "tests/helpers/*",
        "**/*.spec.js",
        "**/*.test.js",
      ],
    },
  },
});
