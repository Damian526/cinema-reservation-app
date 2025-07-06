<template>
  <div class="session-list">
    <div class="header">
      <h2>Movie Sessions</h2>
      <button class="btn btn-primary" @click="showAddSessionForm = true">Add New Session</button>
    </div>

    <!-- Booking Message -->
    <div v-if="bookingMessage" :class="['message', bookingMessage.type]">
      {{ bookingMessage.text }}
    </div>

    <!-- Loading, Error, and Empty States -->
    <SessionStates 
      :loading="loading"
      :error="error"
      :isEmpty="!loading && !error && sessions.length === 0"
      @retry="loadSessions"
      @addSession="showAddSessionForm = true"
    />

    <!-- Sessions grid -->
    <div v-if="!loading && !error && sessions.length > 0" class="sessions-grid">
      <SessionCard
        v-for="session in sessions"
        :key="session.id"
        :session="session"
        @viewDetails="handleViewDetails"
        @bookSeats="handleBookSeats"
        @editSession="handleEditSession"
        @deleteSession="handleDeleteSession"
      />
    </div>

    <!-- Add Session Modal (placeholder) -->
    <div v-if="showAddSessionForm" class="modal-overlay" @click="showAddSessionForm = false">
      <div class="modal" @click.stop>
        <h3>Add New Session</h3>
        <p>Session form will be implemented here</p>
        <button class="btn btn-secondary" @click="showAddSessionForm = false">Close</button>
      </div>
    </div>

    <!-- Session Details Modal -->
    <SessionDetailsModal
      :show="showDetailsModal"
      :session="selectedSession"
      @close="closeDetailsModal"
      @bookSeats="handleBookSeats"
    />

    <!-- Seat Booking Modal -->
    <div v-if="showBookingModal" class="modal-overlay" @click="closeBookingModal">
      <div class="modal booking-modal" @click.stop>
        <div class="modal-header">
          <h3>Book Seats</h3>
          <button class="close-btn" @click="closeBookingModal">×</button>
        </div>
        <div class="modal-body">
          <SeatGrid
            v-if="selectedSession"
            :sessionId="selectedSession.id"
            :session="selectedSession"
            @booking-complete="handleBookingComplete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useSessionStore } from '../stores/sessions';
import SessionCard from './SessionCard.vue';
import SessionStates from './SessionStates.vue';
import SessionDetailsModal from './SessionDetailsModal.vue';
import SeatGrid from './SeatGrid.vue';

export default {
  name: "SessionList",
  components: {
    SessionCard,
    SessionStates,
    SessionDetailsModal,
    SeatGrid
  },
  setup() {
    const sessionStore = useSessionStore();
    const loading = ref(false);
    const error = ref(null);
    const showAddSessionForm = ref(false);
    const showDetailsModal = ref(false);
    const showBookingModal = ref(false);
    const selectedSession = ref(null);
    const bookingMessage = ref(null);

    // Use computed for better reactivity
    const sessions = computed(() => {
      console.log('Computed sessions called, store list:', sessionStore.list);
      return sessionStore.list;
    });

    const loadSessions = async () => {
      loading.value = true;
      error.value = null;
      try {
        await sessionStore.fetchAll();
        console.log("Sessions in store:", sessionStore.list); // Debug log
        console.log("Sessions count:", sessionStore.list.length); // Debug log
      } catch (err) {
        error.value = 'Failed to load sessions. Please try again.';
        console.error('Error loading sessions:', err);
      } finally {
        loading.value = false;
      }
    };

    // Event handlers for child components
    const handleViewDetails = (session) => {
      console.log('handleViewDetails called with session:', session);
      selectedSession.value = session;
      showDetailsModal.value = true;
    };

    const handleBookSeats = (session) => {
      console.log('Book seats for session:', session);
      selectedSession.value = session;
      showDetailsModal.value = false; // Close details modal if open
      showBookingModal.value = true;
    };

    const closeBookingModal = () => {
      showBookingModal.value = false;
      if (!showDetailsModal.value) {
        selectedSession.value = null;
      }
    };

    const handleBookingComplete = (result) => {
      if (result.success) {
        // Show success message and refresh sessions
        bookingMessage.value = { type: 'success', text: result.message };
        loadSessions(); // Refresh to get updated available seats
        closeBookingModal();
      } else {
        // Show error message
        bookingMessage.value = { type: 'error', text: result.message };
      }
      
      // Clear message after 5 seconds
      setTimeout(() => {
        bookingMessage.value = null;
      }, 5000);
    };

    const handleEditSession = (session) => {
      // TODO: Implement edit functionality
      console.log('Edit session:', session);
    };

    const handleDeleteSession = async (session) => {
      if (confirm(`Are you sure you want to delete the session for "${session.movieTitle}"?`)) {
        // TODO: Implement delete functionality
        console.log('Delete session:', session);
      }
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedSession.value = null;
    };

    onMounted(() => {
      loadSessions();
    });

    return {
      sessions,
      loading,
      error,
      showAddSessionForm,
      showDetailsModal,
      showBookingModal,
      selectedSession,
      bookingMessage,
      loadSessions,
      handleViewDetails,
      handleBookSeats,
      handleEditSession,
      handleDeleteSession,
      closeDetailsModal,
      closeBookingModal,
      handleBookingComplete
    };
  }
};
</script>

<style scoped>
.session-list {
  max-width: 1200px;
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

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.booking-modal {
  max-width: 900px;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
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
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #000;
}

.modal-body {
  padding: 0;
}

.message {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.modal h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .sessions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
