<template>
  <v-dialog
    :model-value="true"
    @update:model-value="closeModal"
    max-width="700px"
    persistent
    class="reservation-details-modal"
  >
    <v-card class="modern-card">
      <v-card-title class="modal-header">
        <h3 class="modal-title">
          <v-icon :icon="mdiTicket" class="title-icon" />
          Reservation Details
        </h3>
        <v-btn
          @click="closeModal"
          icon
          variant="text"
          size="small"
          class="close-btn"
        >
          <v-icon :icon="mdiClose" />
        </v-btn>
      </v-card-title>
      
      <v-card-text class="modal-body">
        <div v-if="loading" class="loading-container">
          <v-progress-circular
            indeterminate
            size="64"
            color="primary"
            class="loading-spinner"
          />
          <p class="loading-text">Loading details...</p>
        </div>
        
        <v-alert
          v-else-if="error"
          type="error"
          variant="tonal"
          class="error-alert"
        >
          <template #prepend>
            <v-icon :icon="mdiAlertCircle" />
          </template>
          <div>
            <p>{{ error }}</p>
            <v-btn
              @click="fetchDetails"
              color="error"
              variant="outlined"
              size="small"
              class="retry-btn"
            >
              <v-icon :icon="mdiRefresh" start />
              Retry
            </v-btn>
          </div>
        </v-alert>
        
        <div v-else-if="reservation" class="reservation-content">
          <!-- Movie Information -->
          <v-card variant="outlined" class="detail-section movie-section" elevation="2">
            <v-card-title class="section-title">
              <v-icon :icon="mdiMovie" class="section-icon" />
              Movie Information
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-list-item>
                    <v-list-item-title class="detail-label">Movie:</v-list-item-title>
                    <v-list-item-subtitle class="detail-value movie-title">
                      {{ reservation.session?.movieTitle || 'Unknown' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
                <v-col cols="12" md="8">
                  <v-list-item>
                    <v-list-item-title class="detail-label">Description:</v-list-item-title>
                    <v-list-item-subtitle class="detail-value">
                      {{ reservation.session?.description || 'No description available' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
                <v-col cols="12" md="4">
                  <v-list-item>
                    <v-list-item-title class="detail-label">Duration:</v-list-item-title>
                    <v-list-item-subtitle class="detail-value">
                      <v-chip size="small" color="primary" variant="outlined">
                        <v-icon :icon="mdiClock" start size="small" />
                        {{ formatDuration(reservation.session) }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Session Information -->
          <v-card variant="outlined" class="detail-section session-section" elevation="2">
            <v-card-title class="section-title">
              <v-icon :icon="mdiCalendarClock" class="section-icon" />
              Session Information
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-list-item>
                    <template #prepend>
                      <v-avatar size="small" color="info">
                        <v-icon :icon="mdiCalendarClock" size="small" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="detail-label">Date & Time:</v-list-item-title>
                    <v-list-item-subtitle class="detail-value">
                      {{ formatSessionTime(reservation.session?.startTime) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
                <v-col cols="12" md="3">
                  <v-list-item>
                    <template #prepend>
                      <v-avatar size="small" color="warning">
                        <v-icon :icon="mdiDoor" size="small" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="detail-label">Room:</v-list-item-title>
                    <v-list-item-subtitle class="detail-value">
                      <v-chip size="small" color="warning" variant="tonal">
                        Room {{ reservation.session?.roomNumber || 'N/A' }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
                <v-col cols="12" md="3">
                  <v-list-item>
                    <template #prepend>
                      <v-avatar size="small" color="secondary">
                        <v-icon :icon="mdiSeat" size="small" />
                      </v-avatar>
                    </template>
                    <v-list-item-title class="detail-label">Total Seats:</v-list-item-title>
                    <v-list-item-subtitle class="detail-value">
                      {{ reservation.session?.totalSeats || 'N/A' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Booking Information -->
          <v-card variant="outlined" class="detail-section booking-section">
            <v-card-title class="section-title">
              <v-icon :icon="mdiCreditCard" class="section-icon" />
              Booking Information
            </v-card-title>
            <v-card-text>
              <div class="detail-grid">
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span class="detail-value booking-id">#RSV{{ String(reservation.id).padStart(3, '0') }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Reserved Seats:</span>
                  <span class="detail-value seat-numbers">{{ formatSeatNumbers(reservation.seatNumbers) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Number of Seats:</span>
                  <span class="detail-value">{{ reservation.seatsBooked }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Price per Seat:</span>
                  <span class="detail-value">{{ formatPrice(reservation.session?.price) }}</span>
                </div>
                <div class="detail-row total-row">
                  <span class="detail-label">Total Amount:</span>
                  <span class="detail-value total-amount">{{ formatPrice(calculateTotal()) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booked On:</span>
                  <span class="detail-value">{{ formatDateTime(reservation.reservedAt) }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Status -->
          <v-card variant="outlined" class="detail-section status-section">
            <v-card-title class="section-title">
              <v-icon :icon="mdiInformation" class="section-icon" />
              Status
            </v-card-title>
            <v-card-text class="status-content">
              <v-chip
                :color="getStatusColor()"
                variant="elevated"
                size="large"
                class="status-chip"
              >
                <v-icon :icon="getStatusIcon()" start />
                {{ getStatusLabel() }}
              </v-chip>
              <p class="status-description">{{ getStatusDescription() }}</p>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
      
      <v-card-actions class="modal-footer">
        <v-spacer />
        <v-btn
          @click="closeModal"
          color="grey"
          variant="outlined"
        >
          Close
        </v-btn>
        <v-btn
          v-if="reservation && canModify()"
          @click="$emit('modify', reservation)"
          color="warning"
          variant="elevated"
        >
          <v-icon :icon="mdiPencil" start />
          Modify
        </v-btn>
        <v-btn
          v-if="reservation && canCancel()"
          @click="$emit('cancel', reservation)"
          color="error"
          variant="elevated"
        >
          <v-icon :icon="mdiCancel" start />
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useReservationStore } from '../stores/reservations';
import { 
  formatPrice, 
  formatDateTime, 
  formatSessionTime, 
  formatSeatNumbers,
  getReservationStatus 
} from '../utils/seatUtils';
import {
  mdiTicket,
  mdiClose,
  mdiAlertCircle,
  mdiRefresh,
  mdiMovie,
  mdiCalendarClock,
  mdiCreditCard,
  mdiInformation,
  mdiPencil,
  mdiCancel,
  mdiCheckCircle,
  mdiClock,
  mdiCheckAll,
  mdiCloseCircle,
  mdiHelpCircle
} from '@mdi/js';

export default {
  name: 'ReservationDetailsModal',
  props: {
    reservationId: {
      type: Number,
      required: true
    }
  },
  emits: ['close', 'modify', 'cancel'],
  setup(props, { emit }) {
    const reservationStore = useReservationStore();
    const reservation = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const closeModal = () => {
      emit('close');
    };

    const fetchDetails = async () => {
      loading.value = true;
      error.value = null;
      try {
        reservation.value = await reservationStore.getReservationDetails(props.reservationId);
      } catch (err) {
        error.value = err.message || 'Failed to load reservation details';
      } finally {
        loading.value = false;
      }
    };

    const calculateTotal = () => {
      if (reservation.value?.session?.price && reservation.value?.seatsBooked) {
        return reservation.value.session.price * reservation.value.seatsBooked;
      }
      return 0;
    };

    const formatDuration = (session) => {
      if (!session?.startTime || !session?.endTime) return 'N/A';
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      const durationMs = end - start;
      const minutes = Math.floor(durationMs / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${minutes}m`;
    };

    const status = computed(() => {
      if (!reservation.value?.session) return 'unknown';
      return getReservationStatus(reservation.value.session);
    });

    const getStatusLabel = () => {
      const labels = {
        active: 'Active',
        upcoming: 'Upcoming', 
        completed: 'Completed',
        cancelled: 'Cancelled',
        unknown: 'Unknown'
      };
      return labels[status.value] || 'Unknown';
    };

    const getStatusDescription = () => {
      const descriptions = {
        active: 'The movie session is currently in progress.',
        upcoming: 'The movie session is scheduled for a future time.',
        completed: 'The movie session has finished.',
        cancelled: 'This reservation has been cancelled.',
        unknown: 'Unable to determine the current status.'
      };
      return descriptions[status.value] || 'Status unknown';
    };

    const canModify = () => {
      return status.value === 'upcoming';
    };

    const canCancel = () => {
      return status.value === 'upcoming' || status.value === 'active';
    };

    const getStatusColor = () => {
      const colors = {
        active: 'success',
        upcoming: 'info',
        completed: 'secondary',
        cancelled: 'error',
        unknown: 'warning'
      };
      return colors[status.value] || 'warning';
    };

    const getStatusIcon = () => {
      const icons = {
        active: mdiCheckCircle,
        upcoming: mdiClock,
        completed: mdiCheckAll,
        cancelled: mdiCloseCircle,
        unknown: mdiHelpCircle
      };
      return icons[status.value] || mdiHelpCircle;
    };

    onMounted(() => {
      fetchDetails();
    });

    return {
      reservation,
      loading,
      error,
      closeModal,
      fetchDetails,
      calculateTotal,
      formatDuration,
      status,
      getStatusLabel,
      getStatusDescription,
      getStatusColor,
      getStatusIcon,
      canModify,
      canCancel,
      formatPrice,
      formatDateTime,
      formatSessionTime,
      formatSeatNumbers,
      // Icons
      mdiTicket,
      mdiClose,
      mdiAlertCircle,
      mdiRefresh,
      mdiMovie,
      mdiCalendarClock,
      mdiCreditCard,
      mdiInformation,
      mdiPencil,
      mdiCancel
    };
  }
};
</script>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.reservation-details-modal {
  .modern-card {
    background: $glass-bg;
    backdrop-filter: $glass-blur;
    border: $glass-border;
    border-radius: $border-radius-lg;
    box-shadow: $shadow-xl;
    overflow: hidden;

    .modal-header {
      background: $gradient-primary;
      color: white;
      padding: $spacing-lg;
      margin: 0;

      .modal-title {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;

        .title-icon {
          font-size: 1.5rem;
        }
      }

      .close-btn {
        color: white !important;
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      }
    }

    .modal-body {
      padding: $spacing-lg;
      max-height: 70vh;
      overflow-y: auto;

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: $spacing-xl;
        gap: $spacing-md;

        .loading-text {
          color: $text-secondary;
          margin: 0;
        }
      }

      .error-alert {
        .retry-btn {
          margin-top: $spacing-sm;
        }
      }

      .reservation-content {
        .detail-section {
          margin-bottom: $spacing-lg;

          &:last-child {
            margin-bottom: 0;
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: $spacing-sm;
            font-size: 1.1rem;
            font-weight: 600;
            color: $primary;
            padding-bottom: $spacing-sm;

            .section-icon {
              color: $primary;
            }
          }

          .detail-grid {
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: $spacing-sm 0;
              border-bottom: 1px solid rgba($primary, 0.1);

              &:last-child {
                border-bottom: none;
              }

              &.total-row {
                border-top: 2px solid $primary;
                margin-top: $spacing-sm;
                padding-top: $spacing-md;
                font-weight: 600;
              }

              .detail-label {
                font-weight: 500;
                color: $text-secondary;
                flex: 0 0 45%;
                font-size: 0.9rem;
              }

              .detail-value {
                color: $text-primary;
                flex: 1;
                text-align: right;
                font-weight: 400;

                &.movie-title {
                  font-weight: 600;
                  color: $primary;
                }

                &.booking-id {
                  font-family: $font-mono;
                  background: rgba($primary, 0.1);
                  padding: 2px 8px;
                  border-radius: $border-radius-sm;
                  font-size: 0.85rem;
                }

                &.seat-numbers {
                  font-family: $font-mono;
                  font-weight: 500;
                }

                &.total-amount {
                  font-size: 1.1rem;
                  font-weight: 700;
                  color: $success;
                }
              }
            }
          }

          &.movie-section {
            border-left: 4px solid $primary;
          }

          &.session-section {
            border-left: 4px solid $info;
          }

          &.booking-section {
            border-left: 4px solid $warning;
          }

          &.status-section {
            border-left: 4px solid $success;

            .status-content {
              text-align: center;
              padding: $spacing-md;

              .status-chip {
                margin-bottom: $spacing-md;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .status-description {
                color: $text-secondary;
                font-style: italic;
                margin: 0;
                line-height: 1.4;
              }
            }
          }
        }
      }
    }

    .modal-footer {
      background-color: rgba($surface, 0.5);
      padding: $spacing-lg;
      gap: $spacing-sm;

      .v-btn {
        font-weight: 500;
        text-transform: none;
        letter-spacing: normal;
      }
    }
  }
}

// Mobile responsive design
@media (max-width: 768px) {
  .reservation-details-modal {
    .modern-card {
      margin: $spacing-sm;
      
      .modal-body {
        padding: $spacing-md;

        .reservation-content {
          .detail-section {
            .detail-grid {
              .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: $spacing-xs;

                .detail-label {
                  flex: none;
                  font-size: 0.8rem;
                }

                .detail-value {
                  text-align: left;
                  flex: none;
                  width: 100%;
                }
              }
            }
          }
        }
      }

      .modal-footer {
        flex-direction: column;
        gap: $spacing-sm;

        .v-btn {
          width: 100%;
        }
      }
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .reservation-details-modal {
    .modern-card {
      transition: none;
    }
  }
}

// High contrast mode support
@media (prefers-contrast: high) {
  .reservation-details-modal {
    .modern-card {
      background: white;
      border: 2px solid black;

      .modal-header {
        background: black;
        color: white;
      }

      .detail-section {
        border: 1px solid black;

        &.movie-section,
        &.session-section,
        &.booking-section,
        &.status-section {
          border-left-width: 4px;
        }
      }
    }
  }
}
</style>

