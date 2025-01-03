<template>
  <div class="d-flex vh-100 overflow-hidden">
    <!-- Authentication Form (if not authenticated) -->
    <div
      v-if="!isAuthenticated"
      class="d-flex justify-content-center align-items-center text-black w-100 min-vh-100"
    >
      <div
        class="text-center p-4 rounded-lg shadow-lg"
        style="width: 100%; max-width: 400px; background-color: #ffffff"
      >
        <h3 class="mb-4 font-weight-bold fs-4">are u real admin?</h3>

        <!-- Name Input -->
        <div class="input-group w-100 mb-3">
          <input
            v-model="name"
            type="text"
            class="form-control custom-input"
            placeholder="Enter your name"
            :disabled="isLoading"
            :class="{ 'is-invalid': loginFailed }"
          />
        </div>

        <!-- Password Input -->
        <div class="input-group w-100 mb-4">
          <input
            v-model="password"
            type="password"
            class="form-control custom-input"
            placeholder="Enter password"
            :disabled="isLoading"
            :class="{ 'is-invalid': loginFailed }"
          />
        </div>

        <!-- Login Button -->
        <button
          class="btn btn-primary w-100 mb-3"
          @click="authenticate"
          :disabled="isLoading"
        >
          Login
        </button>

        <!-- Error Message -->
        <p v-if="loginFailed" class="text-black mt-2">lol.</p>

        <!-- Loading Spinner -->
        <div v-if="isLoading" class="mt-3">
          <i class="fas fa-spinner fa-spin text-black"></i> Checking...
        </div>
      </div>
    </div>

    <!-- Dashboard (if authenticated) -->
    <div v-else class="d-flex w-100">
      <!-- Sidebar -->
      <div
        class="bg-dark text-white d-flex flex-column border-end"
        style="width: 230px"
      >
        <!-- Sidebar Header -->
        <div class="bg-dark p-3 text-center">
          <a href="#" class="h4 m-0 text-decoration-none">Paws Kingdoms</a>
        </div>

        <!-- Sidebar Navigation -->
        <nav class="nav flex-column flex-grow-1 py-3">
          <router-link
            :to="{ name: 'home' }"
            class="nav-link text-white px-3 py-2 d-flex align-items-center"
            exact-active-class="active"
          >
            <i class="fas fa-paw me-2"></i>
            <span>Overview Product</span>
          </router-link>

          <router-link
            :to="{ name: 'catfoods.index' }"
            class="nav-link text-white px-3 py-2 d-flex align-items-center"
            exact-active-class="active"
          >
            <i class="fas fa-utensils me-2"></i>
            <span>Manage Cat Foods</span>
          </router-link>

          <router-link
            :to="{ name: 'cattoys.index' }"
            class="nav-link text-white px-3 py-2 d-flex align-items-center"
            exact-active-class="active"
          >
            <i class="fas fa-baseball-ball me-2"></i>
            <span>Manage Cat Toys</span>
          </router-link>
        </nav>

        <!-- Toggle Button for Light/Dark Mode -->
        <div class="mt-auto p-3">
          <button
            id="modeToggle"
            class="btn btn-light w-100"
            @click="toggleMode"
          >
            <i class="fas fa-moon me-2" v-if="!isDarkMode"></i>
            <i class="fas fa-sun me-2" v-if="isDarkMode"></i>
            Mode
          </button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-grow-1 d-flex flex-column overflow-hidden">
        <!-- Navbar -->
        <header class="text-black mb-3">
          <div
            id="atas"
            class="container-fluid d-flex justify-content-between bg-light align-items-center p-3"
          >
            <h1 class="h5 mb-0 font-weight-bold">Welcome to Admin Dashboard</h1>
            <div class="d-none d-md-block">
              <a
                href="/"
                class="btn btn-danger btn-sm text-center rounded-pill px-3 py-2 d-flex align-items-center justify-content-center"
              >
                Logout
              </a>
            </div>
          </div>
        </header>

        <!-- Content Wrapper -->
        <main class="flex-grow-1 overflow-auto p-4">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>

    <!-- Welcome Notification -->
    <div
      v-if="showWelcome"
      class="position-fixed top-0 end-0 m-3 bg-success text-white p-3 rounded"
      style="z-index: 1050"
    >
      Welcome, {{ name }}!
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      name: "",
      password: "",
      isAuthenticated: false,
      loginFailed: false,
      isLoading: false,
      showWelcome: false,
      isDarkMode: false,
    };
  },
  methods: {
    async authenticate() {
      this.isLoading = true;

      setTimeout(() => {
        if (this.password === "1") {
          this.isAuthenticated = true;
          this.loginFailed = false;
          this.showWelcomeNotification();
        } else {
          this.loginFailed = true;
        }
        this.isLoading = false;
      }, 1500);
    },

    showWelcomeNotification() {
      this.showWelcome = true;
      setTimeout(() => {
        this.showWelcome = false;
      }, 3000);
    },

    toggleMode() {
      this.isDarkMode = !this.isDarkMode;

      if (this.isDarkMode) {
        document.body.classList.add("bg-dark", "text-white");
        document.body.classList.remove("bg-light", "text-dark");

        const atas = document.getElementById("atas");
        if (atas) {
          atas.classList.add("bg-dark", "text-white");
          atas.classList.remove("bg-light", "text-dark");
        }
      } else {
        document.body.classList.add("bg-light", "text-dark");
        document.body.classList.remove("bg-dark", "text-white");

        const atas = document.getElementById("atas");
        if (atas) {
          atas.classList.add("bg-light", "text-dark");
          atas.classList.remove("bg-dark", "text-white");
        }
      }
    },
  },
};
</script>
<style>
.nav-link.active {
  background-color: #6c757d;
  color: white;
  border-radius: 5px;
}

body {
  transition: background-color 0.3s, color 0.3s;
}
</style>
