<template>
  <div class="seating-area">
    <div v-for="row in seatLayout" :key="row.label" class="seat-row">
      <span class="row-label">{{ row.label }}</span>
      <div class="seats">
        <template v-for="(seat, index) in row.seats" :key="seat.number">            <div
              :class="['seat', getSeatClass(seat)]"
              :data-seat="seat.id"
              @click="handleSeatClick(seat)"
            >
              {{ seat.display }}
            </div>
            <!-- Add gap after 5th seat if row has gap -->
            <div v-if="shouldShowGap(row, seat)" class="seat-gap"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { getSeatStatus, canSelectSeat, GAP_POSITION } from "../utils/seatUtils";

export default {
  name: "SeatingArea",
  props: {
    seatLayout: {
      type: Array,
      default: () => []
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
  emits: ['seat-click'],
  methods: {
    getSeatClass(seat) {
      return getSeatStatus(seat, this.bookedSeats, this.selectedSeats);
    },
    handleSeatClick(seat) {
      if (canSelectSeat(seat, this.bookedSeats)) {
        this.$emit('seat-click', seat);
      }
    },
    shouldShowGap(row, seat) {
      return row.hasGap && seat.position === GAP_POSITION;
    }
  }
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

@media (max-width: 768px) {
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
