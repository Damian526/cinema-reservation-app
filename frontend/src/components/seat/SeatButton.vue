<template>
  <div 
    :class="['seat', seatClass]"
    :data-seat="seat.id"
    @click="handleClick"
  >
    {{ seat.display }}
  </div>
</template>

<script>
export default {
  name: 'SeatButton',
  props: {
    seat: {
      type: Object,
      required: true
    },
    isOccupied: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    seatClass() {
      if (this.isOccupied) return 'occupied'
      if (this.isSelected) return 'selected'
      return 'available'
    }
  },
  methods: {
    handleClick() {
      if (!this.isOccupied) {
        this.$emit('click', this.seat)
      }
    }
  }
}
</script>

<style scoped>
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
</style>
