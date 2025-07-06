<template>
  <div class="my-reservations">
    <div class="header">
      <h2>My Reservations</h2>
      <router-link to="/sessions" class="btn btn-primary">Book New Session</router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading your reservations...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error Loading Reservations</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchReservations">Try Again</button>
    </div>

    <!-- Reservations List -->
    <div v-else-if="reservations.length > 0" class="reservations-list">
      <div 
        v-for="reservation in reservationsWithStatus" 
        :key="reservation.id"
        :class="['reservation-card', reservation.status]"
      >
        <div class="reservation-header">
          <div class="movie-info">
            <h3>{{ reservation.session?.movieTitle || 'Unknown Movie' }}</h3>
            <p class="session-time">{{ formatSessionTime(reservation.session?.startTime) }}</p>
          </div>
          <div :class="['status-badge', reservation.status]">
            {{ getStatusLabel(reservation.status) }}
          </div>
        </div>
        
        <div class="reservation-details">
          <div class="detail-item">
            <span class="label">Seats:</span>
            <span class="value">{{ formatSeatNumbers(reservation.seatNumbers) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Total:</span>
            <span class="value">{{ formatPrice(calculateTotal(reservation)) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Booking ID:</span>
            <span class="value">#RSV{{ String(reservation.id).padStart(3, '0') }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Booked:</span>
            <span class="value">{{ formatDateTime(reservation.reservedAt) }}</span>
          </div>
        </div>
        
        <div class="reservation-actions">
          <button class="btn btn-secondary" @click="viewDetails(reservation)">View Details</button>
          <button 
            v-if="canModify(reservation.status)" 
            class="btn btn-warning"
            @click="modifyReservation(reservation)"
          >
            Modify
          </button>
          <button 
            v-if="canCancel(reservation.status)" 
            class="btn btn-danger"
            @click="cancelReservation(reservation)"
            :disabled="cancelling === reservation.id"
          >
            {{ cancelling === reservation.id ? 'Cancelling...' : 'Cancel' }}
          </button>
          <button 
            v-if="reservation.status === 'completed'" 
            class="btn btn-info"
            @click="rateMovie(reservation)"
          >
            Rate Movie
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎬</div>
      <h3>No Reservations Yet</h3>
      <p>You haven't made any movie reservations yet.</p>
      <router-link to="/sessions" class="btn btn-primary">Browse Sessions</router-link>
    </div>

    <!-- Reservation Details Modal -->
    <ReservationDetailsModal
      v-if="showDetailsModal"
      :reservationId="selectedReservationId"
      @close="closeDetailsModal"
      @modify="openModifyModal"
      @cancel="handleCancelFromDetails"
    />

    <!-- Seat Modification Modal -->
    <SeatModificationModal
      v-if="showModifyModal"
      :reservation="selectedReservation"
      @close="closeModifyModal"
      @modified="handleReservationModified"
    />
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useReservationStore } from '../stores/reservations';
import ReservationDetailsModal from './ReservationDetailsModal.vue';
import SeatModificationModal from './SeatModificationModal.vue';
import { 
  formatPrice, 
  formatDateTime, 
  formatSessionTime, 
  formatSeatNumbers,
  getReservationStatus 
} from '../utils/seatUtils';

export default {
  name: 'MyReservations',
  components: {
    ReservationDetailsModal,
    SeatModificationModal
  },
  setup() {
    const reservationStore = useReservationStore();
    const cancelling = ref(null);
    
    // Modal state
    const showDetailsModal = ref(false);
    const showModifyModal = ref(false);
    const selectedReservationId = ref(null);
    const selectedReservation = ref(null);

    // Computed properties
    const reservations = computed(() => reservationStore.mine);
    const loading = computed(() => reservationStore.loading);
    const error = computed(() => reservationStore.error);

    // Enhanced reservations with status
    const reservationsWithStatus = computed(() => {
      return reservations.value.map(reservation => {
        // Use the session data that's already included in the reservation from the backend
        const session = reservation.session;
        
        // Calculate status based on session timing
        const status = session ? getReservationStatus(session, reservation) : 'unknown';
        
        return {
          ...reservation,
          status
        };
      }).sort((a, b) => {
        // Sort by session start time, newest first
        if (!a.session?.startTime || !b.session?.startTime) return 0;
        return new Date(b.session.startTime) - new Date(a.session.startTime);
      });
    });

    // Methods
    const fetchReservations = async () => {
      try {
        await reservationStore.fetchMine();
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
      }
    };

    const calculateTotal = (reservation) => {
      if (reservation.session?.price && reservation.seatsBooked) {
        return reservation.session.price * reservation.seatsBooked;
      }
      return 0;
    };

    const getStatusLabel = (status) => {
      const labels = {
        active: 'Active',
        upcoming: 'Upcoming', 
        completed: 'Completed',
        cancelled: 'Cancelled',
        unknown: 'Unknown'
      };
      return labels[status] || 'Unknown';
    };

    const canModify = (status) => {
      return status === 'upcoming' || status === 'active';
    };

    const canCancel = (status) => {
      return status === 'upcoming' || status === 'active';
    };

    const viewDetails = (reservation) => {
      selectedReservationId.value = reservation.id;
      showDetailsModal.value = true;
    };

    const modifyReservation = (reservation) => {
      selectedReservation.value = reservation;
      showModifyModal.value = true;
    };

    const openModifyModal = (reservation) => {
      showDetailsModal.value = false;
      selectedReservation.value = reservation;
      showModifyModal.value = true;
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedReservationId.value = null;
    };

    const closeModifyModal = () => {
      showModifyModal.value = false;
      selectedReservation.value = null;
    };

    const handleCancelFromDetails = async (reservation) => {
      closeDetailsModal();
      await cancelReservation(reservation);
    };

    const handleReservationModified = () => {
      closeModifyModal();
      fetchReservations();
    };

    const cancelReservation = async (reservation) => {
      if (!confirm('Are you sure you want to cancel this reservation?')) {
        return;
      }

      cancelling.value = reservation.id;
      try {
        await reservationStore.cancelReservation(reservation.id);
      } catch (err) {
        alert('Failed to cancel reservation. Please try again.');
      } finally {
        cancelling.value = null;
      }
    };

    const rateMovie = (reservation) => {
      // TODO: Implement movie rating functionality
      console.log('Rate movie for reservation:', reservation);
    };

    // Lifecycle
    onMounted(() => {
      fetchReservations();
    });

    return {
      // State
      reservations,
      loading,
      error,
      reservationsWithStatus,
      cancelling,
      
      // Modal state
      showDetailsModal,
      showModifyModal,
      selectedReservationId,
      selectedReservation,
      
      // Methods
      fetchReservations,
      calculateTotal,
      getStatusLabel,
      canModify,
      canCancel,
      viewDetails,
      modifyReservation,
      openModifyModal,
      closeDetailsModal,
      closeModifyModal,
      handleCancelFromDetails,
      handleReservationModified,
      cancelReservation,
      rateMovie,
      
      // Utility functions
      formatPrice,
      formatDateTime,
      formatSessionTime,
      formatSeatNumbers
    };
  }
};
</script>

<style scoped>
.my-reservations {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: #333;
  margin: 0;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
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

/* Error State */
.error-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #dc3545;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  margin: 0 0 1.5rem 0;
  color: #dc3545;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reservation-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.reservation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.reservation-card.active {
  border-left: 4px solid #28a745;
}

.reservation-card.upcoming {
  border-left: 4px solid #007bff;
}

.reservation-card.completed {
  border-left: 4px solid #6c757d;
}

.reservation-card.cancelled {
  border-left: 4px solid #dc3545;
  opacity: 0.8;
}

.reservation-card.unknown {
  border-left: 4px solid #ffc107;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.movie-info h3 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.25rem;
}

.session-time {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
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

.reservation-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item .label {
  font-weight: bold;
  color: #666;
}

.detail-item .value {
  color: #333;
}

.reservation-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
  flex: 1;
  min-width: 100px;
  text-decoration: none;
  text-align: center;
  display: inline-block;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background-color: #138496;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .reservation-details {
    grid-template-columns: 1fr;
  }
  
  .reservation-actions {
    justify-content: center;
  }
  
  .btn {
    flex: 0 1 auto;
  }
}
</style> 