<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <a href="/" class="brand-link">
          <span class="brand-icon">🎬</span>
          <span class="brand-text">CinemaApp</span>
        </a>
      </div>

      <div class="nav-menu" :class="{ active: isMenuOpen }">
        <div class="nav-links">
          <a href="/" class="nav-link active">Sessions</a>
          <a href="/my-reservations" class="nav-link">My Reservations</a>
          <a href="/profile" class="nav-link">Profile</a>
        </div>

        <div class="nav-auth">
          <!-- Logged in state -->
          <div class="user-menu" v-if="isLoggedIn">
            <div class="user-info">
              <span class="user-avatar">👤</span>
              <span class="user-name">John Doe</span>
            </div>
            <button class="btn btn-outline" @click="handleLogout">
              Logout
            </button>
          </div>

          <!-- Logged out state -->
          <div class="auth-buttons" v-else>
            <a href="/login" class="btn btn-outline">Login</a>
            <a href="/register" class="btn btn-primary">Register</a>
          </div>
        </div>
      </div>

      <div class="nav-toggle" @click="toggleMenu">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
export default {
  name: "Navbar",
  data() {
    return {
      isMenuOpen: false,
    };
  },
  computed: {
    isLoggedIn() {
      return this.auth.isAuth;
    },
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    handleLogout() {
      this.auth.logout();
      this.router.push("/login");
    },
  },
  created() {
    this.auth = useAuthStore();
    this.router = useRouter();
  },
};
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  font-size: 1.5rem;
}

.brand-icon {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.brand-text {
  color: #007bff;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #007bff;
  background: rgba(0, 123, 255, 0.1);
}

.nav-link.active {
  color: #007bff;
  background: rgba(0, 123, 255, 0.1);
}

.nav-auth {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background: #f8f9fa;
}

.user-avatar {
  font-size: 1.5rem;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
  border: 2px solid transparent;
  cursor: pointer;
  background: none;
  font-size: 0.9rem;
}

.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover {
  background: #0056b3;
  border-color: #0056b3;
}

.btn-outline {
  color: #007bff;
  border-color: #007bff;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 0.5rem;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background: #333;
  margin: 3px 0;
  transition: 0.3s;
  border-radius: 2px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-toggle {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    top: 70px;
    left: -100%;
    width: 100%;
    height: calc(100vh - 70px);
    background: white;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 2rem;
    transition: left 0.3s;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    margin-bottom: 2rem;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }

  .nav-auth {
    width: 100%;
  }

  .user-menu {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }

  .user-info {
    justify-content: center;
    width: 100%;
    padding: 1rem;
  }

  .auth-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn {
    width: 100%;
    text-align: center;
    padding: 1rem;
  }

  /* Hamburger Animation */
  .nav-toggle.active .hamburger-line:nth-child(1) {
    transform: rotate(-45deg) translate(-5px, 6px);
  }

  .nav-toggle.active .hamburger-line:nth-child(2) {
    opacity: 0;
  }

  .nav-toggle.active .hamburger-line:nth-child(3) {
    transform: rotate(45deg) translate(-5px, -6px);
  }
}

@media (max-width: 480px) {
  .nav-container {
    height: 60px;
  }

  .brand-text {
    display: none;
  }

  .nav-menu {
    top: 60px;
    height: calc(100vh - 60px);
  }
}
</style>
