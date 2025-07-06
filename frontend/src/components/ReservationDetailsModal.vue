<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h3>Reservation Details</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading details...</p>
        </div>
        
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="fetchDetails">Retry</button>
        </div>
        
        <div v-else-if="reservation" class="reservation-details">
          <div class="detail-section">
            <h4>Movie Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Movie:</span>
                <span class="value">{{ reservation.session?.movieTitle || 'Unknown' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Description:</span>
                <span class="value">{{ reservation.session?.description || 'No description available' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Duration:</span>
                <span class="value">{{ formatDuration(reservation.session) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Session Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Date & Time:</span>
                <span class="value">{{ formatSessionTime(reservation.session?.startTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Room:</span>
                <span class="value">{{ reservation.session?.roomNumber || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Total Seats in Room:</span>
                <span class="value">{{ reservation.session?.totalSeats || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Booking Information</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Booking ID:</span>
                <span class="value">#RSV{{ String(reservation.id).padStart(3, '0') }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Reserved Seats:</span>
                <span class="value">{{ formatSeatNumbers(reservation.seatNumbers) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Number of Seats:</span>
                <span class="value">{{ reservation.seatsBooked }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Price per Seat:</span>
                <span class="value">{{ formatPrice(reservation.session?.price) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Total Amount:</span>
                <span class="value total-amount">{{ formatPrice(calculateTotal()) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Booked On:</span>
                <span class="value">{{ formatDateTime(reservation.reservedAt) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>Status</h4>
            <div class="status-info">
              <div :class="['status-badge', getReservationStatus()]">
                {{ getStatusLabel() }}
              </div>
              <p class="status-description">{{ getStatusDescription() }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Close</button>
        <button 
          v-if="reservation && canModify()" 
          class="btn btn-warning"
          @click="$emit('modify', reservation)"
        >
          Modify Reservation
        </button>
        <button 
          v-if="reservation && canCancel()" 
          class="btn btn-danger"
          @click="$emit('cancel', reservation)"
        >
          Cancel Reservation
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useReservationStore } from '../stores/reservations';
import { 
  formatPrice, 
  formatDateTime, 
  formatSessionTime, 
  formatSeatNumbers,
  getReservationStatus 
} from '../utils/seatUtils';

export default {
  name: 'ReservationDetailsModal',
  props: {
    reservationId: {
      type: Number,
      required: true
    }
  },
  emits: ['close', 'modify', 'cancel'],
  setup(props, { emit }) {
    const reservationStore = useReservationStore();
    const reservation = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const closeModal = () => {
      emit('close');
    };

    const fetchDetails = async () => {
      loading.value = true;
      error.value = null;
      try {
        reservation.value = await reservationStore.getReservationDetails(props.reservationId);
      } catch (err) {
        error.value = err.message || 'Failed to load reservation details';
      } finally {
        loading.value = false;
      }
    };

    const calculateTotal = () => {
      if (reservation.value?.session?.price && reservation.value?.seatsBooked) {
        return reservation.value.session.price * reservation.value.seatsBooked;
      }
      return 0;
    };

    const formatDuration = (session) => {
      if (!session?.startTime || !session?.endTime) return 'N/A';
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      const durationMs = end - start;
      const minutes = Math.floor(durationMs / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${minutes}m`;
    };

    const status = computed(() => {
      if (!reservation.value?.session) return 'unknown';
      return getReservationStatus(reservation.value.session, reservation.value);
    });

    const getStatusLabel = () => {
      const labels = {
        active: 'Active',
        upcoming: 'Upcoming', 
        completed: 'Completed',
        cancelled: 'Cancelled',
        unknown: 'Unknown'
      };
      return labels[status.value] || 'Unknown';
    };

    const getStatusDescription = () => {
      const descriptions = {
        active: 'The movie session is currently in progress.',
        upcoming: 'The movie session is scheduled for a future time.',
        completed: 'The movie session has finished.',
        cancelled: 'This reservation has been cancelled.',
        unknown: 'Unable to determine the current status.'
      };
      return descriptions[status.value] || 'Status unknown';
    };

    const canModify = () => {
      return status.value === 'upcoming';
    };

    const canCancel = () => {
      return status.value === 'upcoming' || status.value === 'active';
    };

    onMounted(() => {
      fetchDetails();
    });

    return {
      reservation,
      loading,
      error,
      closeModal,
      fetchDetails,
      calculateTotal,
      formatDuration,
      getStatusLabel,
      getStatusDescription,
      canModify,
      canCancel,
      formatPrice,
      formatDateTime,
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
  width: 90%;
  max-width: 600px;
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
  min-height: 200px;
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

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: bold;
  color: #666;
  flex: 0 0 40%;
}

.detail-item .value {
  color: #333;
  flex: 1;
  text-align: right;
}

.total-amount {
  font-weight: bold;
  font-size: 1.1rem;
  color: #007bff;
}

.status-info {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.upcoming {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge.completed {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.unknown {
  background-color: #fff3cd;
  color: #856404;
}

.status-description {
  margin: 0;
  color: #666;
  font-style: italic;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .modal {
    width: 95%;
    margin: 1rem;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .detail-item .value {
    text-align: left;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>
