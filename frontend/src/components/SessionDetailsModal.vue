<template>
  <div v-if="show && session" class="modal-overlay" @click="$emit('close')">
    <div class="modal details-modal" @click.stop>
      <div class="modal-header">
        <h3>{{ session.movieTitle }}</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Movie:</span>
            <span class="detail-value">{{ session.movieTitle }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Start Time:</span>
            <span class="detail-value">{{ formatDateTime(session.startTime) }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">End Time:</span>
            <span class="detail-value">{{ formatDateTime(session.endTime) }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">{{ calculateDuration(session.startTime, session.endTime) }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Room Number:</span>
            <span class="detail-value">Room {{ session.roomNumber }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Total Seats:</span>
            <span class="detail-value">{{ session.totalSeats }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Available Seats:</span>
            <span class="detail-value availability" :class="availabilityClass">
              {{ session.availableSeats }} / {{ session.totalSeats }}
            </span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Occupancy:</span>
            <span class="detail-value">{{ calculateOccupancy(session) }}%</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Ticket Price:</span>
            <span class="detail-value price">${{ formatPrice(session.price) }}</span>
          </div>
        </div>
        
        <div class="session-description">
          <h4>About the Movie</h4>
          <p>{{ getMovieDescription(session.movieTitle) }}</p>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          class="btn btn-success" 
          @click="$emit('bookSeats', session)"
          :disabled="session.availableSeats === 0"
        >
          {{ session.availableSeats === 0 ? 'Sold Out' : 'Book Tickets' }}
        </button>
        <button class="btn btn-secondary" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SessionDetailsModal",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    session: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'bookSeats'],
  computed: {
    availabilityClass() {
      if (!this.session) return '';
      const ratio = this.session.availableSeats / this.session.totalSeats;
      if (ratio < 0.2) return 'low-availability';
      if (ratio < 0.5) return 'medium-availability';
      return 'high-availability';
    }
  },
  methods: {
    formatDateTime(dateTime) {
      if (!dateTime) return 'N/A';
      try {
        const date = new Date(dateTime);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
      }
    },

    calculateDuration(startTime, endTime) {
      if (!startTime || !endTime) return 'N/A';
      try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end - start;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
      } catch (error) {
        console.error('Error calculating duration:', error);
        return 'N/A';
      }
    },

    calculateOccupancy(session) {
      if (!session || !session.totalSeats || session.totalSeats === 0) return 0;
      const occupancy = ((session.totalSeats - session.availableSeats) / session.totalSeats) * 100;
      return Math.round(occupancy);
    },

    formatPrice(price) {
      if (price === null || price === undefined || isNaN(price)) {
        return '0.00';
      }
      return Number(price).toFixed(2);
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

.details-modal {
  max-width: 600px;
  width: 95%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  color: #333;
}

.detail-value.price {
  font-weight: bold;
  color: #28a745;
  font-size: 1.1rem;
}

.detail-value.availability {
  font-weight: bold;
}

.high-availability {
  color: #28a745;
}

.medium-availability {
  color: #ffc107;
}

.low-availability {
  color: #dc3545;
}

.session-description {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.session-description h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.session-description p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
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
  .details-modal {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
