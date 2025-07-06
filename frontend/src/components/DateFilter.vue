<template>
  <div class="date-filter">
    <div class="date-buttons">
      <DateFilterButton
        v-for="date in dates"
        :key="date.fullDate"
        :dateInfo="date"
        :isSelected="selectedDate === date.fullDate"
        @select="handleDateSelect"
      />
    </div>
  </div>
</template>

<script>
import DateFilterButton from './DateFilterButton.vue';

export default {
  name: "DateFilter",
  components: {
    DateFilterButton
  },
  props: {
    selectedDate: {
      type: String,
      default: null
    },
    weeksToShow: {
      type: Number,
      default: 3
    }
  },
  emits: ['dateSelected'],
  computed: {
    dates() {
      const dates = [];
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const totalDays = this.weeksToShow * 7;
      
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const fullDate = date.toISOString().split('T')[0];
        
        dates.push({
          fullDate: fullDate,
          dayName: dayNames[date.getDay()],
          dayNumber: date.getDate(),
          month: months[date.getMonth()],
          isToday: fullDate === todayString
        });
      }
      
      return dates;
    }
  },
  methods: {
    handleDateSelect(date) {
      const newSelectedDate = this.selectedDate === date ? null : date;
      this.$emit('dateSelected', newSelectedDate);
    }
  }
};
</script>

<style scoped>
.date-filter {
  margin-bottom: 2rem;
}

.date-buttons {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  scrollbar-width: thin;
}

.date-buttons::-webkit-scrollbar {
  height: 4px;
}

.date-buttons::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.date-buttons::-webkit-scrollbar-thumb {
  background: #007bff;
  border-radius: 2px;
}
</style>
