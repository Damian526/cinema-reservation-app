<template>
  <v-card
    class="session-card"
    elevation="4"
    :class="{ 'sold-out': session.availableSeats === 0 }"
  >
    <!-- Movie Info Section -->
    <v-card-title class="movie-header">
      <div class="movie-title-section">
        <h3 class="movie-title">{{ session.movieTitle }}</h3>
        <v-chip
          :color="getAvailabilityColor()"
          size="small"
          variant="elevated"
          class="availability-chip"
        >
          <v-icon :icon="getAvailabilityIcon()" start size="small" />
          {{ getAvailabilityText() }}
        </v-chip>
      </div>
    </v-card-title>

    <v-card-text class="movie-content">
      <p class="movie-description">
        {{ session.description || getMovieDescription(session.movieTitle) }}
      </p>

      <!-- Session Details -->
      <v-card variant="outlined" class="session-details-card">
        <v-card-text class="session-details">
          <div class="detail-row">
            <div class="time-info">
              <v-icon :icon="mdiClock" class="detail-icon" />
              <div class="time-content">
                <span class="start-time">{{
                  formatTime(session.startTime)
                }}</span>
                <span class="date">{{ formatDate(session.startTime) }}</span>
              </div>
            </div>
            <div class="seat-info">
              <v-icon :icon="mdiSeat" class="detail-icon" />
              <div class="seat-content">
                <span class="available-seats">{{
                  session.availableSeats
                }}</span>
                <span class="total-seats"
                  >/ {{ session.totalSeats }} seats</span
                >
              </div>
            </div>
          </div>

          <v-divider class="my-3" />

          <div class="price-row">
            <v-icon :icon="mdiCurrencyUsd" class="detail-icon" />
            <div class="price-content">
              <span class="price-label">Price per ticket</span>
              <span class="price-value">${{ formatPrice(session.price) }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-card-text>

    <!-- Action Buttons -->
    <v-card-actions class="session-actions">
      <v-btn
        @click="$emit('viewDetails', session)"
        variant="outlined"
        color="primary"
        class="action-btn"
      >
        Details
      </v-btn>

      <v-btn
        @click="$emit('bookSeats', session)"
        :disabled="session.availableSeats === 0"
        :color="session.availableSeats === 0 ? 'grey' : 'success'"
        variant="elevated"
        class="action-btn book-btn"
      >
        {{ session.availableSeats === 0 ? "Sold Out" : "Book Seats" }}
      </v-btn>
    </v-card-actions>

    <!-- Availability Progress Bar -->
    <div class="availability-progress">
      <v-progress-linear
        :model-value="getOccupancyPercentage()"
        :color="getProgressColor()"
        height="4"
        class="occupancy-bar"
      />
    </div>
  </v-card>
</template>

<script>
import {
  mdiClock,
  mdiSeat,
  mdiCurrencyUsd,
  mdiCheckCircle,
  mdiAlert,
  mdiCloseCircle,
} from "@mdi/js";

export default {
  name: "SessionCard",
  props: {
    session: {
      type: Object,
      required: true,
    },
  },
  emits: ["viewDetails", "bookSeats"],
  data() {
    return {
      mdiClock,
      mdiSeat,
      mdiCurrencyUsd,
      mdiCheckCircle,
      mdiAlert,
      mdiCloseCircle,
    };
  },
  methods: {
    formatTime(startTime) {
      return new Date(startTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    },

    formatDate(startTime) {
      const sessionDate = new Date(startTime);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (sessionDate.toDateString() === today.toDateString()) {
        return "Today";
      } else if (sessionDate.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      } else {
        return sessionDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    },

    formatPrice(price) {
      return Number(price || 0).toFixed(2);
    },

    getOccupancyPercentage() {
      if (!this.session.totalSeats) return 0;
      return (
        ((this.session.totalSeats - this.session.availableSeats) /
          this.session.totalSeats) *
        100
      );
    },

    getAvailabilityColor() {
      const ratio = this.session.availableSeats / this.session.totalSeats;
      if (ratio === 0) return "error";
      if (ratio < 0.2) return "warning";
      if (ratio < 0.5) return "info";
      return "success";
    },

    getAvailabilityIcon() {
      const ratio = this.session.availableSeats / this.session.totalSeats;
      if (ratio === 0) return this.mdiCloseCircle;
      if (ratio < 0.2) return this.mdiAlert;
      return this.mdiCheckCircle;
    },

    getAvailabilityText() {
      const ratio = this.session.availableSeats / this.session.totalSeats;
      if (ratio === 0) return "Sold Out";
      if (ratio < 0.2) return "Few Left";
      if (ratio < 0.5) return "Limited";
      return "Available";
    },

    getProgressColor() {
      const percentage = this.getOccupancyPercentage();
      if (percentage >= 100) return "error";
      if (percentage >= 80) return "warning";
      if (percentage >= 50) return "info";
      return "success";
    },

    getMovieDescription(movieTitle) {
      const descriptions = {
        Matrix: "A computer programmer discovers reality is a simulation.",
        Inception: "A thief enters people's dreams to steal secrets.",
        Interstellar: "A team of explorers travel through a wormhole in space.",
        "Avatar: The Way of Water":
          "Jake Sully and his family face new threats on Pandora.",
        "Top Gun: Maverick":
          "Maverick confronts his past while training new pilots.",
        "The Batman": "Batman ventures into Gotham City's underworld.",
        Dune: "A noble family becomes embroiled in a war for control over the most valuable asset.",
        "Spider-Man: No Way Home":
          "Spider-Man faces villains from across the multiverse.",
        "Black Panther: Wakanda Forever":
          "The people of Wakanda fight to protect their home.",
        "John Wick: Chapter 4":
          "John Wick uncovers a path to defeating the High Table.",
      };
      return (
        descriptions[movieTitle] || "An exciting movie experience awaits you."
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../styles/variables" as *;

.session-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $glass-bg;
  backdrop-filter: $glass-blur;
  border: $glass-border;
  border-radius: $border-radius-xl;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: $gradient-primary;
    transition: width 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    @include card-shadow-xl;

    &::before {
      width: 8px;
    }
  }

  &.sold-out {
    opacity: 0.7;
    filter: grayscale(0.3);

    &::before {
      background: $gradient-error;
    }

    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }

  .movie-header {
    background: linear-gradient(
      135deg,
      rgba($cinema-primary, 0.1) 0%,
      rgba($cinema-accent, 0.05) 100%
    );
    padding: $spacing-lg;
    position: relative;

    .movie-title-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: $spacing-md;

      .movie-title {
        margin: 0;
        color: $cinema-secondary;
        font-size: 1.3rem;
        font-weight: 700;
        line-height: 1.3;
        flex: 1;
        background: linear-gradient(135deg, $cinema-primary, $cinema-accent);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .availability-chip {
        flex-shrink: 0;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }

  .movie-content {
    flex: 1;
    padding: $spacing-lg;

    .movie-description {
      color: color.adjust($cinema-secondary, $lightness: 20%);
      margin: 0 0 $spacing-lg 0;
      font-size: 0.95rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .session-details-card {
      background: rgba($cinema-background, 0.5);
      border: 1px solid rgba($cinema-primary, 0.1);
      border-radius: $border-radius-lg;

      .session-details {
        padding: $spacing-md;

        .detail-row {
          display: flex;
          justify-content: space-between;
          gap: $spacing-md;
        }

        .time-info,
        .seat-info {
          display: flex;
          align-items: center;
          gap: $spacing-sm;
          flex: 1;

          .detail-icon {
            color: $cinema-primary;
            filter: drop-shadow(0 2px 4px rgba($cinema-primary, 0.3));
          }
        }

        .time-content,
        .seat-content {
          display: flex;
          flex-direction: column;
        }

        .start-time {
          font-size: 1.1rem;
          font-weight: 700;
          color: $cinema-primary;
          line-height: 1.2;
        }

        .date {
          font-size: 0.85rem;
          color: #{color.scale($cinema-secondary, $lightness: 30%)};
          font-weight: 500;
        }

        .available-seats {
          font-size: 1.1rem;
          font-weight: 700;
          color: $cinema-success;
          line-height: 1.2;
        }

        .total-seats {
          font-size: 0.85rem;
          color: #{color.scale($cinema-secondary, $lightness: 30%)};
          font-weight: 500;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: $spacing-sm;

          .detail-icon {
            color: $cinema-warning;
          }

          .price-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .price-label {
            font-size: 0.9rem;
            color: #{color.scale($cinema-secondary, $lightness: 20%)};
          }

          .price-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: $cinema-success;
            font-family: $font-mono;
          }
        }
      }
    }
  }

  .session-actions {
    padding: $spacing-lg;
    gap: $spacing-sm;
    background: linear-gradient(
      135deg,
      rgba($cinema-background, 0.8) 0%,
      rgba($cinema-surface, 0.9) 100%
    );

    .action-btn {
      flex: 1;
      font-weight: 600;
      text-transform: none;
      letter-spacing: 0.3px;
      border-radius: $border-radius-md;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
      }

      &.book-btn {
        position: relative;
        overflow: hidden;

        &::before {
          content: "";
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

        &:hover:not(:disabled)::before {
          width: 300px;
          height: 300px;
        }
      }
    }
  }

  .availability-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    .occupancy-bar {
      border-radius: 0;
    }
  }
}

// Mobile responsive design
@media (max-width: 768px) {
  .session-card {
    .movie-header {
      padding: $spacing-md;

      .movie-title-section {
        flex-direction: column;
        align-items: flex-start;
        gap: $spacing-sm;

        .movie-title {
          font-size: 1.1rem;
        }
      }
    }

    .movie-content {
      padding: $spacing-md;

      .session-details-card .session-details {
        .detail-row {
          flex-direction: column;
          gap: $spacing-sm;
        }

        .time-info,
        .seat-info {
          justify-content: space-between;
          align-items: center;
          flex-direction: row;

          .time-content,
          .seat-content {
            text-align: right;
          }
        }
      }
    }

    .session-actions {
      padding: $spacing-md;
      flex-direction: column;

      .action-btn {
        width: 100%;
      }
    }
  }
}

@media (max-width: 480px) {
  .session-card {
    .movie-header .movie-title-section .movie-title {
      font-size: 1rem;
    }

    .movie-content .movie-description {
      font-size: 0.9rem;
      -webkit-line-clamp: 3;
      line-clamp: 3;
    }
  }
}

// Animation for card entrance
.session-card {
  animation: cardEntrance 0.6s ease-out;
}

@keyframes cardEntrance {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .session-card {
    animation: none;
    transition: none;

    &:hover {
      transform: none;
    }

    .action-btn {
      transition: none;

      &:hover:not(:disabled) {
        transform: none;
      }
    }
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .session-card {
    background: white;
    border: 2px solid black;

    &::before {
      background: black;
    }

    .movie-header {
      background: white;
      border-bottom: 2px solid black;

      .movie-title {
        color: black;
        -webkit-text-fill-color: black;
      }
    }

    .session-details-card {
      background: white;
      border: 2px solid black;
    }

    .session-actions {
      background: white;
      border-top: 2px solid black;
    }
  }
}
</style>
