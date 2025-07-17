<template>
  <div class="my-reservations">
    <div class="header">
      <h2>My Reservations</h2>
      <router-link to="/sessions" class="btn btn-primary"
        >Book New Session</router-link
      >
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading your reservations...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error Loading Reservations</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchReservations">
        Try Again
      </button>
    </div>

    <!-- Reservations List -->
    <div v-else-if="reservations.length > 0" class="reservations-list">
      <div
        v-for="reservation in reservationsWithStatus"
        :key="reservation.id"
        :class="['reservation-card', reservation.status]"
      >
        <div class="reservation-header">
          <div class="movie-info">
            <h3>{{ reservation.session?.movieTitle || "Unknown Movie" }}</h3>
            <p class="session-time">
              {{ formatSessionTime(reservation.session?.startTime) }}
            </p>
          </div>
          <div :class="['status-badge', reservation.status]">
            {{ getStatusLabel(reservation.status) }}
          </div>
        </div>

        <div class="reservation-details">
          <div class="detail-item">
            <span class="label">Seats:</span>
            <span class="value">{{
              formatSeatNumbers(reservation.seatNumbers)
            }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Total:</span>
            <span class="value">{{
              formatPrice(calculateTotal(reservation))
            }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Booking ID:</span>
            <span class="value"
              >#RSV{{ String(reservation.id).padStart(3, "0") }}</span
            >
          </div>
          <div class="detail-item">
            <span class="label">Booked:</span>
            <span class="value">{{
              formatDateTime(reservation.reservedAt)
            }}</span>
          </div>
          <div
            class="detail-item"
            v-if="reservation.version || reservation.version === 0"
          >
            <span class="label">Version:</span>
            <span class="value">v{{ reservation.version }}</span>
          </div>
        </div>

        <div class="reservation-actions">
          <button class="btn btn-secondary" @click="viewDetails(reservation)">
            View Details
          </button>
          <button
            v-if="canModify(reservation.status)"
            class="btn btn-warning"
            @click="modifyReservation(reservation)"
          >
            Modify
          </button>
          <button
            v-if="canCancel(reservation.status)"
            class="btn btn-danger"
            @click="cancelReservation(reservation)"
            :disabled="cancelling === reservation.id"
          >
            {{ cancelling === reservation.id ? "Cancelling..." : "Cancel" }}
          </button>
          <button
            v-if="reservation.status === 'completed'"
            class="btn btn-info"
            @click="rateMovie(reservation)"
          >
            Rate Movie
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎬</div>
      <h3>No Reservations Yet</h3>
      <p>You haven't made any movie reservations yet.</p>
      <router-link to="/sessions" class="btn btn-primary"
        >Browse Sessions</router-link
      >
    </div>

    <!-- Reservation Details Modal -->
    <ReservationDetailsModal
      v-if="showDetailsModal"
      :reservationId="selectedReservationId"
      @close="closeDetailsModal"
      @modify="openModifyModal"
      @cancel="handleCancelFromDetails"
    />

    <!-- Seat Modification Modal -->
    <SeatModificationModal
      v-if="showModifyModal"
      :reservation="selectedReservation"
      @close="closeModifyModal"
      @modified="handleReservationModified"
    />
  </div>
</template>

<script>
/*
 * MyReservations.vue - Komponent do zarządzania rezerwacjami użytkownika
 *
 * Implementuje Optimistic Concurrency Control (OCC) przy modyfikacji i anulowaniu rezerwacji:
 * - Każda rezerwacja ma pole 'version' (numer wersji)
 * - Przed modyfikacją sprawdzamy czy version się nie zmienił
 * - Jeśli version się zmienił = konflikt = ktoś inny już zmodyfikował
 * - W przypadku konfliktu odświeżamy dane i informujemy użytkownika
 *
 * Miejsca gdzie używamy OCC:
 * 1. cancelReservation() - anulowanie rezerwacji
 * 2. modifyReservation() - modyfikacja rezerwacji
 * 3. handleReservationModified() - obsługa rezultatu modyfikacji
 */
import { computed, onMounted, ref } from "vue";
import { useReservationStore } from "../stores/reservations";
import ReservationDetailsModal from "./ReservationDetailsModal.vue";
import SeatModificationModal from "./SeatModificationModal.vue";
import {
  formatPrice,
  formatDateTime,
  formatSessionTime,
  formatSeatNumbers,
  getReservationStatus,
} from "../utils/seatUtils";

export default {
  name: "MyReservations",
  components: {
    ReservationDetailsModal,
    SeatModificationModal,
  },
  setup() {
    const reservationStore = useReservationStore();
    const cancelling = ref(null);

    // Modal state
    const showDetailsModal = ref(false);
    const showModifyModal = ref(false);
    const selectedReservationId = ref(null);
    const selectedReservation = ref(null);

    // Computed properties
    const reservations = computed(() => reservationStore.mine);
    const loading = computed(() => reservationStore.loading);
    const error = computed(() => reservationStore.error);

    // Enhanced reservations with status
    const reservationsWithStatus = computed(() => {
      return reservations.value
        .map((reservation) => {
          // Use the session data that's already included in the reservation from the backend
          const session = reservation.session;

          // Calculate status based on session timing
          const status = session
            ? getReservationStatus(session, reservation)
            : "unknown";

          return {
            ...reservation,
            status,
          };
        })
        .sort((a, b) => {
          // Sort by session start time, newest first
          if (!a.session?.startTime || !b.session?.startTime) return 0;
          return new Date(b.session.startTime) - new Date(a.session.startTime);
        });
    });

    // Methods
    const fetchReservations = async () => {
      try {
        await reservationStore.fetchMine();
      } catch (err) {
        console.error("Failed to fetch reservations:", err);
      }
    };

    const calculateTotal = (reservation) => {
      if (reservation.session?.price && reservation.seatsBooked) {
        return reservation.session.price * reservation.seatsBooked;
      }
      return 0;
    };

    const getStatusLabel = (status) => {
      const labels = {
        active: "Active",
        upcoming: "Upcoming",
        completed: "Completed",
        cancelled: "Cancelled",
        unknown: "Unknown",
      };
      return labels[status] || "Unknown";
    };

    const canModify = (status) => {
      return status === "upcoming" || status === "active";
    };

    const canCancel = (status) => {
      return status === "upcoming" || status === "active";
    };

    const checkReservationVersion = (reservation) => {
      if (!reservation.version && reservation.version !== 0) {
        return {
          isValid: false,
          message: "Brak informacji o wersji rezerwacji. Odśwież dane.",
        };
      }
      return { isValid: true };
    };

    const handleVersionConflict = async (error, action = "operacji") => {
      if (
        error.message &&
        (error.message.includes("version") || error.message.includes("wersja"))
      ) {
        alert(
          `Rezerwacja została zmieniona przez innego użytkownika podczas ${action}. Odświeżam dane...`
        );
        await fetchReservations();
        return true;
      }
      return false;
    };

    const viewDetails = (reservation) => {
      // Sprawdź czy rezerwacja ma wersję
      const versionCheck = checkReservationVersion(reservation);
      if (!versionCheck.isValid) {
        alert(versionCheck.message);
        fetchReservations();
        return;
      }

      selectedReservationId.value = reservation.id;
      showDetailsModal.value = true;
    };

    const modifyReservation = (reservation) => {
      // Sprawdź czy można modyfikować na podstawie aktualnego statusu
      if (!canModify(reservation.status)) {
        alert("Ta rezerwacja nie może być już modyfikowana.");
        return;
      }

      // Sprawdź czy rezerwacja ma aktualną wersję
      if (!reservation.version && reservation.version !== 0) {
        alert("Brak informacji o wersji rezerwacji. Odświeżam dane...");
        fetchReservations();
        return;
      }

      selectedReservation.value = {
        ...reservation,
        expectedVersion: reservation.version, // Przekaż wersję do modala
      };
      showModifyModal.value = true;
    };

    const openModifyModal = (reservation) => {
      showDetailsModal.value = false;
      selectedReservation.value = reservation;
      showModifyModal.value = true;
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedReservationId.value = null;
    };

    const closeModifyModal = () => {
      showModifyModal.value = false;
      selectedReservation.value = null;
    };

    const handleCancelFromDetails = async (reservation) => {
      closeDetailsModal();

      // Sprawdź czy rezerwacja ma wersję
      if (!reservation.version && reservation.version !== 0) {
        alert("Brak informacji o wersji rezerwacji. Odświeżam dane...");
        await fetchReservations();
        return;
      }

      await cancelReservation(reservation);
    };

    const handleReservationModified = async (modificationResult) => {
      closeModifyModal();

      // Jeśli modyfikacja się udała, odśwież listę
      if (modificationResult && modificationResult.success) {
        await fetchReservations();
      } else if (modificationResult && modificationResult.error) {
        // Obsłuż błędy optimistic locking
        if (
          modificationResult.error.includes("wersja") ||
          modificationResult.error.includes("version")
        ) {
          alert(
            "Rezerwacja została zmieniona przez innego użytkownika. Odświeżam dane..."
          );
          await fetchReservations();
        } else {
          alert(
            "Błąd podczas modyfikacji rezerwacji: " + modificationResult.error
          );
        }
      } else {
        // Fallback - zawsze odśwież dane
        await fetchReservations();
      }
    };

    const cancelReservation = async (reservation) => {
      if (!confirm("Are you sure you want to cancel this reservation?")) {
        return;
      }

      cancelling.value = reservation.id;
      try {
        // Optimistic concurrency control - wyślij wersję rezerwacji
        await reservationStore.cancelReservation(reservation.id, {
          expectedVersion: reservation.version || 0,
        });

        // Odśwież listę rezerwacji po udanym anulowaniu
        await fetchReservations();
      } catch (err) {
        console.error("Cancel reservation error:", err);

        // Obsłuż konflikt wersji
        if (err.message && err.message.includes("został zmodyfikowany")) {
          alert(
            "Ta rezerwacja została zmieniona przez innego użytkownika. Odświeżam dane..."
          );
          await fetchReservations();
        } else if (err.message && err.message.includes("Konflikt")) {
          alert(
            "Konflikt podczas anulowania. Odświeżam dane i spróbuj ponownie."
          );
          await fetchReservations();
        } else {
          alert("Failed to cancel reservation. Please try again.");
        }
      } finally {
        cancelling.value = null;
      }
    };

    const rateMovie = (reservation) => {
      // TODO: Implement movie rating functionality
      console.log("Rate movie for reservation:", reservation);
    };

    // Lifecycle
    onMounted(() => {
      fetchReservations();
    });

    return {
      // State
      reservations,
      loading,
      error,
      reservationsWithStatus,
      cancelling,

      // Modal state
      showDetailsModal,
      showModifyModal,
      selectedReservationId,
      selectedReservation,

      // Methods
      fetchReservations,
      calculateTotal,
      getStatusLabel,
      canModify,
      canCancel,
      viewDetails,
      modifyReservation,
      openModifyModal,
      closeDetailsModal,
      closeModifyModal,
      handleCancelFromDetails,
      handleReservationModified,
      cancelReservation,
      rateMovie,

      // Helper functions dla optimistic locking
      checkReservationVersion,
      handleVersionConflict,

      // Utility functions
      formatPrice,
      formatDateTime,
      formatSessionTime,
      formatSeatNumbers,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "../styles/variables.scss";

.my-reservations {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-xl;
  min-height: calc(100vh - 140px);
  background: linear-gradient(
    135deg,
    $cinema-background 0%,
    lighten($cinema-background, 2%) 100%
  );
}

.header {
  @include flex-between;
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  background: linear-gradient(
    135deg,
    $cinema-surface 0%,
    lighten($cinema-surface, 2%) 100%
  );
  border-radius: $border-radius-xl;
  backdrop-filter: blur(10px);
  border: 1px solid rgba($cinema-primary, 0.1);
  @include card-shadow;

  h2 {
    color: $cinema-secondary;
    margin: 0;
    font-weight: 700;
    font-size: 2rem;
    background: linear-gradient(135deg, $cinema-primary, $cinema-accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .btn {
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-md;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(white, 0.2);
      border-radius: 50%;
      transition: all 0.3s ease;
      transform: translate(-50%, -50%);
    }

    &:hover::before {
      width: 300px;
      height: 300px;
    }

    &-primary {
      background: linear-gradient(
        135deg,
        $cinema-primary,
        darken($cinema-primary, 8%)
      );
      color: white;
      box-shadow: 0 4px 15px rgba($cinema-primary, 0.3);

      &:hover {
        background: linear-gradient(
          135deg,
          darken($cinema-primary, 5%),
          darken($cinema-primary, 15%)
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba($cinema-primary, 0.4);
      }
    }
  }
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: $spacing-xl * 2;
  color: $cinema-secondary;

  p {
    margin-top: $spacing-md;
    font-size: 1.1rem;
    color: lighten($cinema-secondary, 20%);
  }
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba($cinema-primary, 0.1);
  border-top: 4px solid $cinema-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  box-shadow: 0 4px 15px rgba($cinema-primary, 0.2);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-state {
  text-align: center;
  padding: $spacing-xl * 2;
  background: linear-gradient(
    135deg,
    rgba($cinema-error, 0.05),
    rgba($cinema-error, 0.1)
  );
  border-radius: $border-radius-xl;
  border: 1px solid rgba($cinema-error, 0.2);
  @include card-shadow;

  .error-icon {
    font-size: 4rem;
    margin-bottom: $spacing-lg;
    filter: drop-shadow(0 4px 8px rgba($cinema-error, 0.3));
  }

  h3 {
    color: $cinema-error;
    margin: 0 0 $spacing-sm 0;
    font-weight: 700;
    font-size: 1.5rem;
  }

  p {
    margin: 0 0 $spacing-lg 0;
    color: darken($cinema-error, 10%);
    font-size: 1.1rem;
  }
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}

.reservation-card {
  background: linear-gradient(
    135deg,
    $cinema-surface 0%,
    lighten($cinema-surface, 1%) 100%
  );
  border-radius: $border-radius-xl;
  padding: $spacing-xl;
  backdrop-filter: blur(10px);
  border: 1px solid rgba($cinema-primary, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, $cinema-primary, $cinema-accent);
    transition: width 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 12px 30px rgba($cinema-primary, 0.15);

    &::before {
      width: 8px;
    }
  }

  &.active {
    border-color: rgba($seat-available, 0.3);
    background: linear-gradient(
      135deg,
      rgba($seat-available, 0.05),
      rgba($seat-available, 0.1)
    );

    &::before {
      background: linear-gradient(
        180deg,
        $seat-available,
        darken($seat-available, 10%)
      );
    }
  }

  &.upcoming {
    border-color: rgba($cinema-info, 0.3);
    background: linear-gradient(
      135deg,
      rgba($cinema-info, 0.05),
      rgba($cinema-info, 0.1)
    );

    &::before {
      background: linear-gradient(
        180deg,
        $cinema-info,
        darken($cinema-info, 10%)
      );
    }
  }

  &.completed {
    border-color: rgba($cinema-secondary, 0.3);
    background: linear-gradient(
      135deg,
      rgba($cinema-secondary, 0.05),
      rgba($cinema-secondary, 0.1)
    );

    &::before {
      background: linear-gradient(
        180deg,
        $cinema-secondary,
        darken($cinema-secondary, 10%)
      );
    }
  }

  &.cancelled {
    border-color: rgba($cinema-error, 0.3);
    background: linear-gradient(
      135deg,
      rgba($cinema-error, 0.05),
      rgba($cinema-error, 0.1)
    );
    opacity: 0.9;

    &::before {
      background: linear-gradient(
        180deg,
        $cinema-error,
        darken($cinema-error, 10%)
      );
    }
  }

  &.unknown {
    border-color: rgba($cinema-warning, 0.3);
    background: linear-gradient(
      135deg,
      rgba($cinema-warning, 0.05),
      rgba($cinema-warning, 0.1)
    );

    &::before {
      background: linear-gradient(
        180deg,
        $cinema-warning,
        darken($cinema-warning, 10%)
      );
    }
  }
}

.reservation-header {
  @include flex-between;
  align-items: flex-start;
  margin-bottom: $spacing-lg;

  .movie-info {
    flex: 1;

    h3 {
      margin: 0 0 $spacing-xs 0;
      color: $cinema-secondary;
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 1.3;
    }

    .session-time {
      margin: 0;
      color: lighten($cinema-secondary, 30%);
      font-size: 1rem;
      font-weight: 500;
    }
  }
}

.status-badge {
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-xl;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: $shadow-light;
  backdrop-filter: blur(5px);
  border: 1px solid transparent;

  &.active {
    background: linear-gradient(
      135deg,
      rgba($seat-available, 0.2),
      rgba($seat-available, 0.3)
    );
    color: darken($seat-available, 30%);
    border-color: rgba($seat-available, 0.4);
  }

  &.upcoming {
    background: linear-gradient(
      135deg,
      rgba($cinema-info, 0.2),
      rgba($cinema-info, 0.3)
    );
    color: darken($cinema-info, 30%);
    border-color: rgba($cinema-info, 0.4);
  }

  &.completed {
    background: linear-gradient(
      135deg,
      rgba($cinema-secondary, 0.2),
      rgba($cinema-secondary, 0.3)
    );
    color: darken($cinema-secondary, 20%);
    border-color: rgba($cinema-secondary, 0.4);
  }

  &.cancelled {
    background: linear-gradient(
      135deg,
      rgba($cinema-error, 0.2),
      rgba($cinema-error, 0.3)
    );
    color: darken($cinema-error, 20%);
    border-color: rgba($cinema-error, 0.4);
  }

  &.unknown {
    background: linear-gradient(
      135deg,
      rgba($cinema-warning, 0.2),
      rgba($cinema-warning, 0.3)
    );
    color: darken($cinema-warning, 30%);
    border-color: rgba($cinema-warning, 0.4);
  }
}

.reservation-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
  padding: $spacing-lg;
  background: linear-gradient(
    135deg,
    rgba($cinema-background, 0.5),
    rgba($cinema-background, 0.8)
  );
  border-radius: $border-radius-lg;
  backdrop-filter: blur(5px);
  border: 1px solid rgba($cinema-primary, 0.1);

  .detail-item {
    @include flex-between;
    align-items: center;
    padding: $spacing-sm 0;

    .label {
      font-weight: 600;
      color: lighten($cinema-secondary, 20%);
      font-size: 0.95rem;
    }

    .value {
      color: $cinema-secondary;
      font-weight: 600;
      font-size: 1rem;
    }
  }
}

.reservation-actions {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;

  .btn {
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-md;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    flex: 1;
    min-width: 120px;
    text-decoration: none;
    text-align: center;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(white, 0.2);
      border-radius: 50%;
      transition: all 0.3s ease;
      transform: translate(-50%, -50%);
    }

    &:hover:not(:disabled)::before {
      width: 200px;
      height: 200px;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    &-primary {
      background: linear-gradient(
        135deg,
        $cinema-primary,
        darken($cinema-primary, 8%)
      );
      color: white;
      box-shadow: 0 4px 12px rgba($cinema-primary, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(
          135deg,
          darken($cinema-primary, 5%),
          darken($cinema-primary, 15%)
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba($cinema-primary, 0.4);
      }
    }

    &-secondary {
      background: linear-gradient(
        135deg,
        $cinema-secondary,
        darken($cinema-secondary, 8%)
      );
      color: white;
      box-shadow: 0 4px 12px rgba($cinema-secondary, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(
          135deg,
          darken($cinema-secondary, 5%),
          darken($cinema-secondary, 15%)
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba($cinema-secondary, 0.4);
      }
    }

    &-warning {
      background: linear-gradient(
        135deg,
        $cinema-warning,
        darken($cinema-warning, 8%)
      );
      color: white;
      box-shadow: 0 4px 12px rgba($cinema-warning, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(
          135deg,
          darken($cinema-warning, 5%),
          darken($cinema-warning, 15%)
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba($cinema-warning, 0.4);
      }
    }

    &-danger {
      background: linear-gradient(
        135deg,
        $cinema-error,
        darken($cinema-error, 8%)
      );
      color: white;
      box-shadow: 0 4px 12px rgba($cinema-error, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(
          135deg,
          darken($cinema-error, 5%),
          darken($cinema-error, 15%)
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba($cinema-error, 0.4);
      }
    }

    &-info {
      background: linear-gradient(
        135deg,
        $cinema-info,
        darken($cinema-info, 8%)
      );
      color: white;
      box-shadow: 0 4px 12px rgba($cinema-info, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(
          135deg,
          darken($cinema-info, 5%),
          darken($cinema-info, 15%)
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba($cinema-info, 0.4);
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: $spacing-xl * 3;
  background: linear-gradient(
    135deg,
    $cinema-surface 0%,
    lighten($cinema-surface, 2%) 100%
  );
  border-radius: $border-radius-xl;
  backdrop-filter: blur(10px);
  border: 1px solid rgba($cinema-primary, 0.1);
  @include card-shadow;

  .empty-icon {
    font-size: 5rem;
    margin-bottom: $spacing-lg;
    filter: drop-shadow(0 4px 8px rgba($cinema-primary, 0.3));
    animation: pulse 2s infinite;
  }

  h3 {
    margin: 0 0 $spacing-sm 0;
    color: $cinema-secondary;
    font-weight: 700;
    font-size: 1.8rem;
  }

  p {
    margin: 0 0 $spacing-xl 0;
    color: lighten($cinema-secondary, 20%);
    font-size: 1.1rem;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .my-reservations {
    padding: $spacing-lg;
  }

  .header {
    flex-direction: column;
    gap: $spacing-md;
    align-items: stretch;
    text-align: center;

    h2 {
      font-size: 1.6rem;
    }

    .btn {
      width: 100%;
    }
  }

  .reservation-details {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
  }

  .reservation-actions {
    justify-content: center;
    gap: $spacing-xs;

    .btn {
      flex: 0 1 auto;
      min-width: 100px;
      font-size: 0.85rem;
      padding: $spacing-xs $spacing-sm;
    }
  }

  .status-badge {
    font-size: 0.75rem;
    padding: $spacing-xs $spacing-sm;
  }
}

@media (max-width: 480px) {
  .my-reservations {
    padding: $spacing-md;
  }

  .reservation-card {
    padding: $spacing-lg;
  }

  .reservation-header {
    flex-direction: column;
    gap: $spacing-md;
    align-items: flex-start;

    .movie-info h3 {
      font-size: 1.2rem;
    }
  }

  .reservation-actions {
    flex-direction: column;

    .btn {
      flex: none;
      width: 100%;
    }
  }

  .empty-state {
    padding: $spacing-xl;

    .empty-icon {
      font-size: 4rem;
    }

    h3 {
      font-size: 1.5rem;
    }
  }
}

/* Loading and transition animations */
.reservation-card {
  animation: slideInUp 0.6s ease-out;
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

/* Stagger animation for multiple cards */
.reservation-card {
  &:nth-child(1) {
    animation-delay: 0.1s;
  }
  &:nth-child(2) {
    animation-delay: 0.2s;
  }
  &:nth-child(3) {
    animation-delay: 0.3s;
  }
  &:nth-child(4) {
    animation-delay: 0.4s;
  }
  &:nth-child(5) {
    animation-delay: 0.5s;
  }
}
</style>
