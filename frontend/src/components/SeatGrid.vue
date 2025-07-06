<template>
  <div class="seat-grid">
    <div class="header">
      <h2>Select Your Seats</h2>
      <MovieInfo :session="session" />
    </div>

    <div class="screen">
      <div class="screen-label">SCREEN</div>
    </div>

    <div class="loading" v-if="loading">
      <p>Loading seat information...</p>
    </div>

    <template v-else>
      <SeatingArea
        :seatLayout="seatLayout"
        :bookedSeats="bookedSeats"
        :selectedSeats="selectedSeats"
        @seat-click="toggleSeat"
      />

      <SeatLegend />

      <BookingSummary
        :selectedSeats="selectedSeats"
        :pricePerSeat="pricePerSeat"
        :isBooking="booking"
        @confirm-booking="confirmBooking"
      />
    </template>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import { useReservationStore } from "../stores/reservations";
import { useAuthStore } from "../stores/auth";
import api from "../utils/axios";
import { generateSeatLayout, canSelectSeat, validateSeatSelection } from "../utils/seatUtils";
import MovieInfo from "./MovieInfo.vue";
import SeatingArea from "./SeatingArea.vue";
import SeatLegend from "./SeatLegend.vue";
import BookingSummary from "./BookingSummary.vue";

export default {
  name: "SeatGrid",
  components: {
    MovieInfo,
    SeatingArea,
    SeatLegend,
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

<style scoped>
.seat-grid {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: #333;
  margin: 0 0 0.5rem 0;
}

.screen {
  text-align: center;
  margin: 2rem 0;
}

.screen-label {
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  border: 2px solid #dee2e6;
  border-radius: 50px;
  padding: 0.5rem 2rem;
  display: inline-block;
  font-weight: bold;
  color: #495057;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

@media (max-width: 768px) {
  .seat-grid {
    padding: 1rem;
  }
}
</style>
