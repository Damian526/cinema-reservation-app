<template>
  <div class="my-reservations">
    <div class="header">
      <h2>My Reservations</h2>
      <button class="btn btn-primary">Book New Session</button>
    </div>

    <div class="reservations-list">
      <!-- Active Reservation -->
      <div class="reservation-card active">
        <div class="reservation-header">
          <div class="movie-info">
            <h3>Matrix</h3>
            <p class="session-time">Today, 19:30</p>
          </div>
          <div class="status-badge active">Active</div>
        </div>
        
        <div class="reservation-details">
          <div class="detail-item">
            <span class="label">Seats:</span>
            <span class="value">B2, B4</span>
          </div>
          <div class="detail-item">
            <span class="label">Total:</span>
            <span class="value">$24.00</span>
          </div>
          <div class="detail-item">
            <span class="label">Booking ID:</span>
            <span class="value">#RSV001</span>
          </div>
          <div class="detail-item">
            <span class="label">Booked:</span>
            <span class="value">Jan 15, 2025 14:30</span>
          </div>
        </div>
        
        <div class="reservation-actions">
          <button class="btn btn-secondary">View Details</button>
          <button class="btn btn-warning">Modify</button>
          <button class="btn btn-danger">Cancel</button>
        </div>
      </div>

      <!-- Upcoming Reservation -->
      <div class="reservation-card upcoming">
        <div class="reservation-header">
          <div class="movie-info">
            <h3>Inception</h3>
            <p class="session-time">Tomorrow, 21:00</p>
          </div>
          <div class="status-badge upcoming">Upcoming</div>
        </div>
        
        <div class="reservation-details">
          <div class="detail-item">
            <span class="label">Seats:</span>
            <span class="value">C5, C6, C7</span>
          </div>
          <div class="detail-item">
            <span class="label">Total:</span>
            <span class="value">$36.00</span>
          </div>
          <div class="detail-item">
            <span class="label">Booking ID:</span>
            <span class="value">#RSV002</span>
          </div>
          <div class="detail-item">
            <span class="label">Booked:</span>
            <span class="value">Jan 14, 2025 16:45</span>
          </div>
        </div>
        
        <div class="reservation-actions">
          <button class="btn btn-secondary">View Details</button>
          <button class="btn btn-warning">Modify</button>
          <button class="btn btn-danger">Cancel</button>
        </div>
      </div>

      <!-- Completed Reservation -->
      <div class="reservation-card completed">
        <div class="reservation-header">
          <div class="movie-info">
            <h3>Interstellar</h3>
            <p class="session-time">Jan 10, 2025, 16:45</p>
          </div>
          <div class="status-badge completed">Completed</div>
        </div>
        
        <div class="reservation-details">
          <div class="detail-item">
            <span class="label">Seats:</span>
            <span class="value">A1, A2</span>
          </div>
          <div class="detail-item">
            <span class="label">Total:</span>
            <span class="value">$24.00</span>
          </div>
          <div class="detail-item">
            <span class="label">Booking ID:</span>
            <span class="value">#RSV003</span>
          </div>
          <div class="detail-item">
            <span class="label">Booked:</span>
            <span class="value">Jan 8, 2025 10:20</span>
          </div>
        </div>
        
        <div class="reservation-actions">
          <button class="btn btn-secondary">View Details</button>
          <button class="btn btn-info">Rate Movie</button>
        </div>
      </div>

      <!-- Cancelled Reservation -->
      <div class="reservation-card cancelled">
        <div class="reservation-header">
          <div class="movie-info">
            <h3>The Dark Knight</h3>
            <p class="session-time">Jan 5, 2025, 20:00</p>
          </div>
          <div class="status-badge cancelled">Cancelled</div>
        </div>
        
        <div class="reservation-details">
          <div class="detail-item">
            <span class="label">Seats:</span>
            <span class="value">D8, D9</span>
          </div>
          <div class="detail-item">
            <span class="label">Refund:</span>
            <span class="value">$24.00</span>
          </div>
          <div class="detail-item">
            <span class="label">Booking ID:</span>
            <span class="value">#RSV004</span>
          </div>
          <div class="detail-item">
            <span class="label">Cancelled:</span>
            <span class="value">Jan 4, 2025 18:30</span>
          </div>
        </div>
        
        <div class="reservation-actions">
          <button class="btn btn-secondary">View Details</button>
        </div>
      </div>
    </div>

    <div class="empty-state" style="display: none;">
      <div class="empty-icon">🎬</div>
      <h3>No Reservations Yet</h3>
      <p>You haven't made any movie reservations yet.</p>
      <button class="btn btn-primary">Browse Sessions</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyReservations'
}
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

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
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