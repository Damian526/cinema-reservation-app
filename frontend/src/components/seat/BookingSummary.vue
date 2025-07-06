<template>
  <div v-if="selectedSeats.length > 0" class="booking-summary">
    <div class="selected-seats">
      <h4>Selected Seats: {{ selectedSeatsDisplay }}</h4>
      <p>Total: ${{ totalPrice.toFixed(2) }} ({{ selectedSeats.length }} seats × ${{ pricePerSeat }})</p>
    </div>
    <button 
      class="btn btn-primary btn-large" 
      @click="$emit('confirm-booking')" 
      :disabled="isBooking"
    >
      {{ isBooking ? 'Booking...' : 'Confirm Booking' }}
    </button>
  </div>
  <div v-else class="no-selection">
    <p>Please select your seats to continue</p>
  </div>
</template>

<script>
export default {
  name: 'BookingSummary',
  props: {
    selectedSeats: {
      type: Array,
      required: true
    },
    pricePerSeat: {
      type: Number,
      default: 0
    },
    isBooking: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    selectedSeatsDisplay() {
      return this.selectedSeats.map(seat => seat.id).join(', ')
    },
    totalPrice() {
      return this.selectedSeats.length * this.pricePerSeat
    }
  },
  emits: ['confirm-booking']
}
</script>

<style scoped>
.booking-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border: 2px solid #007bff;
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
  color: #333;
}

.selected-seats p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
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
