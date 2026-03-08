<template>
  <v-container fluid class="session-list">
    <!-- Header Section -->
    <v-card class="header-card mb-6" elevation="2">
      <v-card-title class="header-title">
        <v-icon :icon="mdiMovie" size="large" class="mr-3" />
        <h2 class="text-h4 font-weight-bold">Movie Sessions</h2>
      </v-card-title>
    </v-card>

    <!-- Date Filter -->
    <v-card class="filter-card mb-4" elevation="1">
      <v-card-text>
        <DateFilter
          :selectedDate="selectedDate"
          :weeksToShow="3"
          @dateSelected="handleDateSelected"
        />
      </v-card-text>
    </v-card>

    <!-- Booking Message -->
    <v-alert
      v-if="bookingMessage"
      :type="bookingMessage.type === 'success' ? 'success' : 'error'"
      variant="tonal"
      prominent
      border="start"
      closable
      class="mb-4"
      @click:close="bookingMessage = null"
    >
      <template #prepend>
        <v-icon
          :icon="bookingMessage.type === 'success' ? mdiCheckCircle : mdiAlert"
        />
      </template>
      {{ bookingMessage.text }}
    </v-alert>

    <!-- Loading, Error, and Empty States -->
    <div class="states-container">
      <SessionStates
        :loading="loading"
        :error="error"
        :isEmpty="!loading && !error && filteredSessions.length === 0"
        @retry="loadSessions"
      />
    </div>

    <!-- Sessions grid -->
    <v-row
      v-if="!loading && !error && filteredSessions.length > 0"
      class="sessions-grid"
    >
      <v-col
        v-for="session in filteredSessions"
        :key="session.id"
        cols="12"
        md="6"
        lg="4"
        xl="3"
      >
        <SessionCard
          :session="session"
          @viewDetails="handleViewDetails"
          @bookSeats="handleBookSeats"
        />
      </v-col>
    </v-row>

    <!-- Session Details Modal -->
    <SessionDetailsModal
      :show="showDetailsModal"
      :session="selectedSession"
      @close="closeDetailsModal"
      @bookSeats="handleBookSeats"
    />

    <!-- Seat Booking Modal -->
    <v-dialog
      v-model="showBookingModal"
      :max-width="isMobile ? '100%' : '700px'"
      :fullscreen="isMobile"
      scrollable
      class="booking-dialog"
      @click:outside="closeBookingModal"
      @keydown.esc="closeBookingModal"
    >
      <v-card class="booking-card">
        <v-card-title class="booking-header">
          <div class="header-content">
            <div class="header-left">
              <v-icon :icon="mdiSeat" class="mr-2" />
              <span class="text-h5">Select Your Seats</span>
            </div>
            <v-btn
              @click="closeBookingModal"
              icon
              variant="text"
              size="large"
              class="close-btn"
            >
              <v-icon :icon="mdiClose" />
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="booking-content">
          <SeatGrid
            v-if="selectedSession"
            :sessionId="selectedSession.id"
            :session="selectedSession"
            @booking-complete="handleBookingComplete"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import SessionCard from "./SessionCard.vue";
import SessionStates from "./SessionStates.vue";
import SessionDetailsModal from "./SessionDetailsModal.vue";
import SeatGrid from "./SeatGrid.vue";
import DateFilter from "./DateFilter.vue";
import { useSessionList } from "../composables/useSessionList";
import { mdiMovie, mdiCheckCircle, mdiAlert, mdiSeat, mdiClose } from "@mdi/js";

const {
  filteredSessions,
  selectedDate,
  loading,
  error,
  showDetailsModal,
  showBookingModal,
  selectedSession,
  bookingMessage,
  isMobile,
  loadSessions,
  handleDateSelected,
  handleViewDetails,
  handleBookSeats,
  closeDetailsModal,
  closeBookingModal,
  handleBookingComplete,
} = useSessionList();
</script>
<style lang="scss" scoped src="../styles/components/session-list.scss"></style>

