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

<script setup>
import { computed } from "vue";
import DateFilterButton from './DateFilterButton.vue';

const props = defineProps({
  selectedDate: {
    type: String,
    default: null,
  },
  weeksToShow: {
    type: Number,
    default: 3,
  },
});

const emit = defineEmits(["dateSelected"]);

const dates = computed(() => {
  const dateList = [];
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const totalDays = props.weeksToShow * 7;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const fullDate = date.toISOString().split("T")[0];

    dateList.push({
      fullDate,
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      month: months[date.getMonth()],
      isToday: fullDate === todayString,
    });
  }

  return dateList;
});

function handleDateSelect(date) {
  const newSelectedDate = props.selectedDate === date ? null : date;
  emit("dateSelected", newSelectedDate);
}
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
