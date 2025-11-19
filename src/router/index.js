//import vue router
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/admin",
    name: "home",
    component: () => import(/* webpackChunkName: "home" */ "../views/home.vue"),
  },

  // -------------------------------------------------------------------

  {
    path: "/admin/catfoods",
    name: "catfoods.index",
    component: () =>
      import(/* webpackChunkName: "index" */ "../views/catfoods/index.vue"),
  },
  {
    path: "/admin/catfoods/create",
    name: "catfoods.create",
    component: () =>
      import(/* webpackChunkName: "create" */ "../views/catfoods/create.vue"),
  },
  {
    path: "/admin/catfoods/edit/:id",
    name: "catfoods.edit",
    component: () =>
      import(/* webpackChunkName: "edit" */ "../views/catfoods/edit.vue"),
  },

  // -------------------------------------------------------------------

  {
    path: "/admin/cattoys",
    name: "cattoys.index",
    component: () =>
      import(/* webpackChunkName: "index" */ "../views/cattoys/index.vue"),
  },
  {
    path: "/admin/cattoys/create",
    name: "cattoys.create",
    component: () =>
      import(/* webpackChunkName: "create" */ "../views/cattoys/create.vue"),
  },
  {
    path: "/admin/cattoys/edit/:id",
    name: "cattoys.edit",
    component: () =>
      import(/* webpackChunkName: "edit" */ "../views/cattoys/edit.vue"),
  },
  {
    path: "/admin/orders/order",
    name: "orders.order",
    component: () =>
      import(/* webpackChunkName: "edit" */ "../views/orders/order.vue"),
  },
];

//create router
const router = createRouter({
  history: createWebHistory(),
  routes, // <-- routes,
});

export default router;
