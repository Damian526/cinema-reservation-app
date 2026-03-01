<template>
  <div class="session-states">
    <!-- Loading state -->
    <v-card v-if="loading" class="state-card loading-card" elevation="2">
      <v-card-text class="loading-content">
        <v-progress-circular
          indeterminate
          size="64"
          width="4"
          color="primary"
          class="loading-spinner"
        />
        <h3 class="state-title">Loading Sessions</h3>
        <p class="state-message">Please wait while we fetch the latest movie sessions...</p>
      </v-card-text>
    </v-card>

    <!-- Error state -->
    <v-card v-else-if="error" class="state-card error-card" elevation="2">
      <v-card-text class="error-content">
        <v-icon :icon="mdiAlertCircle" size="64" class="error-icon" />
        <h3 class="state-title">Oops! Something went wrong</h3>
        <p class="state-message">{{ error }}</p>
        <v-btn
          @click="$emit('retry')"
          color="primary"
          variant="elevated"
          size="large"
          prepend-icon="mdi-refresh"
          class="retry-btn"
        >
          Try Again
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Empty state -->
    <v-card v-else-if="isEmpty" class="state-card empty-card" elevation="2">
      <v-card-text class="empty-content">
        <v-icon :icon="mdiMovieOpen" size="80" class="empty-icon" />
        <h3 class="state-title">No Sessions Available</h3>
        <p class="state-message">
          There are no movie sessions scheduled for the selected date. 
          Try selecting a different date or check back later.
        </p>
        <v-btn
          @click="$emit('retry')"
          color="primary"
          variant="outlined"
          class="refresh-btn"
        >
          Refresh
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import {
  mdiAlertCircle,
  mdiMovieOpen
} from '@mdi/js';

export default {
  name: "SessionStates",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    isEmpty: {
      type: Boolean,
      default: false
    }
  },
  emits: ['retry'],
  data() {
    return {
      mdiAlertCircle,
      mdiMovieOpen
    };
  }
};
</script>

<style lang="scss" scoped>
@use 'sass:color';
@use '../styles/variables' as *;

.session-states {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: $spacing-lg;

  .state-card {
    max-width: 500px;
    width: 100%;
    background: $glass-bg;
    backdrop-filter: $glass-blur;
    border: $glass-border;
    border-radius: $border-radius-xl;
    text-align: center;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: $gradient-primary;
    }

    .state-title {
      color: $cinema-secondary;
      margin: $spacing-md 0;
      font-weight: 700;
      font-size: 1.5rem;
    }

    .state-message {
      color: #{color.scale($cinema-secondary, $lightness: 20%)};
      margin: 0 0 $spacing-lg 0;
      line-height: 1.6;
      font-size: 1rem;
    }

    &.loading-card {
      &::before {
        background: $gradient-info;
        animation: loadingPulse 2s ease-in-out infinite;
      }

      .loading-content {
        padding: $spacing-lg;

        .loading-spinner {
          margin-bottom: $spacing-md;
          filter: drop-shadow(0 4px 8px rgba($cinema-primary, 0.3));
        }
      }
    }

    &.error-card {
      &::before {
        background: $gradient-error;
      }

      .error-content {
        padding: $spacing-lg;

        .error-icon {
          color: $cinema-error;
          margin-bottom: $spacing-md;
          filter: drop-shadow(0 4px 8px rgba($cinema-error, 0.3));
          animation: shake 0.5s ease-in-out;
        }

        .retry-btn {
          margin-top: $spacing-md;
          text-transform: none;
          font-weight: 600;
        }
      }
    }

    &.empty-card {
      &::before {
        background: $gradient-warning;
      }

      .empty-content {
        padding: $spacing-lg;

        .empty-icon {
          color: $cinema-warning;
          margin-bottom: $spacing-md;
          filter: drop-shadow(0 4px 8px rgba($cinema-warning, 0.3));
          animation: float 3s ease-in-out infinite;
        }

        .refresh-btn {
          margin-top: $spacing-md;
          text-transform: none;
          font-weight: 500;
        }
      }
    }
  }
}

// Animations
@keyframes loadingPulse {
  0%, 100% {
    opacity: 1;
    transform: scaleX(1);
  }
  50% {
    opacity: 0.7;
    transform: scaleX(1.02);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

// Mobile responsive design
@media (max-width: 768px) {
  .session-states {
    padding: $spacing-md;
    min-height: 150px;

    .state-card {
      .state-title {
        font-size: 1.3rem;
      }

      .state-message {
        font-size: 0.95rem;
      }

      &.loading-card .loading-content,
      &.error-card .error-content,
      &.empty-card .empty-content {
        padding: $spacing-md;
      }
    }
  }
}

@media (max-width: 480px) {
  .session-states {
    padding: $spacing-sm;
    min-height: 120px;

    .state-card {
      .state-title {
        font-size: 1.2rem;
      }

      .state-message {
        font-size: 0.9rem;
      }
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .state-card {
    &::before {
      animation: none;
    }

    .error-icon,
    .empty-icon {
      animation: none;
    }
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .session-states {
    .state-card {
      background: white;
      border: 2px solid black;

      &::before {
        background: black;
      }

      .state-title {
        color: black;
      }

      .state-message {
        color: #333;
      }

      &.loading-card .loading-spinner {
        filter: none;
      }

      &.error-card .error-icon {
        color: #dc3545;
        filter: none;
      }

      &.empty-card .empty-icon {
        color: #ffc107;
        filter: none;
      }
    }
  }
}
</style>

