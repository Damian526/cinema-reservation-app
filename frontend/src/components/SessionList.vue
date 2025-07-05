<template>
  <div class="session-list">
    <div class="header">
      <h2>Movie Sessions</h2>
      <button class="btn btn-primary" @click="showAddSessionForm = true">Add New Session</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading sessions...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadSessions">Retry</button>
    </div>

    <!-- Sessions grid -->
    <div v-else class="sessions-grid">
      <div v-for="session in sessions" :key="session.id" class="session-card">
        <div class="movie-info">
          <h3>{{ session.movieTitle }}</h3>
          <p class="movie-description">
            {{ getMovieDescription(session.movieTitle) }}
          </p>
        </div>
        <div class="session-details">
          <div class="time-info">
            <span class="start-time">{{ formatTime(session.startTime) }}</span>
            <span class="date">{{ formatDate(session.startTime) }}</span>
          </div>
          <div class="seat-info">
            <span class="available-seats">{{ session.availableSeats }}</span>
            <span class="total-seats">/ {{ session.totalSeats }} seats</span>
          </div>
        </div>
        <div class="session-actions">
          <button class="btn btn-secondary" @click="viewDetails(session)">View Details</button>
          <button 
            class="btn btn-success" 
            @click="bookSeats(session)"
            :disabled="session.availableSeats === 0"
          >
            {{ session.availableSeats === 0 ? 'Sold Out' : 'Book Seats' }}
          </button>
          <button class="btn btn-warning" @click="editSession(session)">Edit</button>
          <button class="btn btn-danger" @click="deleteSession(session)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && !error && sessions.length === 0" class="empty-state">
      <p>No sessions available</p>
      <button class="btn btn-primary" @click="showAddSessionForm = true">Add First Session</button>
    </div>

    <!-- Add Session Modal (placeholder) -->
    <div v-if="showAddSessionForm" class="modal-overlay" @click="showAddSessionForm = false">
      <div class="modal" @click.stop>
        <h3>Add New Session</h3>
        <p>Session form will be implemented here</p>
        <button class="btn btn-secondary" @click="showAddSessionForm = false">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useSessionStore } from '../stores/sessions';

export default {
  name: "SessionList",
  setup() {
    const sessionStore = useSessionStore();
    const loading = ref(false);
    const error = ref(null);
    const showAddSessionForm = ref(false);

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

    const formatTime = (startTime) => {
      return new Date(startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    const formatDate = (startTime) => {
      const sessionDate = new Date(startTime);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (sessionDate.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (sessionDate.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return sessionDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    };

    const getMovieDescription = (movieTitle) => {
      const descriptions = {
        'Matrix': 'A computer programmer discovers reality is a simulation.',
        'Inception': 'A thief enters people\'s dreams to steal secrets.',
        'Interstellar': 'A team of explorers travel through a wormhole in space.',
        'Avatar: The Way of Water': 'Jake Sully and his family face new threats on Pandora.',
        'Top Gun: Maverick': 'Maverick confronts his past while training new pilots.',
        'The Batman': 'Batman ventures into Gotham City\'s underworld.',
        'Dune': 'A noble family becomes embroiled in a war for control over the most valuable asset.',
        'Spider-Man: No Way Home': 'Spider-Man faces villains from across the multiverse.',
        'Black Panther: Wakanda Forever': 'The people of Wakanda fight to protect their home.',
        'John Wick: Chapter 4': 'John Wick uncovers a path to defeating the High Table.'
      };
      return descriptions[movieTitle] || 'An exciting movie experience awaits you.';
    };

    const viewDetails = (session) => {
      // TODO: Implement view details functionality
      console.log('View details for session:', session);
    };

    const bookSeats = (session) => {
      // TODO: Implement booking functionality
      console.log('Book seats for session:', session);
    };

    const editSession = (session) => {
      // TODO: Implement edit functionality
      console.log('Edit session:', session);
    };

    const deleteSession = async (session) => {
      if (confirm(`Are you sure you want to delete the session for "${session.movieTitle}"?`)) {
        // TODO: Implement delete functionality
        console.log('Delete session:', session);
      }
    };

    onMounted(() => {
      loadSessions();
    });

    return {
      sessions,
      loading,
      error,
      showAddSessionForm,
      loadSessions,
      formatTime,
      formatDate,
      getMovieDescription,
      viewDetails,
      bookSeats,
      editSession,
      deleteSession
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

.session-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.session-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.movie-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.25rem;
}

.movie-description {
  color: #666;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.session-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.time-info {
  display: flex;
  flex-direction: column;
}

.start-time {
  font-size: 1.1rem;
  font-weight: bold;
  color: #007bff;
}

.date {
  font-size: 0.9rem;
  color: #666;
}

.seat-info {
  text-align: right;
}

.available-seats {
  font-size: 1.1rem;
  font-weight: bold;
  color: #28a745;
}

.total-seats {
  font-size: 0.9rem;
  color: #666;
}

.session-actions {
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
  min-width: 80px;
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

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
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

.loading, .error, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error {
  color: #dc3545;
}

.error p {
  margin-bottom: 1rem;
}

.empty-state {
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
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

.btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn:disabled:hover {
  background-color: #6c757d;
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

  .session-actions {
    justify-content: center;
  }

  .btn {
    flex: 0 1 auto;
  }
}
</style>
