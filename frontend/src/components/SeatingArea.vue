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
              {{ sessionTimeLabel }}
            </v-chip>
            <v-chip color="info" variant="outlined" size="small" class="mr-2">
              Room {{ session?.roomNumber || "N/A" }}
            </v-chip>
            <v-chip color="success" variant="outlined" size="small">
              ${{ priceLabel }} per seat
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

<script setup lang="ts">
import { mdiClock } from "@mdi/js";
import { useSeatingArea } from "../composables/useSeatingArea";
import type { Session } from "../types/session";

type Seat = {
  number: number;
  id: string;
  display: number;
  position: number;
};

type SeatRow = {
  label: string;
  seats: Seat[];
  hasGap: boolean;
};

const props = withDefaults(
  defineProps<{
    seatLayout: SeatRow[];
    bookedSeats: number[];
    selectedSeats: Seat[];
    session: Session | null;
  }>(),
  {
    seatLayout: () => [],
    bookedSeats: () => [],
    selectedSeats: () => [],
    session: null,
  },
);

const emit = defineEmits<{
  (event: "seat-click", seat: Seat): void;
}>();

const {
  canSelectSeat,
  getSeatClass,
  getSeatTooltip,
  getSeatAriaLabel,
  handleSeatClick,
  shouldShowGap,
  sessionTimeLabel,
  priceLabel,
} = useSeatingArea(props, emit);
</script>
<style lang="scss" scoped src="../styles/components/seating-area.scss"></style>

