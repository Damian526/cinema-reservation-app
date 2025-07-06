<template>
  <div class="seating-area">
    <div v-for="row in seatLayout" :key="row.label" class="seat-row">
      <span class="row-label">{{ row.label }}</span>
      <div class="seats">
        <SeatButton
          v-for="seat in row.seats" 
          :key="seat.number"
          :seat="seat"
          :isOccupied="bookedSeats.includes(seat.number)"
          :isSelected="selectedSeats.some(s => s.number === seat.number)"
          @click="$emit('seat-toggle', seat)"
        />
        <div v-if="row.hasGap" class="seat-gap"></div>
      </div>
    </div>
  </div>
</template>

<script>
import SeatButton from './SeatButton.vue'

export default {
  name: 'SeatLayout',
  components: {
    SeatButton
  },
  props: {
    seatLayout: {
      type: Array,
      required: true
    },
    bookedSeats: {
      type: Array,
      default: () => []
    },
    selectedSeats: {
      type: Array,
      default: () => []
    }
  },
  emits: ['seat-toggle']
}
</script>

<style scoped>
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

.seat-gap {
  width: 20px;
}
</style>
