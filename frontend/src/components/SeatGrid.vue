<template>
  <div class="seat-grid">
    <div class="header">
      <h2>Select Your Seats</h2>
      <div class="movie-info" v-if="session">
        <h3>{{ session.movieTitle }} - {{ formatTime(session.startTime) }}</h3>
        <p>Room {{ session.roomNumber }} • {{ session.totalSeats }} Total Seats • ${{ session.price }} per seat</p>
      </div>
    </div>

    <div class="screen">
      <div class="screen-label">SCREEN</div>
    </div>

    <div class="loading" v-if="loading">
      <p>Loading seat information...</p>
    </div>

    <template v-else>
      <SeatLayout
        :seatLayout="seatLayout"
        :bookedSeats="bookedSeats"
        :selectedSeats="selectedSeats"
        @seat-toggle="toggleSeat"
      />

      <SeatLegend />

      <BookingSummary
        :selectedSeats="selectedSeats"
        :pricePerSeat="session?.price || 0"
        :isBooking="booking"
        @confirm-booking="confirmBooking"
      />
    </template>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useReservationStore } from '../stores/reservations'
import { useAuthStore } from '../stores/auth'
import { generateSeatLayout, formatTime } from '../utils/seatUtils'
import SeatLayout from './seat/SeatLayout.vue'
import SeatLegend from './seat/SeatLegend.vue'
import BookingSummary from './seat/BookingSummary.vue'
import api from '../utils/axios'

export default {
  name: "SeatGrid",
  components: {
    SeatLayout,
    SeatLegend,
    BookingSummary
  },
  props: {
    sessionId: {
      type: Number,
      required: true
    },
    session: {
      type: Object,
      default: null
    }
  },
  emits: ['booking-complete'],
  setup(props, { emit }) {
    const reservationStore = useReservationStore()
    const authStore = useAuthStore()
    
    const loading = ref(true)
    const booking = ref(false)
    const selectedSeats = ref([])
    const bookedSeats = ref([])
    const seatLayout = ref([])

    // Load booked seats from backend
    const loadBookedSeats = async () => {
      if (!props.sessionId) return
      
      try {
        const response = await api.get(`/reservations/session/${props.sessionId}/booked-seats`)
        bookedSeats.value = response.data.bookedSeats || []
      } catch (error) {
        console.error('Failed to load booked seats:', error)
        bookedSeats.value = []
      }
    }

    // Initialize component
    const initialize = async () => {
      loading.value = true
      seatLayout.value = generateSeatLayout(props.session?.totalSeats)
      await loadBookedSeats()
      loading.value = false
    }

    // Toggle seat selection
    const toggleSeat = (seat) => {
      if (bookedSeats.value.includes(seat.number)) return // Can't select occupied seats
      
      const index = selectedSeats.value.findIndex(s => s.number === seat.number)
      if (index > -1) {
        selectedSeats.value.splice(index, 1)
      } else {
        selectedSeats.value.push(seat)
      }
    }

    // Confirm booking
    const confirmBooking = async () => {
      if (selectedSeats.value.length === 0 || !props.session) return
      
      // Check if user is authenticated
      if (!authStore.isAuth) {
        emit('booking-complete', {
          success: false,
          message: 'Please login to make a reservation.'
        })
        return
      }
      
      booking.value = true
      try {
        const reservationData = {
          sessionId: props.sessionId,
          seatsCount: selectedSeats.value.length,
          seatNumbers: selectedSeats.value.map(seat => seat.number),
          customerName: authStore.user?.email || 'Current User',
          customerEmail: authStore.user?.email || 'user@example.com'
        }

        await reservationStore.createReservation(reservationData)
        
        // Refresh booked seats and clear selection
        await loadBookedSeats()
        selectedSeats.value = []
        
        emit('booking-complete', {
          success: true,
          message: 'Booking confirmed successfully!'
        })
        
      } catch (error) {
        emit('booking-complete', {
          success: false,
          message: error.response?.data?.message || 'Booking failed. Please try again.'
        })
      } finally {
        booking.value = false
      }
    }

    // Watch for session changes
    watch(() => props.sessionId, initialize, { immediate: true })
    watch(() => props.session?.totalSeats, () => {
      if (props.session?.totalSeats) {
        seatLayout.value = generateSeatLayout(props.session.totalSeats)
      }
    })

    return {
      loading,
      booking,
      selectedSeats,
      bookedSeats,
      seatLayout,
      toggleSeat,
      confirmBooking,
      formatTime
    }
  }
}
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

.movie-info h3 {
  color: #007bff;
  margin: 0 0 0.25rem 0;
}

.movie-info p {
  color: #666;
  margin: 0;
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
