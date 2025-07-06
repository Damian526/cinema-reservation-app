<template>
  <button
    :class="['date-btn', { 
      active: isSelected,
      today: dateInfo.isToday 
    }]"
    @click="$emit('select', dateInfo.fullDate)"
  >
    <span class="day-name">{{ dateInfo.dayName }}</span>
    <span class="day-number">{{ dateInfo.dayNumber }}</span>
    <span class="month">{{ dateInfo.month }}</span>
  </button>
</template>

<script>
export default {
  name: "DateFilterButton",
  props: {
    dateInfo: {
      type: Object,
      required: true,
      validator(value) {
        return value && 
               typeof value.fullDate === 'string' &&
               typeof value.dayName === 'string' &&
               typeof value.dayNumber === 'number' &&
               typeof value.month === 'string' &&
               typeof value.isToday === 'boolean';
      }
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select']
};
</script>

<style scoped>
.date-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  min-width: 80px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  color: #495057;
}

.date-btn:hover {
  background: #e9ecef;
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}

.date-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.date-btn.today {
  background: #28a745;
  border-color: #28a745;
  color: white;
  font-weight: 600;
}

.date-btn.today:hover {
  background: #218838;
  border-color: #218838;
}

.date-btn.today.active {
  background: #007bff;
  border-color: #007bff;
}

.day-name {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
  opacity: 0.8;
}

.day-number {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.month {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .date-btn {
    min-width: 70px;
    padding: 0.5rem 0.75rem;
  }

  .day-number {
    font-size: 1.1rem;
  }
}
</style>
