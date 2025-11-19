<template>
  <div class="d-flex vh-100 overflow-hidden">
    <!-- Auth Form -->
    <div
      v-if="!isAuthenticated"
      class="login-container d-flex vh-100 overflow-hidden"
    >
      <!-- Left Side - Image Section -->
      <div
        class="left-section d-none d-lg-flex flex-column justify-content-between p-5"
      >
        <div class="logo-section">
          <div class="d-flex align-items-center">
            <i class="fas fa-paw text-white fs-3 me-2"></i>
            <h2 class="text-white titlefont mb-0 fw-bold">Paws Kingdoms</h2>
          </div>
        </div>

        <div class="image-placeholder">
          <img src="./assets/cat.jpg" alt="Cat" class="hero-image" />
        </div>
      </div>

      <!-- Right Side - Form Section -->
      <div
        class="right-section d-flex align-items-center justify-content-center flex-grow-1 bg-white"
      >
        <div class="form-container">
          <!-- Logo for mobile -->
          <div class="text-center mb-4 d-lg-none">
            <div class="d-flex align-items-center justify-content-center mb-3">
              <i class="fas fa-paw text-primary fs-3 me-2"></i>
              <h2 class="mb-0 fw-bold">Paws Kingdoms</h2>
            </div>
          </div>

          <div class="text-center mb-4">
            <h3 class="fw-bold mb-2">
              {{ isRegisterMode ? "Sign Up" : "Sign In" }}
            </h3>
            <p class="text-muted">
              {{
                isRegisterMode
                  ? "Kode unik dibutuhkan untuk registrasi"
                  : "Login ke akun anda"
              }}
            </p>
          </div>

          <!-- Switch Mode -->
          <div class="d-flex justify-content-center mb-4">
            <div class="btn-group w-100">
              <button
                class="btn"
                :class="
                  !isRegisterMode ? 'modern-btn' : 'btn-outline-secondary'
                "
                @click="switchMode(false)"
              >
                Login
              </button>
              <button
                class="btn"
                :class="isRegisterMode ? 'modern-btn' : 'btn-outline-secondary'"
                @click="switchMode(true)"
              >
                Register
              </button>
            </div>
          </div>

          <!-- Username -->
          <div class="mb-3">
            <label for="nameInput" class="form-label text-muted small"
              >Username</label
            >
            <input
              v-model="name"
              type="text"
              class="form-control form-control-lg modern-input"
              id="nameInput"
              placeholder="Masukkan Username"
              :disabled="isLoading"
              :class="{ 'is-invalid': fieldErrors.name }"
            />
          </div>

          <!-- Email -->
          <div class="mb-3">
            <label for="emailInput" class="form-label text-muted small"
              >Email</label
            >
            <input
              v-model="email"
              type="email"
              class="form-control form-control-lg modern-input"
              id="emailInput"
              placeholder="name@mail.com"
              :disabled="isLoading"
              :class="{ 'is-invalid': fieldErrors.email }"
            />
          </div>

          <!-- Password -->
          <div class="mb-3">
            <label for="passwordInput" class="form-label text-muted small"
              >Password</label
            >
            <input
              v-model="password"
              type="password"
              class="form-control form-control-lg modern-input"
              id="passwordInput"
              placeholder="••••••••••"
              :disabled="isLoading"
              :class="{ 'is-invalid': fieldErrors.password }"
            />
          </div>

          <!-- Confirm Password (Register only) -->
          <div class="mb-3" v-if="isRegisterMode">
            <label
              for="confirmPasswordInput"
              class="form-label text-muted small"
              >Confirm Password</label
            >
            <input
              v-model="confirmPassword"
              type="password"
              class="form-control form-control-lg modern-input"
              id="confirmPasswordInput"
              placeholder="••••••••••"
              :disabled="isLoading"
              :class="{ 'is-invalid': fieldErrors.confirmPassword }"
            />
          </div>

          <!-- Unique Code (Register only) -->
          <div class="mb-3" v-if="isRegisterMode">
            <label for="codeInput" class="form-label text-muted small"
              >Kode Unik</label
            >
            <input
              v-model="uniqueCode"
              type="text"
              class="form-control form-control-lg modern-input"
              id="codeInput"
              placeholder="Masukkan kode unik"
              :disabled="isLoading"
              :class="{ 'is-invalid': fieldErrors.uniqueCode }"
            />
            <small class="text-muted d-block mt-2">
              Slot tersisa: {{ remainingCodes }} kode.
            </small>
          </div>

          <!-- Action Button -->
          <button
            class="btn btn-primary btn-lg w-100 mb-3 modern-btn-submit"
            @click="handleSubmit"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">
              {{ isRegisterMode ? "Create Account" : "Log in" }}
            </span>
            <span v-else>
              <i class="fas fa-spinner fa-spin me-2"></i>Processing...
            </span>
          </button>

          <!-- Messages -->
          <div
            v-if="hasError"
            class="alert alert-danger d-flex align-items-center"
            role="alert"
          >
            <i class="fas fa-exclamation-triangle me-2"></i>
            <div>{{ errorMessage }}</div>
          </div>
          <div
            v-if="infoMessage && !hasError"
            class="alert alert-success d-flex align-items-center"
            role="alert"
          >
            <i class="fas fa-check-circle me-2"></i>
            <div>{{ infoMessage }}</div>
          </div>

          <div class="text-center mt-4">
            <small class="text-muted">Kerja kerja kerja 😊</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard -->
    <div v-else class="d-flex w-100">
      <!-- Sidebar -->
      <div
        class="bg-dark text-white d-flex flex-column border-end"
        style="width: 230px"
      >
        <div class="bg-dark p-3 text-center">
          <a href="#" class="h4 m-0 text-decoration-none">Paws Kingdoms</a>
        </div>

        <nav class="nav flex-column flex-grow-1 py-3">
          <router-link
            :to="{ name: 'home' }"
            class="nav-link text-white px-4 py-2 d-flex align-items-center"
            exact-active-class="active"
          >
            <i class="fas fa-paw me-2"></i><span>Overview Product</span>
          </router-link>

          <router-link
            :to="{ name: 'catfoods.index' }"
            class="nav-link text-white px-4 py-2 d-flex align-items-center"
            exact-active-class="active"
          >
            <i class="fas fa-utensils me-2"></i><span>Manage Cat Foods</span>
          </router-link>

          <router-link
            :to="{ name: 'cattoys.index' }"
            class="nav-link text-white px-4 py-2 d-flex align-items-center"
            exact-active-class="active"
          >
            <i class="fas fa-baseball-ball me-2"></i
            ><span>Manage Cat Toys</span>
          </router-link>

          <router-link
            :to="{ name: 'orders.order' }"
            class="nav-link text-white px-4 py-2 d-flex align-items-center"
            exact-active-class="active"
          >
            <i class="fas fa-box me-2"></i><span>Manage Orders</span>
          </router-link>
        </nav>

        <div class="mt-auto p-3">
          <!-- <button
            id="modeToggle"
            class="btn btn-light w-100 mb-2"
            @click="toggleMode"
          >
            <i class="fas fa-moon me-2" v-if="!isDarkMode"></i>
            <i class="fas fa-sun me-2" v-if="isDarkMode"></i>
            Mode
          </button> -->
          <button class="btn btn-danger w-100" @click="handleLogout">
            <i class="fas fa-sign-out-alt me-2"></i> Logout
          </button>
        </div>
      </div>

      <!-- Main -->
      <div class="flex-grow-1 d-flex flex-column overflow-hidden">
        <header class="text-black mb-3">
          <div
            id="atas"
            class="container-fluid d-flex justify-content-between bg-light align-items-center p-3"
          >
            <h1 class="h5 mb-0 px-4 font-weight-bold">
              Welcome, {{ currentUsername }} 👋
            </h1>
            <div class="d-none d-md-block"></div>
          </div>
        </header>

        <main class="flex-grow-1 overflow-auto p-4">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>

    <!-- Welcome toast -->
    <div
      v-if="showWelcome"
      class="welcome-notification position-fixed top-0 end-0 m-3"
    >
      <div class="d-flex align-items-center">
        <i class="fas fa-check-circle me-2"></i>
        Welcome, admin {{ currentUsername }}!
      </div>
    </div>
  </div>
