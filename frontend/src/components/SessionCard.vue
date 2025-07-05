<template>
  <div class="session-card">
    <div class="movie-info">
      <h3>{{ session.movieTitle }}</h3>
      <p class="movie-description">
        {{ session.description || getMovieDescription(session.movieTitle) }}
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
      <button class="btn btn-secondary" @click="$emit('viewDetails', session)">View Details</button>
      <button 
        class="btn btn-success" 
        @click="$emit('bookSeats', session)"
        :disabled="session.availableSeats === 0"
      >
        {{ session.availableSeats === 0 ? 'Sold Out' : 'Book Seats' }}
      </button>
      <button class="btn btn-warning" @click="$emit('editSession', session)">Edit</button>
      <button class="btn btn-danger" @click="$emit('deleteSession', session)">Delete</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SessionCard",
  props: {
    session: {
      type: Object,
      required: true
    }
  },
  emits: ['viewDetails', 'bookSeats', 'editSession', 'deleteSession'],
  methods: {
    formatTime(startTime) {
      return new Date(startTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    },

    formatDate(startTime) {
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
    },

    getMovieDescription(movieTitle) {
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
    }
  }
};
</script>

<style scoped>
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

.btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn:disabled:hover {
  background-color: #6c757d;
}

@media (max-width: 768px) {
  .session-actions {
    justify-content: center;
  }

  .btn {
    flex: 0 1 auto;
  }
}
</style>
