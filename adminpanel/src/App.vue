<template>
  <div class="d-flex vh-100 overflow-hidden">
    <!-- Auth Form -->
    <div
      v-if="!isAuthenticated"
      class="login-container d-flex justify-content-center align-items-center w-100 min-vh-100"
    >
      <div class="login-card p-5 rounded-4 shadow-lg position-relative">
        <div class="login-bg-pattern"></div>

        <div class="text-center mb-4">
          <div class="login-icon mb-3">
            <i class="fas fa-paw"></i>
          </div>
          <h3 class="login-title mb-2">Paws Kingdoms</h3>
          <p class="login-subtitle">
            {{
              isRegisterMode
                ? "Create an account (kode unik dibutuhkan)"
                : "Admin Dashboard"
            }}
          </p>
        </div>

        <!-- Switch Mode -->
        <div class="d-flex justify-content-center mb-3">
          <div class="btn-group">
            <button
              class="btn"
              :class="!isRegisterMode ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchMode(false)"
            >
              Login
            </button>
            <button
              class="btn"
              :class="isRegisterMode ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchMode(true)"
            >
              Register
            </button>
          </div>
        </div>

        <!-- Username -->
        <div class="form-floating mb-3">
          <input
            v-model="name"
            type="text"
            class="form-control custom-input"
            id="nameInput"
            placeholder="Enter your name"
            :disabled="isLoading"
            :class="{ 'is-invalid': hasError }"
          />
          <label for="nameInput">
            <i class="fas fa-user me-2"></i>Username
          </label>
        </div>

        <!-- Password -->
        <div class="form-floating mb-3">
          <input
            v-model="password"
            type="password"
            class="form-control custom-input"
            id="passwordInput"
            placeholder="Enter password"
            :disabled="isLoading"
            :class="{ 'is-invalid': hasError }"
          />
          <label for="passwordInput">
            <i class="fas fa-lock me-2"></i>Password
          </label>
        </div>

        <!-- Unique Code (Register only) -->
        <div class="form-floating mb-3" v-if="isRegisterMode">
          <input
            v-model="uniqueCode"
            type="text"
            class="form-control custom-input"
            id="codeInput"
            placeholder="Masukkan kode unik"
            :disabled="isLoading"
            :class="{ 'is-invalid': hasError }"
          />
          <label for="codeInput">
            <i class="fas fa-key me-2"></i>Kode Unik
          </label>
          <small class="text-muted d-block mt-2">
            Slot tersisa: {{ remainingCodes }} kode.
          </small>
        </div>

        <!-- Action -->
        <button
          class="btn btn-login w-100 mb-3 py-3"
          @click="handleSubmit"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">
            <i
              class="fas"
              :class="isRegisterMode ? 'fa-user-plus' : 'fa-sign-in-alt'"
            ></i>
            <span class="ms-2">{{
              isRegisterMode ? "Create Account" : "Sign In"
            }}</span>
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

        <div class="text-center mt-3">
          <small class="text-muted">Kerja yang bener ya - bos 😊.</small>
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
            class="nav-link text-white px-3 py-2 d-flex align-items-center"
            exact-active-class="active"
          >
            <i class="fas fa-paw me-2"></i><span>Overview Product</span>
          </router-link>

          <router-link
            :to="{ name: 'catfoods.index' }"
            class="nav-link text-white px-3 py-2 d-flex align-items-center"
            exact-active-class="active"
          >
            <i class="fas fa-utensils me-2"></i><span>Manage Cat Foods</span>
          </router-link>

          <router-link
            :to="{ name: 'cattoys.index' }"
            class="nav-link text-white px-3 py-2 d-flex align-items-center"
            exact-active-class="active"
          >
            <i class="fas fa-baseball-ball me-2"></i
            ><span>Manage Cat Toys</span>
          </router-link>
        </nav>

        <div class="mt-auto p-3">
          <button
            id="modeToggle"
            class="btn btn-light w-100 mb-2"
            @click="toggleMode"
          >
            <i class="fas fa-moon me-2" v-if="!isDarkMode"></i>
            <i class="fas fa-sun me-2" v-if="isDarkMode"></i>
            Mode
          </button>
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
            <h1 class="h5 mb-0 font-weight-bold">
              Welcome, admin {{ currentUsername }} 👋
            </h1>
            <div class="d-none d-md-block">
              <!-- <button
                class="btn btn-danger btn-sm rounded-pill px-3 py-2 d-flex align-items-center justify-content-center"
                @click="handleLogout"
              >
                Logout bro
              </button> -->
            </div>
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
      password: "",
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
      if (toRegister) this.refreshRemainingCodes();
    },
    refreshRemainingCodes() {
      this.remainingCodes = availableCodes().length;
    },
    async handleSubmit() {
      this.isLoading = true;
      this.hasError = false;
      this.errorMessage = "";
      this.infoMessage = "";

      try {
        if (this.isRegisterMode) {
          if (this.remainingCodes <= 0) {
            throw new Error("Slot admin habis. Tidak bisa mendaftar lagi.");
          }
          const res = await register(this.name, this.password, this.uniqueCode);
          this.currentUsername = res.username;
          this.isAuthenticated = authStatus();
          this.infoMessage = "Registrasi berhasil. Kamu sudah login.";
          this.showWelcomeNotification();
          this.refreshRemainingCodes();
        } else {
          const res = await login(this.name, this.password);
          this.currentUsername = res.username;
          this.isAuthenticated = authStatus();
          this.infoMessage = "Login berhasil.";
          this.showWelcomeNotification();
        }
      } catch (err) {
        this.hasError = true;
        this.errorMessage = err?.message || "Terjadi kesalahan.";
      } finally {
        this.isLoading = false;
      }
    },
    handleLogout() {
      logout();
      this.isAuthenticated = false;
      this.currentUsername = "";
      this.name = "";
      this.password = "";
      this.uniqueCode = "";
      this.infoMessage = "";
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

<style>
/* Login Container */
.login-container {
  background: linear-gradient(135deg, #c16331 0%, #eec2aa 100%);
  position: relative;
  overflow: hidden;
}
.login-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.1;
}

/* Login Card */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 480px;
  position: relative;
  overflow: hidden;
}
.login-bg-pattern {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #c16331, #c16331);
  border-radius: 100%;
  opacity: 0.1;
}

