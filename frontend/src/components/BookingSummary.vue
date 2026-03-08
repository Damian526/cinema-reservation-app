<template>
  <div class="booking-summary" v-if="selectedSeats.length > 0">
    <div class="selected-seats">
      <h4>Selected Seats: {{ selectedSeatsDisplay }}</h4>
      <p>
        Total: {{ formattedTotalPrice }} ({{ selectedSeats.length }} seats
        × {{ formatPrice(pricePerSeat) }})
      </p>
    </div>
    <v-btn
      color="primary"
      size="large"
      class="btn-large"
      @click="emit('confirm-booking')"
      :disabled="isBooking"
    >
      {{ isBooking ? "Booking..." : "Confirm Booking" }}
    </v-btn>
  </div>
  <div class="no-selection" v-else>
    <p>Please select your seats to continue</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatSeatDisplay, calculateTotalPrice, formatPrice } from "../utils/seatUtils";

const props = defineProps({
  selectedSeats: {
    type: Array,
    default: () => [],
  },
  pricePerSeat: {
    type: Number,
    default: 0,
  },
  isBooking: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm-booking"]);

const selectedSeatsDisplay = computed(() => formatSeatDisplay(props.selectedSeats));
const totalPrice = computed(() =>
  calculateTotalPrice(props.selectedSeats, props.pricePerSeat)
);
const formattedTotalPrice = computed(() => formatPrice(totalPrice.value));
</script>

<style scoped>
.booking-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border: 2px solid var(--cinema-color-primary);
  border-radius: 8px;
  margin-top: 2rem;
}

.no-selection {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.selected-seats h4 {
  margin: 0 0 0.5rem 0;
  color: rgba(0, 0, 0, 0.87);
}

.selected-seats p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.btn-large {
  min-width: 10rem;
  font-size: 1rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .booking-summary {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>