</template>

<script>
import {
  initAuth,
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated as authStatus,
  availableCodes,
} from "./api/appjs";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      uniqueCode: "",
      isAuthenticated: false,
      isRegisterMode: false,
      isLoading: false,
      hasError: false,
      errorMessage: "",
      infoMessage: "",
      showWelcome: false,
      isDarkMode: false,
      currentUsername: "",
      remainingCodes: 0,
      fieldErrors: {
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
        uniqueCode: false,
      },
    };
  },
  async mounted() {
    this.isAuthenticated = initAuth();
    const session = getCurrentUser();
    this.currentUsername = session?.username || "";
    this.refreshRemainingCodes();
  },
  methods: {
    switchMode(toRegister) {
      this.isRegisterMode = toRegister;
      this.hasError = false;
      this.errorMessage = "";
      this.infoMessage = "";
      this.resetFieldErrors();
      if (toRegister) this.refreshRemainingCodes();
    },
    resetFieldErrors() {
      this.fieldErrors = {
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
        uniqueCode: false,
      };
    },
    refreshRemainingCodes() {
      this.remainingCodes = availableCodes().length;
    },
    async handleSubmit() {
      this.isLoading = true;
      this.hasError = false;
      this.errorMessage = "";
      this.infoMessage = "";
      this.resetFieldErrors();

      try {
        if (this.isRegisterMode) {
          if (this.remainingCodes <= 0) {
            throw new Error("Slot admin habis. Tidak bisa mendaftar lagi.");
          }
          const res = await register(
            this.name,
            this.email,
            this.password,
            this.confirmPassword,
            this.uniqueCode
          );
          this.currentUsername = res.username;
          this.isAuthenticated = authStatus();
          this.infoMessage = "Registrasi berhasil. Kamu sudah login.";
          this.showWelcomeNotification();
          this.refreshRemainingCodes();
        } else {
          const res = await login(this.name, this.email, this.password);
          this.currentUsername = res.username;
          this.isAuthenticated = authStatus();
          this.infoMessage = "Login berhasil.";
          this.showWelcomeNotification();
        }
      } catch (err) {
        this.hasError = true;
        const errMsg = err?.message || "Terjadi kesalahan.";
        this.errorMessage = errMsg;

        // Tentukan field mana yang error berdasarkan pesan error
        const msgLower = errMsg.toLowerCase();

        if (msgLower.includes("username")) {
          this.fieldErrors.name = true;
        }
        if (msgLower.includes("email")) {
          this.fieldErrors.email = true;
        }
        if (
          msgLower.includes("password lama") ||
          (msgLower.includes("password") && msgLower.includes("salah"))
        ) {
          this.fieldErrors.password = true;
        }
        if (msgLower.includes("password") && msgLower.includes("minimal")) {
          this.fieldErrors.password = true;
        }
        if (
          msgLower.includes("konfirmasi password") ||
          msgLower.includes("confirm password")
        ) {
          this.fieldErrors.password = true;
          this.fieldErrors.confirmPassword = true;
        }
        if (msgLower.includes("kode unik") || msgLower.includes("kode")) {
          this.fieldErrors.uniqueCode = true;
        }

        // Jika error umum atau tidak spesifik, tandai semua field yang terisi
        if (
          !msgLower.includes("username") &&
          !msgLower.includes("email") &&
          !msgLower.includes("password") &&
          !msgLower.includes("kode")
        ) {
          if (this.name) this.fieldErrors.name = true;
          if (this.email) this.fieldErrors.email = true;
          if (this.password) this.fieldErrors.password = true;
          if (this.confirmPassword) this.fieldErrors.confirmPassword = true;
          if (this.uniqueCode) this.fieldErrors.uniqueCode = true;
        }
      } finally {
        this.isLoading = false;
      }
    },
    handleLogout() {
      logout();
      this.isAuthenticated = false;
      this.currentUsername = "";
      this.name = "";
      this.email = "";
      this.password = "";
      this.confirmPassword = "";
      this.uniqueCode = "";
      this.infoMessage = "";
      this.resetFieldErrors();
      this.refreshRemainingCodes();
    },
    showWelcomeNotification() {
      this.showWelcome = true;
      setTimeout(() => {
        this.showWelcome = false;
      }, 2500);
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

<style scoped src="./views/app.css"></style>
