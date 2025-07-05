<template>
  <div class="session-list">
    <div class="header">
      <h2>Movie Sessions</h2>
      <button class="btn btn-primary" @click="showAddSessionForm = true">Add New Session</button>
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
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useSessionStore } from '../stores/sessions';
import SessionCard from './SessionCard.vue';
import SessionStates from './SessionStates.vue';
import SessionDetailsModal from './SessionDetailsModal.vue';

export default {
  name: "SessionList",
  components: {
    SessionCard,
    SessionStates,
    SessionDetailsModal
  },
  setup() {
    const sessionStore = useSessionStore();
    const loading = ref(false);
    const error = ref(null);
    const showAddSessionForm = ref(false);
    const showDetailsModal = ref(false);
    const selectedSession = ref(null);

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
      // TODO: Implement booking functionality
      console.log('Book seats for session:', session);
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
      selectedSession,
      loadSessions,
      handleViewDetails,
      handleBookSeats,
      handleEditSession,
      handleDeleteSession,
      closeDetailsModal
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