/* Login Icon */
.login-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #c16331 0%, #eec2aa 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(74, 144, 226, 0.3);
}
.login-icon i {
  font-size: 2rem;
  color: white;
}

/* Typography */
.login-title {
  color: #2d3748;
  font-weight: 700;
  font-size: 1.8rem;
}
.login-subtitle {
  color: #718096;
  margin-bottom: 0;
  font-size: 0.95rem;
}

/* Inputs */
.custom-input {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}
.custom-input:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 0.2rem rgba(74, 144, 226, 0.25);
  background: white;
}
.custom-input.is-invalid {
  border-color: #e53e3e;
  box-shadow: 0 0 0 0.2rem rgba(229, 62, 62, 0.25);
}
.form-floating > label {
  color: #718096;
  font-size: 0.9rem;
}
.form-floating > .form-control:focus ~ label,
.form-floating > .form-control:not(:placeholder-shown) ~ label {
  color: #4a90e2;
  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
}

/* Buttons */
.btn-login {
  background: linear-gradient(135deg, #c16331 0%, #c16331 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.btn-login::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 0, 0, 0.2),
    transparent
  );
  transition: left 0.5s;
}
.btn-login:hover::before {
  left: 100%;
}
.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(74, 144, 226, 0.4);
}
.btn-login:active {
  transform: translateY(0);
}
.btn-login:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}
.btn-login:disabled:hover {
  box-shadow: none;
  transform: none;
}

/* Alerts */
.alert-danger {
  background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
  border: 1px solid #fc8181;
  color: #742a2a;
  border-radius: 12px;
  font-size: 0.9rem;
}
.alert-success {
  background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
  border: 1px solid #68d391;
  color: #22543d;
  border-radius: 12px;
  font-size: 0.9rem;
}

/* Toast */
.welcome-notification {
  background: linear-gradient(135deg, #68d391 0%, #38a169 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(56, 161, 105, 0.3);
  font-weight: 500;
  z-index: 1050;
  animation: slideInRight 0.5s ease-out;
}
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Misc */
.nav-link.active {
  background-color: #6c757d;
  color: white;
  border-radius: 5px;
}
body {
  transition: background-color 0.3s, color 0.3s;
}

/* Responsive */
@media (max-width: 768px) {
  .login-card {
    margin: 1rem;
    padding: 2rem 1.5rem !important;
  }
  .login-icon {
    width: 60px;
    height: 60px;
  }
  .login-icon i {
    font-size: 1.5rem;
  }
  .login-title {
    font-size: 1.5rem;
  }
}

/* Spinner */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.fa-spinner.fa-spin {
  animation: spin 1s linear infinite;
}
</style>
