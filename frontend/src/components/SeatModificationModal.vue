<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h3>Modify Seat Selection</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading seat map...</p>
        </div>
        
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="loadSeatData">Retry</button>
        </div>
        
        <div v-else class="modification-content">
          <div class="current-booking-info">
            <h4>Current Reservation</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Movie:</span>
                <span class="value">{{ reservation.session?.movieTitle }}</span>
              </div>
              <div class="info-item">
                <span class="label">Session:</span>
                <span class="value">{{ formatSessionTime(reservation.session?.startTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Current Seats:</span>
                <span class="value">{{ formatSeatNumbers(reservation.seatNumbers) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Current Total:</span>
                <span class="value">{{ formatPrice(currentTotal) }}</span>
              </div>
            </div>
          </div>

          <div class="seat-selection">
            <h4>Select New Seats</h4>
            <p class="instruction">Click seats to select/deselect. Green seats are your current selection.</p>
            
            <!-- Seat Legend -->
            <div class="seat-legend">
              <div class="legend-item">
                <div class="seat-icon available"></div>
                <span>Available</span>
              </div>
              <div class="legend-item">
                <div class="seat-icon selected"></div>
                <span>Selected</span>
              </div>
              <div class="legend-item">
                <div class="seat-icon current"></div>
                <span>Current</span>
              </div>
              <div class="legend-item">
                <div class="seat-icon occupied"></div>
                <span>Occupied</span>
              </div>
            </div>

            <!-- Seat Grid -->
            <div class="seat-grid-container">
              <div class="screen">SCREEN</div>
              <div class="seat-grid">
                <div 
                  v-for="(row, rowIndex) in seatGrid" 
                  :key="rowIndex" 
                  class="seat-row"
                >
                  <span class="row-label">{{ String.fromCharCode(65 + rowIndex) }}</span>
                  <div 
                    v-for="(seat, seatIndex) in row" 
                    :key="seatIndex"
                    :class="['seat', getSeatClass(seat)]"
                    @click="toggleSeat(seat)"
                    :disabled="seat.isOccupied"
                  >
                    {{ seatIndex + 1 }}
                  </div>
                </div>
              </div>
            </div>

            <!-- New Selection Summary -->
            <div v-if="selectedSeats.length > 0" class="selection-summary">
              <h5>New Selection</h5>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Selected Seats:</span>
                  <span class="value">{{ formatSeatNumbers(selectedSeats) }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Number of Seats:</span>
                  <span class="value">{{ selectedSeats.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">New Total:</span>
                  <span class="value">{{ formatPrice(newTotal) }}</span>
                </div>
                <div v-if="priceDifference !== 0" class="summary-item">
                  <span class="label">Price Difference:</span>
                  <span :class="['value', priceDifference > 0 ? 'price-increase' : 'price-decrease']">
                    {{ priceDifference > 0 ? '+' : '' }}{{ formatPrice(priceDifference) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Cancel</button>
        <button 
          class="btn btn-primary"
          @click="confirmModification"
          :disabled="selectedSeats.length === 0 || saving"
        >
          {{ saving ? 'Saving...' : 'Confirm Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useReservationStore } from '../stores/reservations';
import axios from '../utils/axios';
import { 
  formatPrice, 
  formatSessionTime, 
  formatSeatNumbers 
} from '../utils/seatUtils';

export default {
  name: 'SeatModificationModal',
  props: {
    reservation: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'modified'],
  setup(props, { emit }) {
    const reservationStore = useReservationStore();
    const loading = ref(true);
    const saving = ref(false);
    const error = ref(null);
    const bookedSeats = ref([]);
    const selectedSeats = ref([]);
    
    // Grid configuration
    const ROWS = 10;
    const SEATS_PER_ROW = 12;

    const closeModal = () => {
      emit('close');
    };

    const seatGrid = computed(() => {
      const grid = [];
      for (let row = 0; row < ROWS; row++) {
        const seatRow = [];
        for (let seat = 0; seat < SEATS_PER_ROW; seat++) {
          const seatNumber = row * SEATS_PER_ROW + seat + 1;
          seatRow.push({
            number: seatNumber,
            row: row,
            seat: seat,
            isOccupied: bookedSeats.value.includes(seatNumber) && !props.reservation.seatNumbers.includes(seatNumber),
            isCurrent: props.reservation.seatNumbers.includes(seatNumber),
            isSelected: selectedSeats.value.includes(seatNumber)
          });
        }
        grid.push(seatRow);
      }
      return grid;
    });

    const currentTotal = computed(() => {
      return props.reservation.session?.price * props.reservation.seatsBooked || 0;
    });

    const newTotal = computed(() => {
      return props.reservation.session?.price * selectedSeats.value.length || 0;
    });

    const priceDifference = computed(() => {
      return newTotal.value - currentTotal.value;
    });

    const getSeatClass = (seat) => {
      if (seat.isOccupied) return 'occupied';
      if (seat.isCurrent && !seat.isSelected) return 'current';
      if (seat.isSelected) return 'selected';
      return 'available';
    };

    const toggleSeat = (seat) => {
      if (seat.isOccupied) return;

      const seatNumber = seat.number;
      const index = selectedSeats.value.indexOf(seatNumber);
      
      if (index > -1) {
        selectedSeats.value.splice(index, 1);
      } else {
        selectedSeats.value.push(seatNumber);
      }
      
      selectedSeats.value.sort((a, b) => a - b);
    };

    const loadSeatData = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await axios.get(`/reservations/session/${props.reservation.session.id}/booked-seats`);
        bookedSeats.value = response.data.bookedSeats;
        
        // Initialize selected seats with current reservation seats
        selectedSeats.value = [...props.reservation.seatNumbers];
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load seat data';
      } finally {
        loading.value = false;
      }
    };

    const confirmModification = async () => {
      if (selectedSeats.value.length === 0) {
        alert('Please select at least one seat');
        return;
      }

      // Check if seats have actually changed
      const currentSeats = [...props.reservation.seatNumbers].sort((a, b) => a - b);
      const newSeats = [...selectedSeats.value].sort((a, b) => a - b);
      
      if (JSON.stringify(currentSeats) === JSON.stringify(newSeats)) {
        alert('No changes made to seat selection');
        return;
      }

      if (!confirm(`Confirm seat modification?\n\nNew seats: ${formatSeatNumbers(selectedSeats.value)}\nPrice difference: ${priceDifference.value > 0 ? '+' : ''}${formatPrice(priceDifference.value)}`)) {
        return;
      }

      saving.value = true;
      try {
        await reservationStore.modifyReservation(props.reservation.id, selectedSeats.value);
        emit('modified');
        closeModal();
      } catch (err) {
        alert(err.message || 'Failed to modify reservation');
      } finally {
        saving.value = false;
      }
    };

    onMounted(() => {
      loadSeatData();
    });

    return {
      loading,
      saving,
      error,
      selectedSeats,
      seatGrid,
      currentTotal,
      newTotal,
      priceDifference,
      closeModal,
      loadSeatData,
      getSeatClass,
      toggleSeat,
      confirmModification,
      formatPrice,
      formatSessionTime,
      formatSeatNumbers
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 95%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: #f8f9fa;
}

.modal-body {
  padding: 1.5rem;
  min-height: 300px;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #dc3545;
}

.current-booking-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.current-booking-info h4 {
  margin: 0 0 1rem 0;
  color: #333;
}

.info-grid, .summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.info-item, .summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label, .summary-item .label {
  font-weight: bold;
  color: #666;
}

.info-item .value, .summary-item .value {
  color: #333;
}

.price-increase {
  color: #dc3545;
}

.price-decrease {
  color: #28a745;
}

.seat-selection h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.instruction {
  margin: 0 0 1rem 0;
  color: #666;
  font-style: italic;
}

.seat-legend {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.seat-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.seat-icon.available {
  background-color: #e9ecef;
}

.seat-icon.selected {
  background-color: #007bff;
}

.seat-icon.current {
  background-color: #28a745;
}

.seat-icon.occupied {
  background-color: #dc3545;
}

.seat-grid-container {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.screen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 0.5rem;
  margin-bottom: 2rem;
  border-radius: 20px;
  font-weight: bold;
  letter-spacing: 2px;
}

.seat-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.seat-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.row-label {
  font-weight: bold;
  color: #666;
  width: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.seat {
  width: 35px;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  transition: all 0.3s;
  user-select: none;
}

.seat.available {
  background-color: #e9ecef;
  color: #495057;
}

.seat.available:hover {
  background-color: #d1ecf1;
  transform: scale(1.1);
}

.seat.selected {
  background-color: #007bff;
  color: white;
  transform: scale(1.05);
}

.seat.current {
  background-color: #28a745;
  color: white;
}

.seat.occupied {
  background-color: #dc3545;
  color: white;
  cursor: not-allowed;
}

.selection-summary {
  background-color: #e7f3ff;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #007bff;
}

.selection-summary h5 {
  margin: 0 0 1rem 0;
  color: #007bff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
  background-color: #f8f9fa;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .modal {
    width: 95%;
    margin: 1rem;
  }
  
  .info-grid, .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .seat-grid {
    max-width: 100%;
  }
  
  .seat {
    width: 25px;
    height: 25px;
    font-size: 0.7rem;
  }
  
  .seat-legend {
    justify-content: center;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>
