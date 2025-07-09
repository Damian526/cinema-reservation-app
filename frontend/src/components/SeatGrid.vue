<template>
  <div class="seat-grid">
    <!-- Loading state -->
    <v-card v-if="loading" class="loading-card" elevation="0">
      <v-card-text class="text-center py-8">
        <v-progress-circular 
          indeterminate 
          color="primary" 
          size="48"
          class="mb-4"
        />
        <p class="text-h6 text-medium-emphasis">Loading seat information...</p>
      </v-card-text>
    </v-card>

    <!-- Main content -->
    <template v-else>
      <!-- Seating Area -->
      <SeatingArea
        :seatLayout="seatLayout"
        :bookedSeats="bookedSeats"
        :selectedSeats="selectedSeats"
        :session="session"
        @seat-click="toggleSeat"
      />

      <!-- Booking Summary -->
      <v-card class="booking-summary-card mt-4" elevation="2">
        <BookingSummary
          :selectedSeats="selectedSeats"
          :pricePerSeat="pricePerSeat"
          :isBooking="booking"
          @confirm-booking="confirmBooking"
        />
      </v-card>
    </template>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useReservationStore } from "../stores/reservations";
import { useAuthStore } from "../stores/auth";
import api from "../utils/axios";
import { generateSeatLayout, canSelectSeat, validateSeatSelection } from "../utils/seatUtils";
import SeatingArea from "./SeatingArea.vue";
import BookingSummary from "./BookingSummary.vue";

export default {
  name: "SeatGrid",
  components: {
    SeatingArea,
    BookingSummary
  },
  props: {
    sessionId: {
      type: Number,
      required: true,
    },
    session: {
      type: Object,
      default: null,
    },
  },
  emits: ["booking-complete"],
  setup(props, { emit }) {
    const reservationStore = useReservationStore();
    const authStore = useAuthStore();

    const loading = ref(true);
    const booking = ref(false);
    const selectedSeats = ref([]);
    const bookedSeats = ref([]);
    const seatLayout = ref([]);

    // Load booked seats from backend
    const loadBookedSeats = async () => {
      if (!props.sessionId) return;

      try {
        const response = await api.get(
          `/reservations/session/${props.sessionId}/booked-seats`
        );
        bookedSeats.value = response.data.bookedSeats || [];
      } catch (error) {
        console.error("Failed to load booked seats:", error);
        bookedSeats.value = [];
      }
    };

    // Initialize component
    const initialize = async () => {
      loading.value = true;
      if (props.session) {
        seatLayout.value = generateSeatLayout(props.session.totalSeats);
      }
      await loadBookedSeats();
      loading.value = false;
    };

    // Toggle seat selection
    const toggleSeat = (seat) => {
      if (!canSelectSeat(seat, bookedSeats.value)) return;

      const index = selectedSeats.value.findIndex(
        (s) => s.number === seat.number
      );
      if (index > -1) {
        selectedSeats.value.splice(index, 1);
      } else {
        selectedSeats.value.push(seat);
      }
    };

    // Confirm booking
    const confirmBooking = async () => {
      if (!props.session) return;

      // Validate seat selection
      const validation = validateSeatSelection(
        selectedSeats.value, 
        bookedSeats.value
      );
      
      if (!validation.isValid) {
        emit("booking-complete", {
          success: false,
          message: validation.errors.join('. ')
        });
        return;
      }

      // Check if user is authenticated
      if (!authStore.isAuth) {
        emit("booking-complete", {
          success: false,
          message: "Please login to make a reservation.",
        });
        return;
      }

      booking.value = true;
      try {
        const reservationData = {
          sessionId: props.sessionId,
          seatsCount: selectedSeats.value.length,
          seatNumbers: selectedSeats.value.map((seat) => seat.number),
          customerName: authStore.user?.email || "Current User",
          customerEmail: authStore.user?.email || "user@example.com",
        };

        await reservationStore.createReservation(reservationData);

        // Refresh booked seats
        await loadBookedSeats();

        // Clear selection
        selectedSeats.value = [];

        emit("booking-complete", {
          success: true,
          message: "Booking confirmed successfully!",
        });
      } catch (error) {
        console.error("Booking failed:", error);
        emit("booking-complete", {
          success: false,
          message:
            error.response?.data?.message ||
            "Booking failed. Please try again.",
        });
      } finally {
        booking.value = false;
      }
    };

    // Watch for session changes
    watch(() => props.sessionId, initialize, { immediate: true });
    watch(
      () => props.session,
      () => {
        if (props.session) {
          seatLayout.value = generateSeatLayout(props.session.totalSeats);
        }
      }
    );

    // Computed properties
    const pricePerSeat = computed(() => {
      const price = props.session?.price || 0;
      return typeof price === 'string' ? parseFloat(price) || 0 : price;
    });

    return {
      loading,
      booking,
      selectedSeats,
      bookedSeats,
      seatLayout,
      pricePerSeat,
      toggleSeat,
      confirmBooking,
    };
  },
};
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.seat-grid {
  background: transparent;
  
  .loading-card {
    background: $glass-bg;
    backdrop-filter: $glass-blur;
    border: $glass-border;
    border-radius: $border-radius-lg;
    margin-bottom: $spacing-lg;
    
    .v-progress-circular {
      color: $cinema-primary;
    }
    
    p {
      color: $cinema-secondary;
      margin: 0;
    }
  }
  
  .booking-summary-card {
    background: $glass-bg;
    backdrop-filter: $glass-blur;
    border: $glass-border;
    border-radius: $border-radius-lg;
    @include card-shadow-lg;
    overflow: hidden;
  }
}

// Mobile responsiveness
@media (max-width: 768px) {
  .seat-grid {
    .loading-card {
      margin: $spacing-md 0;
      border-radius: $border-radius-md;
    }
    
    .booking-summary-card {
      margin-top: $spacing-md;
      border-radius: $border-radius-md;
    }
  }
}

// High contrast mode
@media (prefers-contrast: high) {
  .seat-grid {
    .loading-card {
      background: white;
      border: 2px solid black;
      
      p {
        color: black;
      }
    }
    
    .booking-summary-card {
      background: white;
      border: 2px solid black;
    }
  }
}
</style>
