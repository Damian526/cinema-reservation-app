<template>
  <div class="movie-info" v-if="session">
    <h3>{{ session.movieTitle }} - {{ formatTime(session.startTime) }}</h3>
    <p>
      Room {{ session.roomNumber }} • {{ session.totalSeats }} Total Seats •
      ${{ session.price }} per seat
    </p>
  </div>
</template>

<script lang="ts">
import { formatTime } from "../utils/seatUtils";

export default {
  name: "MovieInfo",
  props: {
    session: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatTime
  }
}
</script>

<style scoped>
.movie-info h3 {
  color: #007bff;
  margin: 0 0 0.25rem 0;
}

.movie-info p {
  color: #666;
  margin: 0;
}
</style>

