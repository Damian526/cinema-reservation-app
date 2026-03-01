<template>
  <div class="seating-area-wrapper">
    <!-- Movie Info Header -->
    <v-card class="movie-info-card" elevation="0" variant="outlined">
      <v-card-text class="py-4">
        <div class="movie-details">
          <h2 class="movie-title">
            {{ session?.movieTitle || "Movie Session" }}
          </h2>
          <div class="session-info">
            <v-chip
              color="primary"
              variant="outlined"
              size="small"
              class="mr-2"
            >
              <v-icon :icon="mdiClock" start size="small" />
              {{ formatSessionTime() }}
            </v-chip>
            <v-chip color="info" variant="outlined" size="small" class="mr-2">
              Room {{ session?.roomNumber || "N/A" }}
            </v-chip>
            <v-chip color="success" variant="outlined" size="small">
              ${{ formatPrice() }} per seat
            </v-chip>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Seating Container -->
    <v-card class="seating-container" elevation="2">
      <!-- Screen indicator -->
      <div class="screen-section">
        <div class="screen-wrapper">
          <div class="screen">
            <span class="screen-text">SCREEN</span>
          </div>
        </div>
      </div>

      <!-- Seat layout -->
      <div class="seats-section">
        <div class="seating-grid">
          <div v-for="row in seatLayout" :key="row.label" class="seat-row">
            <!-- Left row label -->
            <div class="row-label left">{{ row.label }}</div>

            <!-- Seats container -->
            <div class="seats-container">
              <template v-for="(seat, index) in row.seats" :key="seat.number">
                <button
                  :class="['seat', getSeatClass(seat)]"
                  :data-seat="seat.id"
                  @click="handleSeatClick(seat)"
                  :disabled="!canSelectSeat(seat, bookedSeats)"
                  :title="getSeatTooltip(seat)"
                  :aria-label="getSeatAriaLabel(seat)"
                  :aria-pressed="getSeatClass(seat) === 'selected'"
                  :aria-disabled="!canSelectSeat(seat, bookedSeats)"
                >
                  {{ seat.display }}
                </button>

                <!-- Aisle gap -->
                <div v-if="shouldShowGap(row, seat)" class="aisle-gap"></div>
              </template>
            </div>

            <!-- Right row label -->
            <div class="row-label right">{{ row.label }}</div>
          </div>
        </div>
      </div>

      <!-- Seat legend -->
      <div class="legend-section">
        <v-card variant="outlined" class="legend-card">
          <v-card-text class="py-3">
            <div class="legend-title">Seat Legend</div>
            <div class="legend-items">
              <div class="legend-item">
                <div class="seat legend-seat available"></div>
                <span>Available</span>
              </div>
              <div class="legend-item">
                <div class="seat legend-seat selected"></div>
                <span>Selected</span>
              </div>
              <div class="legend-item">
                <div class="seat legend-seat occupied"></div>
                <span>Occupied</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-card>
  </div>
</template>

<script>
import { getSeatStatus, canSelectSeat, GAP_POSITION } from "../utils/seatUtils";
import { mdiClock, mdiDoor, mdiCurrencyUsd, mdiMonitor } from "@mdi/js";

