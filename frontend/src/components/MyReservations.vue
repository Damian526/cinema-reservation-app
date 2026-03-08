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

<script setup lang="ts">
import ReservationDetailsModal from "./ReservationDetailsModal.vue";
import SeatModificationModal from "./SeatModificationModal.vue";
import { useMyReservations } from "../composables/useMyReservations";
import {
  formatPrice,
  formatDateTime,
  formatSessionTime,
  formatSeatNumbers,
} from "../utils/seatUtils";

const {
  reservations,
  loading,
  error,
  reservationsWithStatus,
  cancelling,
  showDetailsModal,
  showModifyModal,
  selectedReservationId,
  selectedReservation,
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
} = useMyReservations();
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../styles/variables.scss" as *;

.my-reservations {
  max-width: 1200px;
  margin: 0 auto;
  padding: $spacing-xl;
  min-height: calc(100vh - 140px);
  background: linear-gradient(
    135deg,
    $cinema-background 0%,
    #{color.scale($cinema-background, $lightness: 2%)} 100%
  );
}

.header {
  @include flex-between;
  margin-bottom: $spacing-xl;
  padding: $spacing-lg;
  background: linear-gradient(
    135deg,
    $cinema-surface 0%,
    color.adjust($cinema-surface, $lightness: 2%) 100%
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
        #{color.scale($cinema-primary, $lightness: -8%)}
      );
      color: white;
      box-shadow: 0 4px 15px rgba($cinema-primary, 0.3);

      &:hover {
        background: linear-gradient(
          135deg,
          #{color.scale($cinema-primary, $lightness: -5%)},
          #{color.scale($cinema-primary, $lightness: -15%)}
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
    color: #{color.scale($cinema-secondary, $lightness: 20%)};
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
    color: #{color.scale($cinema-error, $lightness: -10%)};
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
    #{color.scale($cinema-surface, $lightness: 1%)} 100%
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
        #{color.scale($seat-available, $lightness: -10%)}
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
        #{color.scale($cinema-info, $lightness: -10%)}
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
        #{color.scale($cinema-secondary, $lightness: -10%)}
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
        #{color.scale($cinema-error, $lightness: -10%)}
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
        #{color.scale($cinema-warning, $lightness: -10%)}
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
      color: #{color.scale($cinema-secondary, $lightness: 30%)};
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
    color: #{color.scale($seat-available, $lightness: -30%)};
    border-color: rgba($seat-available, 0.4);
  }

  &.upcoming {
    background: linear-gradient(
      135deg,
      rgba($cinema-info, 0.2),
      rgba($cinema-info, 0.3)
    );
    color: #{color.scale($cinema-info, $lightness: -30%)};
    border-color: rgba($cinema-info, 0.4);
  }

  &.completed {
    background: linear-gradient(
      135deg,
      rgba($cinema-secondary, 0.2),
      rgba($cinema-secondary, 0.3)
    );
    color: #{color.scale($cinema-secondary, $lightness: -20%)};
    border-color: rgba($cinema-secondary, 0.4);
  }

  &.cancelled {
    background: linear-gradient(
      135deg,
      rgba($cinema-error, 0.2),
      rgba($cinema-error, 0.3)
    );
    color: #{color.scale($cinema-error, $lightness: -20%)};
    border-color: rgba($cinema-error, 0.4);
  }

  &.unknown {
    background: linear-gradient(
      135deg,
      rgba($cinema-warning, 0.2),
      rgba($cinema-warning, 0.3)
    );
    color: #{color.scale($cinema-warning, $lightness: -30%)};
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
      color: #{color.scale($cinema-secondary, $lightness: 20%)};
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
        #{color.scale($cinema-primary, $lightness: -8%)}
      );
      color: white;
      box-shadow: 0 4px 12px rgba($cinema-primary, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(
          135deg,
          #{color.scale($cinema-primary, $lightness: -5%)},
          #{color.scale($cinema-primary, $lightness: -15%)}
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba($cinema-primary, 0.4);
      }
    }

    &-secondary {
      background: linear-gradient(
        135deg,
        $cinema-secondary,
        #{color.scale($cinema-secondary, $lightness: -8%)}
      );
      color: white;
      box-shadow: 0 4px 12px rgba($cinema-secondary, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(
          135deg,
          #{color.scale($cinema-secondary, $lightness: -5%)},
          #{color.scale($cinema-secondary, $lightness: -15%)}
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba($cinema-secondary, 0.4);
      }
    }

    &-warning {
      background: linear-gradient(
        135deg,
        $cinema-warning,
        #{color.scale($cinema-warning, $lightness: -8%)}
      );
      color: white;
      box-shadow: 0 4px 12px rgba($cinema-warning, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(
          135deg,
          #{color.scale($cinema-warning, $lightness: -5%)},
          #{color.scale($cinema-warning, $lightness: -15%)}
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba($cinema-warning, 0.4);
      }
    }

    &-danger {
      background: linear-gradient(
        135deg,
        $cinema-error,
        #{color.scale($cinema-error, $lightness: -8%)}
      );
      color: white;
      box-shadow: 0 4px 12px rgba($cinema-error, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(
          135deg,
          #{color.scale($cinema-error, $lightness: -5%)},
          #{color.scale($cinema-error, $lightness: -15%)}
        );
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba($cinema-error, 0.4);
      }
    }

    &-info {
      background: linear-gradient(
        135deg,
        $cinema-info,
        #{color.scale($cinema-info, $lightness: -8%)}
      );
      color: white;
      box-shadow: 0 4px 12px rgba($cinema-info, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(
          135deg,
          #{color.scale($cinema-info, $lightness: -5%)},
          #{color.scale($cinema-info, $lightness: -15%)}
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
    color.adjust($cinema-surface, $lightness: 2%) 100%
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
    color: #{color.scale($cinema-secondary, $lightness: 20%)};
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

