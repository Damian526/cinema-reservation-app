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
        <v-icon :icon="bookingMessage.type === 'success' ? mdiCheckCircle : mdiAlert" />
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
    <v-row v-if="!loading && !error && filteredSessions.length > 0" class="sessions-grid">
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

<script>
import { ref, onMounted, computed } from 'vue';
import { useSessionStore } from '../stores/sessions';
import SessionCard from './SessionCard.vue';
import SessionStates from './SessionStates.vue';
import SessionDetailsModal from './SessionDetailsModal.vue';
import SeatGrid from './SeatGrid.vue';
import DateFilter from './DateFilter.vue';
import {
  mdiMovie,
  mdiCheckCircle,
  mdiAlert,
  mdiSeat,
  mdiClose
} from '@mdi/js';

export default {
  name: "SessionList",
  components: {
    SessionCard,
    SessionStates,
    SessionDetailsModal,
    SeatGrid,
    DateFilter
  },
  setup() {
    const sessionStore = useSessionStore();
    const loading = ref(false);
    const error = ref(null);
    const showDetailsModal = ref(false);
    const showBookingModal = ref(false);
    const selectedSession = ref(null);
    const bookingMessage = ref(null);
    const selectedDate = ref(null);

    // Use computed for better reactivity
    const sessions = computed(() => {
      return sessionStore.list;
    });

    // Filter sessions by selected date and time
    const filteredSessions = computed(() => {
      if (!selectedDate.value) {
        return sessions.value;
      }
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const isToday = selectedDate.value === today;
      
      return sessions.value.filter(session => {
        const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
        
        // First filter by date
        if (sessionDate !== selectedDate.value) {
          return false;
        }
        
        // If it's today, only show sessions that haven't started yet
        // Allow booking up until 1 hour before session starts
        if (isToday) {
          const sessionTime = new Date(session.startTime);
          const oneHourBeforeSession = new Date(sessionTime.getTime() - 60 * 60 * 1000);
          return now < oneHourBeforeSession;
        }
        
        return true;
      });
    });

    // Mobile detection
    const isMobile = computed(() => {
      if (typeof window !== 'undefined') {
        return window.innerWidth <= 600;
      }
      return false;
    });

    // Date selection handler
    const handleDateSelected = (date) => {
      selectedDate.value = date;
    };

    const loadSessions = async () => {
      loading.value = true;
      error.value = null;
      try {
        await sessionStore.fetchAll();
      } catch (err) {
        error.value = 'Failed to load sessions. Please try again.';
        console.error('Error loading sessions:', err);
      } finally {
        loading.value = false;
      }
    };

    // Event handlers for child components
    const handleViewDetails = (session) => {
      selectedSession.value = session;
      showDetailsModal.value = true;
    };

    const handleBookSeats = (session) => {
      selectedSession.value = session;
      showDetailsModal.value = false; // Close details modal if open
      showBookingModal.value = true;
    };

    const closeBookingModal = () => {
      showBookingModal.value = false;
      if (!showDetailsModal.value) {
        selectedSession.value = null;
      }
    };

    const handleBookingComplete = (result) => {
      if (result.success) {
        // Show success message and refresh sessions
        bookingMessage.value = { type: 'success', text: result.message };
        loadSessions(); // Refresh to get updated available seats
        closeBookingModal();
      } else {
        // Show error message
        bookingMessage.value = { type: 'error', text: result.message };
      }
      
      // Clear message after 5 seconds
      setTimeout(() => {
        bookingMessage.value = null;
      }, 5000);
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedSession.value = null;
    };

    onMounted(() => {
      loadSessions();
      // Set today as default selected date
      const today = new Date().toISOString().split('T')[0];
      selectedDate.value = today;
    });

    return {
      sessions,
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
      // Icons
      mdiMovie,
      mdiCheckCircle,
      mdiAlert,
      mdiSeat,
      mdiClose
    };
  }
};
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.session-list {
  background: linear-gradient(135deg, $cinema-background 0%, lighten($cinema-background, 2%) 100%);
  min-height: calc(100vh - 140px);
  padding: $spacing-xl;

  .header-card {
    background: $gradient-primary;
    color: white;
    border-radius: $border-radius-xl;
    overflow: hidden;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="film" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="rgba(255,255,255,0.05)"/><circle cx="5" cy="5" r="2" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23film)"/></svg>');
      opacity: 0.3;
    }

    .header-title {
      position: relative;
      z-index: 1;
      padding: $spacing-xl;

      h2 {
        margin: 0;
        background: linear-gradient(45deg, white, rgba(white, 0.8));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .v-icon {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }
    }
  }

  .filter-card {
    background: $glass-bg;
    backdrop-filter: $glass-blur;
    border: $glass-border;
    border-radius: $border-radius-lg;
    @include card-shadow;
  }

  .states-container {
    margin-bottom: $spacing-md;
  }

  .sessions-grid {
    .v-col {
      display: flex;
      align-items: stretch;
    }
  }

  .booking-dialog {
    .booking-card {
      background: $cinema-surface;
      border-radius: $border-radius-xl;
      overflow: hidden;
      @include card-shadow-xl;

      .booking-header {
        background: $gradient-primary;
        color: white;
        padding: $spacing-lg $spacing-xl;
        border-bottom: 1px solid rgba(white, 0.1);
        position: sticky;
        top: 0;
        z-index: 10;

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          min-height: 48px;

          .header-left {
            display: flex;
            align-items: center;
            gap: $spacing-sm;
            flex: 1;

            .text-h5 {
              font-weight: 700;
              letter-spacing: 0.5px;
            }
          }

          .close-btn {
            color: $cinema-primary !important;
            background: rgba(white, 0.9) !important;
            border: 2px solid rgba($cinema-primary, 0.2) !important;
            transition: all 0.3s ease;
            min-width: 40px;
            min-height: 40px;
            border-radius: 50%;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

            &:hover {
              background: white !important;
              transform: scale(1.1);
              border-color: $cinema-primary !important;
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            }

            .v-icon {
              font-size: 20px;
              color: $cinema-primary !important;
            }
          }
        }
      }

      .booking-content {
        padding: 0;
        background: linear-gradient(135deg, 
          lighten($cinema-background, 3%) 0%, 
          $cinema-background 100%);
        min-height: 70vh;
      }
    }


    @media (min-width: 961px) {
      .booking-card {
        width: 700px;
        max-width: 90vw;
        margin: 3vh auto;
        border-radius: $border-radius-xl;

        .booking-content {
          padding: $spacing-md;
          max-height: 85vh;
        }
      }
    }

    @media (max-width: 960px) and (min-width: 601px) {
      .booking-card {
        width: 90vw;
        margin: 2.5vh auto;
        border-radius: $border-radius-lg;

        .booking-content {
          padding: $spacing-md;
          max-height: 85vh;
        }
      }
    }

    @media (max-width: 600px) {
      .booking-card {
        width: 100vw;
        height: 100vh;
        margin: 0;
        border-radius: 0;
        max-height: 100vh;

        .booking-header {
          padding: $spacing-md $spacing-lg;

          .header-content {
            .close-btn {
              min-width: 36px;
              min-height: 36px;

              .v-icon {
                font-size: 18px;
              }
            }
          }
        }

        .booking-content {
          padding: $spacing-md;
          max-height: calc(100vh - 72px);
          height: calc(100vh - 72px);
        }
      }
    }
  }
}

