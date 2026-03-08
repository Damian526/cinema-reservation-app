<script setup lang="ts">
import Navbar from "./components/Navbar.vue";
import { isRouteLoading } from "./router";
</script>

<template>
  <div id="app">
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <Navbar />
    <v-progress-linear
      v-if="isRouteLoading"
      indeterminate
      color="primary"
      height="3"
      class="route-loading"
    />
    <main id="main-content" tabindex="-1">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 2000;
  background: #111;
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 0 0 6px 0;
  text-decoration: none;
}

.skip-link:focus {
  left: 0;
}

.route-loading {
  z-index: 1100;
}

main {
  flex: 1;
  padding: 0;
}
</style>
