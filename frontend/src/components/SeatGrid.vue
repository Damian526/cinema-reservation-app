<template>
  <div class="seat-grid">
    <div class="header">
      <h2>Select Your Seats</h2>
      <div class="movie-info">
        <h3>Matrix - 19:30 Today</h3>
        <p>Screen 1 • 100 Total Seats</p>
      </div>
    </div>

    <div class="screen">
      <div class="screen-label">SCREEN</div>
    </div>

    <div class="seating-area">
      <!-- Row A -->
      <div class="seat-row">
        <span class="row-label">A</span>
        <div class="seats">
          <div class="seat available" data-seat="A1">1</div>
          <div class="seat available" data-seat="A2">2</div>
          <div class="seat occupied" data-seat="A3">3</div>
          <div class="seat available" data-seat="A4">4</div>
          <div class="seat available" data-seat="A5">5</div>
          <div class="seat-gap"></div>
          <div class="seat available" data-seat="A6">6</div>
          <div class="seat available" data-seat="A7">7</div>
          <div class="seat occupied" data-seat="A8">8</div>
          <div class="seat available" data-seat="A9">9</div>
          <div class="seat available" data-seat="A10">10</div>
        </div>
      </div>

      <!-- Row B -->
      <div class="seat-row">
        <span class="row-label">B</span>
        <div class="seats">
          <div class="seat available" data-seat="B1">1</div>
          <div class="seat selected" data-seat="B2">2</div>
          <div class="seat available" data-seat="B3">3</div>
          <div class="seat selected" data-seat="B4">4</div>
          <div class="seat available" data-seat="B5">5</div>
          <div class="seat-gap"></div>
          <div class="seat available" data-seat="B6">6</div>
          <div class="seat available" data-seat="B7">7</div>
          <div class="seat available" data-seat="B8">8</div>
          <div class="seat available" data-seat="B9">9</div>
          <div class="seat occupied" data-seat="B10">10</div>
        </div>
      </div>

      <!-- Row C -->
      <div class="seat-row">
        <span class="row-label">C</span>
        <div class="seats">
          <div class="seat available" data-seat="C1">1</div>
          <div class="seat available" data-seat="C2">2</div>
          <div class="seat available" data-seat="C3">3</div>
          <div class="seat available" data-seat="C4">4</div>
          <div class="seat available" data-seat="C5">5</div>
          <div class="seat-gap"></div>
          <div class="seat available" data-seat="C6">6</div>
          <div class="seat available" data-seat="C7">7</div>
          <div class="seat available" data-seat="C8">8</div>
          <div class="seat available" data-seat="C9">9</div>
          <div class="seat available" data-seat="C10">10</div>
        </div>
      </div>

      <!-- Row D -->
      <div class="seat-row">
        <span class="row-label">D</span>
        <div class="seats">
          <div class="seat available" data-seat="D1">1</div>
          <div class="seat available" data-seat="D2">2</div>
          <div class="seat occupied" data-seat="D3">3</div>
          <div class="seat occupied" data-seat="D4">4</div>
          <div class="seat available" data-seat="D5">5</div>
          <div class="seat-gap"></div>
          <div class="seat available" data-seat="D6">6</div>
          <div class="seat available" data-seat="D7">7</div>
          <div class="seat available" data-seat="D8">8</div>
          <div class="seat available" data-seat="D9">9</div>
          <div class="seat available" data-seat="D10">10</div>
        </div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="seat available"></div>
        <span>Available</span>
      </div>
      <div class="legend-item">
        <div class="seat selected"></div>
        <span>Selected</span>
      </div>
      <div class="legend-item">
        <div class="seat occupied"></div>
        <span>Occupied</span>
      </div>
    </div>

    <div class="booking-summary">
      <div class="selected-seats">
        <h4>Selected Seats: B2, B4</h4>
        <p>Total: $24.00 (2 seats × $12.00)</p>
      </div>
      <button class="btn btn-primary btn-large">Confirm Booking</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SeatGrid",
};
</script>

<style scoped>
.seat-grid {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: #333;
  margin: 0 0 0.5rem 0;
}

.movie-info h3 {
  color: #007bff;
  margin: 0 0 0.25rem 0;
}

.movie-info p {
  color: #666;
  margin: 0;
}

.screen {
  text-align: center;
  margin: 2rem 0;
}

.screen-label {
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  border: 2px solid #dee2e6;
  border-radius: 50px;
  padding: 0.5rem 2rem;
  display: inline-block;
  font-weight: bold;
  color: #495057;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.seating-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 2rem 0;
}

.seat-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.row-label {
  font-weight: bold;
  color: #666;
  width: 20px;
  text-align: center;
}

.seats {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.seat {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.seat.available {
  background-color: #e9ecef;
  color: #495057;
  border-color: #dee2e6;
}

.seat.available:hover {
  background-color: #007bff;
  color: white;
  transform: scale(1.1);
}

.seat.selected {
  background-color: #28a745;
  color: white;
  border-color: #1e7e34;
  transform: scale(1.05);
}

.seat.occupied {
  background-color: #dc3545;
  color: white;
  cursor: not-allowed;
  border-color: #c82333;
}

.seat-gap {
  width: 20px;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-item .seat {
  width: 20px;
  height: 20px;
  cursor: default;
}

.legend-item span {
  font-size: 0.9rem;
  color: #495057;
}

.booking-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border: 2px solid #007bff;
  border-radius: 8px;
  margin-top: 2rem;
}

.selected-seats h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.selected-seats p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
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

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .seat-grid {
    padding: 1rem;
  }

  .booking-summary {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .legend {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .seat {
    width: 30px;
    height: 30px;
    font-size: 0.7rem;
  }

  .seats {
    gap: 0.25rem;
  }
}
</style>