export default {
  name: "SeatingArea",
  props: {
    seatLayout: {
      type: Array,
      default: () => [],
    },
    bookedSeats: {
      type: Array,
      default: () => [],
    },
    selectedSeats: {
      type: Array,
      default: () => [],
    },
    session: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["seat-click"],
  data() {
    return {
      mdiClock,
      mdiDoor,
      mdiCurrencyUsd,
      mdiMonitor,
    };
  },
  methods: {
    getSeatClass(seat) {
      return getSeatStatus(seat, this.bookedSeats, this.selectedSeats);
    },

    getSeatTooltip(seat) {
      const status = this.getSeatClass(seat);
      const statusText = {
        available: "Available - Click to select",
        selected: "Selected - Click to deselect",
        occupied: "Occupied - Cannot select",
      };
      return `Seat ${seat.display} - ${statusText[status] || "Unknown status"}`;
    },

    getSeatAriaLabel(seat) {
      const status = this.getSeatClass(seat);
      const statusText = {
        available: "available",
        selected: "selected",
        occupied: "occupied",
      };
      return `Seat ${seat.display}, ${statusText[status] || "unknown status"}`;
    },

    handleSeatClick(seat) {
      if (canSelectSeat(seat, this.bookedSeats)) {
        this.$emit("seat-click", seat);
      }
    },

    shouldShowGap(row, seat) {
      return row.hasGap && seat.position === GAP_POSITION;
    },

    formatSessionTime() {
      if (!this.session?.startTime) return "Time TBA";
      return new Date(this.session.startTime).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    },

    formatPrice() {
      return Number(this.session?.price || 0).toFixed(2);
    },

    canSelectSeat,
  },
};
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../styles/variables" as *;

.seating-area-wrapper {
  padding: $spacing-md;
  background: linear-gradient(
    135deg,
    #{color.scale($cinema-background, $lightness: 5%)} 0%,
    $cinema-background 100%
  );
  min-height: 100%;

  .movie-info-card {
    margin-bottom: $spacing-md;
    background: $glass-bg;
    backdrop-filter: $glass-blur;
    border: $glass-border;

    .movie-details {
      text-align: center;

      .movie-title {
        color: $cinema-primary;
        font-weight: 700;
        font-size: 1.5rem;
        margin: 0 0 $spacing-md 0;
        background: $gradient-primary;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .session-info {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: $spacing-sm;
      }
    }
  }

  .seating-container {
    background: $glass-bg;
    backdrop-filter: $glass-blur;
    border: $glass-border;
    border-radius: $border-radius-xl;
    overflow: hidden;

    .screen-section {
      background: linear-gradient(
        135deg,
        rgba($cinema-primary, 0.1) 0%,
        rgba($cinema-accent, 0.05) 100%
      );
      padding: $spacing-md;
      border-bottom: 1px solid rgba($cinema-primary, 0.1);
      text-align: center;

      .screen-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 0;

        .screen {
          background: linear-gradient(
            135deg,
            rgba($cinema-primary, 0.8),
            rgba($cinema-accent, 0.6)
          );
          color: white;
          padding: $spacing-sm $spacing-lg;
          border-radius: $border-radius-lg;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: $spacing-sm;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 1.5px;
          box-shadow: 0 4px 20px rgba($cinema-primary, 0.3);
          position: relative;

          &::before {
            content: "";
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: $gradient-primary;
            border-radius: $border-radius-lg;
            z-index: -1;
          }

          .screen-icon {
            font-size: 1.1rem;
          }
        }
      }
    }

    .seats-section {
      padding: $spacing-md;

      .seating-grid {
        max-width: 650px;
        margin: 0 auto;

        .seat-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: $spacing-sm;
          gap: $spacing-sm;

          .row-label {
            width: 30px;
            height: 30px;
            background: rgba($cinema-primary, 0.1);
            color: $cinema-primary;
            border: 1px solid rgba($cinema-primary, 0.3);
            border-radius: $border-radius-md;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
            flex-shrink: 0;

            &.left {
              margin-right: $spacing-sm;
            }

            &.right {
              margin-left: $spacing-sm;
            }
          }

          .seats-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            flex-wrap: wrap;

            .seat {
              width: 35px;
              height: 35px;
              border: none;
              border-radius: $border-radius-lg;
              font-size: 0.75rem;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              letter-spacing: 0.5px;

              &.available {
                background: linear-gradient(135deg, #e8f8e8, #f1faf1);
                color: #1b5e20;
                border: 2px solid #4caf50;
                box-shadow: 0 3px 10px rgba(76, 175, 80, 0.25);

                &:hover {
                  background: linear-gradient(135deg, #4caf50, #66bb6a);
                  color: white;
                  transform: scale(1.15) translateY(-3px);
                  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.45);
                  z-index: 5;
                }
              }

              &.selected {
                background: $gradient-primary;
                color: white;
                border: 2px solid $cinema-accent;
                transform: scale(1.08);
                box-shadow: 0 5px 20px rgba($cinema-primary, 0.5);
                animation: selectedGlow 2s infinite;
                z-index: 3;

                &:hover {
                  transform: scale(1.15) translateY(-3px);
                  box-shadow: 0 8px 25px rgba($cinema-primary, 0.6);
                }
              }

              &.occupied {
                background: linear-gradient(135deg, #ffebee, #ffcdd2);
                color: #c62828;
                border: 2px solid #f44336;
                cursor: not-allowed;
                opacity: 0.8;
                position: relative;

                &::before {
                  content: "✕";
                  position: absolute;
                  font-size: 1.1rem;
                  font-weight: 900;
                  color: #d32f2f;
                  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }
              }

              &:disabled {
                pointer-events: none;
              }

              // Add subtle inner glow
              &::after {
                content: "";
                position: absolute;
                top: 2px;
                left: 2px;
                right: 2px;
                bottom: 2px;
                border-radius: calc(#{$border-radius-lg} - 2px);
                background: linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.3) 0%,
                  rgba(255, 255, 255, 0.1) 50%,
                  rgba(255, 255, 255, 0.05) 100%
                );
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
              }

              &.available:hover::after,
              &.selected::after {
                opacity: 1;
              }
            }

            .aisle-gap {
              width: 24px;
              height: 3px;
              background: linear-gradient(
                90deg,
                transparent 0%,
                rgba($cinema-primary, 0.3) 50%,
                transparent 100%
              );
              border-radius: 2px;
              margin: 0 $spacing-xs;
              position: relative;

              &::before {
                content: "";
                position: absolute;
                top: -2px;
                left: 50%;
                transform: translateX(-50%);
                width: 8px;
                height: 7px;
                background: $cinema-primary;
                border-radius: 50% 50% 0 0;
                opacity: 0.5;
              }
            }
          }
        }
      }
    }

    .legend-section {
      padding: $spacing-sm $spacing-md;
      background: rgba($cinema-surface, 0.5);
      border-top: 1px solid rgba($cinema-primary, 0.1);

      .legend-card {
        background: transparent;
        border: 1px solid rgba($cinema-primary, 0.2);

        .legend-title {
          text-align: center;
          font-weight: 700;
          color: $cinema-secondary;
          margin-bottom: $spacing-md;
          font-size: 1rem;
        }

        .legend-items {
          display: flex;
          justify-content: center;
          gap: $spacing-xl;
          flex-wrap: wrap;

          .legend-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: $spacing-xs;

            .legend-seat {
              width: 32px;
              height: 32px;
              border-radius: $border-radius-lg;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 0.75rem;
              pointer-events: none;
              position: relative;
              letter-spacing: 0.5px;

              &.available {
                background: linear-gradient(135deg, #e8f8e8, #f1faf1);
                color: #1b5e20;
                border: 2px solid #4caf50;
                box-shadow: 0 3px 10px rgba(76, 175, 80, 0.25);
              }

              &.selected {
                background: $gradient-primary;
                color: white;
                border: 2px solid $cinema-accent;
                box-shadow: 0 5px 20px rgba($cinema-primary, 0.5);
              }

              &.occupied {
                background: linear-gradient(135deg, #ffebee, #ffcdd2);
                color: #c62828;
                border: 2px solid #f44336;

                &::before {
                  content: "✕";
                  font-size: 1rem;
                  font-weight: 900;
                  color: #d32f2f;
                }
              }

              // Add subtle inner glow to legend items too
              &::after {
                content: "";
                position: absolute;
                top: 2px;
                left: 2px;
                right: 2px;
                bottom: 2px;
                border-radius: calc(#{$border-radius-lg} - 2px);
                background: linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.3) 0%,
                  rgba(255, 255, 255, 0.1) 50%,
                  rgba(255, 255, 255, 0.05) 100%
                );
                pointer-events: none;
              }
            }

            span {
              font-size: 0.85rem;
              color: $cinema-secondary;
              font-weight: 500;
              text-align: center;
            }
          }
        }
      }
    }
  }
}

