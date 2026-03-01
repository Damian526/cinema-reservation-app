<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">🎬</span>
          <span class="brand-text">CinemaApp</span>
        </router-link>
      </div>

      <div id="primary-navigation" class="nav-menu" :class="{ active: isMenuOpen }">
        <div class="nav-links">
          <router-link to="/sessions" class="nav-link">Sessions</router-link>
          <router-link to="/my-reservations" class="nav-link">My Reservations</router-link>
          <router-link to="/profile" class="nav-link">Profile</router-link>
        </div>

        <div class="nav-auth">
          <!-- Logged in state -->
          <div class="user-menu" v-if="isLoggedIn">
            <div class="user-info">
              <span class="user-avatar">👤</span>
              <span class="user-name">{{ userName }}</span>
            </div>
            <router-link v-if="isAdmin" to="/admin" class="btn btn-admin">
              ⚙️ Admin Panel
            </router-link>
            <button class="btn btn-outline" @click="handleLogout">
              Logout
            </button>
          </div>

          <!-- Logged out state -->
          <div class="auth-buttons" v-else>
            <router-link to="/login" class="btn btn-outline">Login</router-link>
            <router-link to="/register" class="btn btn-primary">Register</router-link>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="nav-toggle"
        :class="{ active: isMenuOpen }"
        :aria-label="isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
        :aria-expanded="String(isMenuOpen)"
        aria-controls="primary-navigation"
        @click="toggleMenu"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();
const isMenuOpen = ref(false);

const isLoggedIn = computed(() => auth.isAuth);
const userName = computed(() => auth.user?.username || "User");
const isAdmin = computed(() => auth.user?.role === "admin");

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

async function handleLogout() {
  await auth.logout();
  isMenuOpen.value = false;
  await router.push("/login");
}
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '../styles/variables.scss' as *;

