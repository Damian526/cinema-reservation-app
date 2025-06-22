<template>
  <div class="session-list">
    <div class="header">
      <h2>Movie Sessions</h2>
      <button class="btn btn-primary">Add New Session</button>
    </div>

    <div class="sessions-grid">
      <!-- Sample session cards -->
      <div class="session-card">
        <div class="movie-info">
          <h3>Matrix</h3>
          <p class="movie-description">
            A computer programmer discovers reality is a simulation.
          </p>
        </div>
        <div class="session-details">
          <div class="time-info">
            <span class="start-time">19:30</span>
            <span class="date">Today</span>
          </div>
          <div class="seat-info">
            <span class="available-seats">85</span>
            <span class="total-seats">/ 100 seats</span>
          </div>
        </div>
        <div class="session-actions">
          <button class="btn btn-secondary">View Details</button>
          <button class="btn btn-success">Book Seats</button>
          <button class="btn btn-warning">Edit</button>
          <button class="btn btn-danger">Delete</button>
        </div>
      </div>

      <div class="session-card">
        <div class="movie-info">
          <h3>Inception</h3>
          <p class="movie-description">
            A thief enters people's dreams to steal secrets.
          </p>
        </div>
        <div class="session-details">
          <div class="time-info">
            <span class="start-time">21:00</span>
            <span class="date">Today</span>
          </div>
          <div class="seat-info">
            <span class="available-seats">72</span>
            <span class="total-seats">/ 80 seats</span>
          </div>
        </div>
        <div class="session-actions">
          <button class="btn btn-secondary">View Details</button>
          <button class="btn btn-success">Book Seats</button>
          <button class="btn btn-warning">Edit</button>
          <button class="btn btn-danger">Delete</button>
        </div>
      </div>

      <div class="session-card">
        <div class="movie-info">
          <h3>Interstellar</h3>
          <p class="movie-description">
            A team of explorers travel through a wormhole in space.
          </p>
        </div>
        <div class="session-details">
          <div class="time-info">
            <span class="start-time">16:45</span>
            <span class="date">Tomorrow</span>
          </div>
          <div class="seat-info">
            <span class="available-seats">120</span>
            <span class="total-seats">/ 120 seats</span>
          </div>
        </div>
        <div class="session-actions">
          <button class="btn btn-secondary">View Details</button>
          <button class="btn btn-success">Book Seats</button>
          <button class="btn btn-warning">Edit</button>
          <button class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SessionList",
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