// Animations
@keyframes selectedGlow {
  0%,
  100% {
    box-shadow: 0 5px 20px rgba($cinema-primary, 0.5);
  }
  50% {
    box-shadow: 0 5px 20px rgba($cinema-primary, 0.7),
      0 0 0 4px rgba($cinema-primary, 0.3);
  }
}

// Mobile responsive design
@media (max-width: 768px) {
  .seating-area-wrapper {
    padding: $spacing-sm;

    .movie-info-card .movie-details {
      .movie-title {
        font-size: 1.2rem;
      }

      .session-info {
        flex-direction: column;
        align-items: center;
        gap: $spacing-xs;
      }
    }

    .seating-container {
      .screen-section {
        padding: $spacing-md;

        .screen-wrapper .screen {
          padding: $spacing-sm $spacing-md;
          font-size: 0.9rem;
          letter-spacing: 1px;
        }
      }

      .seats-section {
        padding: $spacing-md;

        .seating-grid .seat-row {
          margin-bottom: 4px;
          gap: $spacing-xs;

          .row-label {
            width: 24px;
            height: 24px;
            font-size: 0.7rem;
          }

          .seats-container {
            gap: 3px;

            .seat {
              width: 28px;
              height: 28px;
              font-size: 0.65rem;
              border-radius: $border-radius-md;

              &.available:hover {
                transform: scale(1.1) translateY(-2px);
              }

              &.selected:hover {
                transform: scale(1.1) translateY(-2px);
              }

              &::after {
                border-radius: calc(#{$border-radius-md} - 2px);
              }
            }

            .aisle-gap {
              width: 12px;
              height: 2px;
            }
          }
        }
      }

      .legend-section {
        padding: $spacing-sm;

        .legend-card .legend-items {
          gap: $spacing-sm;

          .legend-item .legend-seat {
            width: 24px;
            height: 24px;
            font-size: 0.65rem;
          }
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .seating-area-wrapper {
    padding: 4px;

    .seating-container {
      .seats-section .seating-grid .seat-row {
        .seats-container .seat {
          width: 24px;
          height: 24px;
          font-size: 0.6rem;
          border-radius: $border-radius-sm;

          &::after {
            border-radius: calc(#{$border-radius-sm} - 1px);
          }
        }

        .aisle-gap {
          width: 8px;
          height: 1px;
        }
      }

      .legend-section .legend-card .legend-items {
        .legend-item {
          .legend-seat {
            width: 20px;
            height: 20px;
            border-radius: $border-radius-sm;
            font-size: 0.6rem;
          }

          span {
            font-size: 0.7rem;
          }
        }
      }
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .seating-area-wrapper {
    .seating-container {
      .seats-section .seating-grid .seat-row .seats-container .seat {
        transition: none;
        animation: none;

        &:hover {
          transform: none;
        }
      }
    }
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .seating-area-wrapper {
    background: white;

    .movie-info-card {
      background: white;
      border: 2px solid black;
    }

    .seating-container {
      background: white;
      border: 2px solid black;

      .screen-section .screen-wrapper .screen {
        background: black;
        color: white;
        border: 2px solid black;
      }

      .seats-section .seating-grid .seat-row {
        .row-label {
          background: white;
          color: black;
          border: 2px solid black;
        }

        .seats-container .seat {
          &.available {
            background: white;
            color: black;
            border: 2px solid green;
          }

          &.selected {
            background: blue;
            color: white;
            border: 2px solid blue;
          }

          &.occupied {
            background: white;
            color: red;
            border: 2px solid red;
          }
        }
      }

      .legend-section .legend-card {
        background: white;
        border: 2px solid black;
      }
    }
  }
}
</style>