@media (max-width: 1280px) {
  .session-list {
    padding: $spacing-lg;
  }
}

@media (max-width: 960px) {
  .session-list {
    padding: $spacing-md;

    .header-card .header-title {
      padding: $spacing-lg;

      h2 {
        font-size: 1.5rem;
      }
    }
  }
}

@media (max-width: 600px) {
  .session-list {
    padding: $spacing-sm;

    .header-card .header-title {
      padding: $spacing-md;
      flex-direction: column;
      text-align: center;
      gap: $spacing-sm;

      h2 {
        font-size: 1.3rem;
      }
    }
  }
}

// Animation for grid items
.sessions-grid .v-col {
  animation: slideInUp 0.6s ease-out;

  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
  &:nth-child(5) { animation-delay: 0.5s; }
  &:nth-child(6) { animation-delay: 0.6s; }
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .sessions-grid .v-col {
    animation: none;
  }
  
  .header-card {
    &::before {
      animation: none;
    }
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .session-list {
    background: white;

    .header-card {
      background: black;
      color: white;
      border: 2px solid black;
    }

    .filter-card {
      background: white;
      border: 2px solid black;
    }

    .booking-dialog .booking-card {
      background: white;
      border: 2px solid black;

      .booking-header {
        background: black;
        color: white;

        .header-content .close-btn {
          color: white !important;
          background: white !important;
          border: 2px solid white;

          .v-icon {
            color: black !important;
          }

          &:hover {
            background: rgba(white, 0.9) !important;
          }
        }
      }
    }
  }
}
</style>
