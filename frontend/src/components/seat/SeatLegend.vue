<template>
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
</template>

<script>
export default {
  name: 'SeatLegend'
}
</script>

<style scoped>
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
  border-radius: 4px;
}

.legend-item .seat.available {
  background-color: #e9ecef;
  border: 1px solid #dee2e6;
}

.legend-item .seat.selected {
  background-color: #28a745;
  border: 1px solid #1e7e34;
}

.legend-item .seat.occupied {
  background-color: #dc3545;
  border: 1px solid #c82333;
}

.legend-item span {
  font-size: 0.9rem;
  color: #495057;
}

@media (max-width: 768px) {
  .legend {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
}
</style>
