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

    <div class="seating-area" v-else>
      <div v-for="row in seatLayout" :key="row.label" class="seat-row">
        <span class="row-label">{{ row.label }}</span>
        <div class="seats">
          <div 
            v-for="seat in row.seats" 
            :key="seat.number"
            :class="['seat', getSeatClass(seat)]"
            :data-seat="seat.id"
            @click="toggleSeat(seat)"
          >
            {{ seat.display }}
          </div>
          <div v-if="row.hasGap" class="seat-gap"></div>
        </div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="seat available"></div>
        <span>Available</span>
      </div>
      <div class="legend-item">
        <div class="seat selected"></div>
        <span>Selected</span>
      </div>
      <div class="legend-item">
        <div class="seat occupied"></div>
        <span>Occupied</span>
      </div>
    </div>

    <div class="booking-summary" v-if="selectedSeats.length > 0">
      <div class="selected-seats">
        <h4>Selected Seats: {{ selectedSeatsDisplay }}</h4>
        <p>Total: ${{ totalPrice.toFixed(2) }} ({{ selectedSeats.length }} seats × ${{ session?.price || 0 }})</p>
      </div>
      <button class="btn btn-primary btn-large" @click="confirmBooking" :disabled="booking">
        {{ booking ? 'Booking...' : 'Confirm Booking' }}
      </button>
    </div>

    <div class="no-selection" v-else>
      <p>Please select your seats to continue</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useReservationStore } from '../stores/reservations'
import { useAuthStore } from '../stores/auth'
import api from '../utils/axios'

export default {
  name: "SeatGrid",
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

    // Generate seat layout based on session total seats
    const generateSeatLayout = () => {
      if (!props.session) return []
      
      const totalSeats = props.session.totalSeats
      const seatsPerRow = 10
      const rows = Math.ceil(totalSeats / seatsPerRow)
      const layout = []
      
      for (let r = 0; r < rows; r++) {
        const rowLabel = String.fromCharCode(65 + r) // A, B, C, etc.
        const row = {
          label: rowLabel,
          seats: [],
          hasGap: seatsPerRow > 6 // Add gap in middle for wider rows
        }
        
        for (let s = 1; s <= seatsPerRow; s++) {
          const seatNumber = r * seatsPerRow + s
          if (seatNumber <= totalSeats) {
            row.seats.push({
              number: seatNumber,
              id: `${rowLabel}${s}`,
              display: s,
              row: rowLabel,
              position: s
            })
          }
        }
        
        layout.push(row)
      }
      
      return layout
    }

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
      seatLayout.value = generateSeatLayout()
      await loadBookedSeats()
      loading.value = false
    }

    // Get seat CSS class
    const getSeatClass = (seat) => {
      if (bookedSeats.value.includes(seat.number)) return 'occupied'
      if (selectedSeats.value.some(s => s.number === seat.number)) return 'selected'
      return 'available'
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

    // Format time
    const formatTime = (timeString) => {
      if (!timeString) return ''
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Computed properties
    const selectedSeatsDisplay = computed(() => {
      return selectedSeats.value.map(seat => seat.id).join(', ')
    })

    const totalPrice = computed(() => {
      return selectedSeats.value.length * (props.session?.price || 0)
    })

    // Confirm booking
    const confirmBooking = async () => {
      console.log("🎭 Confirm Booking Called:");
      console.log("  - Selected seats:", selectedSeats.value.length);
      console.log("  - Session:", props.session?.movieTitle);
      
      if (selectedSeats.value.length === 0 || !props.session) return
      
      // Check if user is authenticated
      console.log("  - Auth check:");
      console.log("    - Auth store isAuth:", authStore.isAuth);
      console.log("    - Auth store token:", authStore.token ? `${authStore.token.substring(0, 20)}...` : null);
      console.log("    - Auth store user:", authStore.user);
      
      if (!authStore.isAuth) {
        console.log("  ❌ User not authenticated");
        emit('booking-complete', {
          success: false,
          message: 'Please login to make a reservation.'
        })
        return
      }
      
      console.log("  ✅ User is authenticated, proceeding with booking");
      booking.value = true
      try {
        const reservationData = {
          sessionId: props.sessionId,
          seatsCount: selectedSeats.value.length,
          seatNumbers: selectedSeats.value.map(seat => seat.number),
          customerName: authStore.user?.email || 'Current User',
          customerEmail: authStore.user?.email || 'user@example.com'
        }

        console.log("  - Reservation data prepared:", reservationData);
        await reservationStore.createReservation(reservationData)
        
        // Refresh booked seats
        await loadBookedSeats()
        
        // Clear selection
        selectedSeats.value = []
        
        emit('booking-complete', {
          success: true,
          message: 'Booking confirmed successfully!'
        })
        
      } catch (error) {
        console.error('Booking failed:', error)
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
    watch(() => props.session, () => {
      if (props.session) {
        seatLayout.value = generateSeatLayout()
      }
    })

    return {
      loading,
      booking,
      selectedSeats,
      bookedSeats,
      seatLayout,
      getSeatClass,
      toggleSeat,
      formatTime,
      selectedSeatsDisplay,
      totalPrice,
      confirmBooking
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

.seating-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 2rem 0;
}

.seat-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.row-label {
  font-weight: bold;
  color: #666;
  width: 20px;
  text-align: center;
}

.seats {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.seat {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.seat.available {
  background-color: #e9ecef;
  color: #495057;
  border-color: #dee2e6;
}

.seat.available:hover {
  background-color: #007bff;
  color: white;
  transform: scale(1.1);
}

.seat.selected {
  background-color: #28a745;
  color: white;
  border-color: #1e7e34;
  transform: scale(1.05);
}

.seat.occupied {
  background-color: #dc3545;
  color: white;
  cursor: not-allowed;
  border-color: #c82333;
}

.seat-gap {
  width: 20px;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-item .seat {
  width: 20px;
  height: 20px;
  cursor: default;
}

.legend-item span {
  font-size: 0.9rem;
  color: #495057;
}

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

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
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

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .seat-grid {
    padding: 1rem;
  }

  .booking-summary {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .legend {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .seat {
    width: 30px;
    height: 30px;
    font-size: 0.7rem;
  }

  .seats {
    gap: 0.25rem;
  }
}
</style>
