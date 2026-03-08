<template>
  <v-container fluid class="not-found-page">
    <div class="glow glow-one" aria-hidden="true" />
    <div class="glow glow-two" aria-hidden="true" />

    <v-card class="not-found-card" elevation="0" border>
      <div class="error-code">404</div>
      <h1>Page Not Found</h1>
      <p>
        This route does not exist or may have been moved. You can continue
        browsing available movie sessions.
      </p>

      <div class="actions">
        <v-btn
          color="primary"
          size="large"
          variant="elevated"
          :prepend-icon="mdiMovieOpen"
          to="/sessions"
        >
          Go To Sessions
        </v-btn>
        <v-btn
          size="large"
          variant="outlined"
          :prepend-icon="mdiArrowLeft"
          @click="goBack"
        >
          Go Back
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { mdiArrowLeft, mdiMovieOpen } from "@mdi/js";

const router = useRouter();

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push("/sessions");
}
</script>

<style scoped lang="scss">
@use "sass:color";
@use "../styles/variables.scss" as *;

.not-found-page {
  min-height: calc(100vh - 160px);
  padding: clamp(1rem, 2vw, 2rem);
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    $cinema-background 0%,
    color.adjust($cinema-background, $lightness: 2%) 100%
  );
}

.glow {
  position: absolute;
  width: 22rem;
  height: 22rem;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.2;
  pointer-events: none;
}

.glow-one {
  top: -6rem;
  right: -4rem;
  background: $cinema-primary;
}

.glow-two {
  bottom: -8rem;
  left: -4rem;
  background: $cinema-accent;
}

.not-found-card {
  width: min(680px, 100%);
  border-radius: $border-radius-xl;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  text-align: center;
  position: relative;
  z-index: 1;
  background: $glass-bg;
  backdrop-filter: $glass-blur;
  border: $glass-border;
  box-shadow: $shadow-xl;

  h1 {
    margin: 0 0 0.75rem;
    color: $cinema-secondary;
    font-size: clamp(1.8rem, 3.6vw, 2.5rem);
    font-weight: 800;
    letter-spacing: 0.4px;
  }

  p {
    margin: 0 auto;
    max-width: 42ch;
    color: color.adjust($cinema-secondary, $lightness: 16%);
    font-size: clamp(1rem, 2vw, 1.1rem);
    line-height: 1.7;
  }
}

.error-code {
  font-size: clamp(4rem, 12vw, 7rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
  background: linear-gradient(
    140deg,
    $cinema-primary 0%,
    $cinema-accent 60%,
    $cinema-warning 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.actions {
  margin-top: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;

  .v-btn {
    min-width: 180px;
    text-transform: none;
    letter-spacing: normal;
  }
}

@media (max-width: 600px) {
  .not-found-card {
    border-radius: $border-radius-lg;
  }

  .actions {
    .v-btn {
      width: 100%;
    }
  }
}
</style>