.navbar {
  background: linear-gradient(135deg, $cinema-surface 0%, #{color.scale($cinema-surface, $lightness: 2%)} 100%);
  backdrop-filter: blur(10px);
  box-shadow: $shadow-medium;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba($cinema-primary, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-lg;
  @include flex-between;
  height: 72px;
}

.nav-brand {
  @include flex-center;
}

.brand-link {
  @include flex-center;
  text-decoration: none;
  color: $cinema-secondary;
  font-weight: 700;
  font-size: 1.6rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    filter: drop-shadow(0 4px 8px rgba($cinema-primary, 0.3));
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, $cinema-primary, $cinema-accent);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  &:hover::after {
    width: 100%;
  }
}

.brand-icon {
  font-size: 2.2rem;
  margin-right: $spacing-sm;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.brand-text {
  background: linear-gradient(135deg, $cinema-primary, $cinema-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.nav-menu {
  @include flex-center;
  gap: $spacing-xl;
}

.nav-links {
  display: flex;
  gap: $spacing-md;
  background: rgba($cinema-background, 0.5);
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-xl;
  backdrop-filter: blur(8px);
  border: 1px solid rgba($cinema-primary, 0.1);
}

.nav-link {
  text-decoration: none;
  color: #{color.scale(#666, $lightness: -10%)};
  font-weight: 600;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-md;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba($cinema-primary, 0.1), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    color: $cinema-primary;
    background: rgba($cinema-primary, 0.1);
    transform: translateY(-1px);
    box-shadow: $shadow-light;

    &::before {
      left: 100%;
    }
  }

  &.active,
  &.router-link-active {
    color: white;
    background: linear-gradient(135deg, $cinema-primary, #{color.scale($cinema-primary, $lightness: -10%)});
    box-shadow: 0 4px 12px rgba($cinema-primary, 0.4);
    transform: translateY(-1px);
  }
}

.nav-auth {
  @include flex-center;
}

.user-menu {
  @include flex-center;
  gap: $spacing-md;
}

.user-info {
  @include flex-center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-lg;
  background: linear-gradient(135deg, $cinema-background, #{color.scale($cinema-background, $lightness: 3%)});
  border: 1px solid rgba($cinema-primary, 0.15);
  box-shadow: $shadow-light;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-medium;
  }
}

.user-avatar {
  font-size: 1.6rem;
  background: linear-gradient(135deg, $cinema-primary, $cinema-accent);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  @include flex-center;
}

.user-name {
  font-weight: 600;
  color: $cinema-secondary;
  font-size: 0.95rem;
}

.auth-buttons {
  display: flex;
  gap: $spacing-md;
}

.btn {
  padding: $spacing-sm $spacing-lg;
  border-radius: $border-radius-md;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  cursor: pointer;
  background: none;
  @include responsive-font(15px, 13px);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(white, 0.2);
    border-radius: 50%;
    transition: all 0.3s ease;
    transform: translate(-50%, -50%);
  }

  &:hover::before {
    width: 300px;
    height: 300px;
  }

  &-primary {
    background: linear-gradient(135deg, $cinema-primary, color.adjust($cinema-primary, $lightness: -8%));
    color: white;
    border-color: $cinema-primary;
    box-shadow: 0 4px 15px rgba($cinema-primary, 0.3);

    &:hover {
      background: linear-gradient(135deg, color.adjust($cinema-primary, $lightness: -5%), color.adjust($cinema-primary, $lightness: -15%));
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba($cinema-primary, 0.4);
    }

    &:active {
      transform: translateY(-1px);
    }
  }

  &-outline {
    color: $cinema-primary;
    border-color: $cinema-primary;
    background: rgba($cinema-primary, 0.05);

    &:hover {
      background: linear-gradient(135deg, $cinema-primary, color.adjust($cinema-primary, $lightness: -8%));
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba($cinema-primary, 0.3);
    }

    &:active {
      transform: translateY(-1px);
    }
  }

  &-admin {
    color: #f59e0b;
    border-color: #f59e0b;
    background: rgba(#f59e0b, 0.08);

    &:hover {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(#f59e0b, 0.35);
    }

    &:active {
      transform: translateY(-1px);
    }
  }
}

.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: $spacing-sm;
  border: none;
  background: transparent;
  border-radius: $border-radius-sm;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($cinema-primary, 0.1);
  }
}

.hamburger-line {
  width: 28px;
  height: 3px;
  background: linear-gradient(90deg, $cinema-secondary, $cinema-primary);
  margin: 4px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: $border-radius-sm;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 $spacing-md;
    height: 68px;
  }

  .nav-toggle {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    top: 68px;
    left: -100%;
    width: 100%;
    height: calc(100vh - 68px);
    background: linear-gradient(180deg, $cinema-surface, color.adjust($cinema-surface, $lightness: 2%));
    backdrop-filter: blur(20px);
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: $spacing-xl;
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: inset 0 4px 20px rgba($cinema-primary, 0.1);

    &.active {
      left: 0;
    }
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    margin-bottom: $spacing-xl;
    background: rgba($cinema-background, 0.8);
    padding: $spacing-lg;
    border-radius: $border-radius-xl;
    backdrop-filter: blur(10px);
  }

  .nav-link {
    width: 100%;
    text-align: center;
    padding: $spacing-md $spacing-lg;
    margin-bottom: $spacing-sm;
    border-radius: $border-radius-lg;
    font-size: 1.1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .nav-auth {
    width: 100%;
  }

  .user-menu {
    flex-direction: column;
    width: 100%;
    gap: $spacing-lg;
    background: rgba($cinema-background, 0.8);
    padding: $spacing-xl;
    border-radius: $border-radius-xl;
    backdrop-filter: blur(10px);
  }

  .user-info {
    justify-content: center;
    width: 100%;
    padding: $spacing-lg;
    background: linear-gradient(135deg, rgba($cinema-primary, 0.1), rgba($cinema-accent, 0.1));
  }

  .auth-buttons {
    flex-direction: column;
    width: 100%;
    gap: $spacing-md;
  }

  .btn {
    width: 100%;
    text-align: center;
    padding: $spacing-lg;
    font-size: 1.1rem;
  }

  /* Enhanced Hamburger Animation */
  .nav-toggle.active {
    .hamburger-line {
      &:nth-child(1) {
        transform: rotate(-45deg) translate(-6px, 7px);
        background: linear-gradient(90deg, $cinema-accent, $cinema-primary);
      }

      &:nth-child(2) {
        opacity: 0;
        transform: scale(0);
      }

      &:nth-child(3) {
        transform: rotate(45deg) translate(-6px, -7px);
        background: linear-gradient(90deg, $cinema-accent, $cinema-primary);
      }
    }
  }
}

@media (max-width: 480px) {
  .nav-container {
    height: 64px;
    padding: 0 $spacing-md;
  }

  .brand-link {
    font-size: 1.4rem;
  }

  .brand-text {
    display: none;
  }

  .brand-icon {
    font-size: 2rem;
  }

  .nav-menu {
    top: 64px;
    height: calc(100vh - 64px);
    padding: $spacing-lg;
  }

  .nav-links {
    padding: $spacing-md;
  }

  .nav-link {
    padding: $spacing-md;
    font-size: 1rem;
  }
}

/* Smooth transitions for route changes */
.nav-link {
  &.router-link-exact-active {
    color: white;
    background: linear-gradient(135deg, $cinema-primary, $cinema-accent);
    box-shadow: 0 4px 15px rgba($cinema-primary, 0.4);
    transform: translateY(-1px);
  }
}

/* Loading animation for buttons */
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.btn {
  &:active {
    background-image: linear-gradient(90deg, transparent, rgba(white, 0.4), transparent);
    background-size: 200px 100%;
    animation: shimmer 0.6s ease-out;
  }
}
</style>
