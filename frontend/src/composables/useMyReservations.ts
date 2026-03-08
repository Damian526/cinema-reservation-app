import { computed, onMounted, ref } from "vue";
import { isAxiosError } from "axios";
import { useReservationStore } from "../stores/reservations";
import { getReservationStatus } from "../utils/seatUtils";
import { logger } from "../utils/logger";
import type {
  Reservation,
  ReservationStatus,
  ReservationWithStatus,
} from "../types/reservation";

interface ModificationResult {
  success?: boolean;
  error?: string;
}

function hasVersion(reservation: Reservation): boolean {
  return reservation.version !== undefined && reservation.version !== null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Unknown error";
}

function getErrorStatus(error: unknown): number | null {
  if (!isAxiosError(error)) return null;
  return typeof error.response?.status === "number" ? error.response.status : null;
}

export function useMyReservations() {
  const reservationStore = useReservationStore();
  const cancelling = ref<number | null>(null);
  const feedbackVisible = ref(false);
  const feedbackMessage = ref("");
  const feedbackType = ref<"info" | "error">("info");

  const showDetailsModal = ref(false);
  const showModifyModal = ref(false);
  const selectedReservationId = ref<number | null>(null);
  const selectedReservation = ref<Reservation | null>(null);

  const reservations = computed(() => reservationStore.mine);
  const loading = computed(() => reservationStore.loading);
  const error = computed(() => reservationStore.error);

  const reservationsWithStatus = computed<ReservationWithStatus[]>(() => {
    return reservations.value
      .map((reservation) => {
        const session = reservation.session;
        const status: ReservationStatus = session
          ? (getReservationStatus(session) as ReservationStatus)
          : "unknown";

        return {
          ...reservation,
          status,
        };
      })
      .sort((a, b) => {
        if (!a.session?.startTime || !b.session?.startTime) return 0;
        return (
          new Date(b.session.startTime).getTime() -
          new Date(a.session.startTime).getTime()
        );
      });
  });

  const showFeedback = (message: string, type: "info" | "error" = "info") => {
    feedbackMessage.value = message;
    feedbackType.value = type;
    feedbackVisible.value = true;
  };

  const hideFeedback = () => {
    feedbackVisible.value = false;
  };

  const fetchReservations = async () => {
    try {
      await reservationStore.fetchMine();
    } catch (err) {
      logger.error("Failed to fetch reservations:", err);
    }
  };

  const calculateTotal = (reservation: Reservation) => {
    if (reservation.session?.price && reservation.seatsBooked) {
      return reservation.session.price * reservation.seatsBooked;
    }
    return 0;
  };

  const getStatusLabel = (status: ReservationStatus) => {
    const labels: Record<ReservationStatus, string> = {
      active: "Active",
      upcoming: "Upcoming",
      completed: "Completed",
      cancelled: "Cancelled",
      unknown: "Unknown",
    };
    return labels[status] || "Unknown";
  };

  const canModify = (status: ReservationStatus) =>
    status === "upcoming" || status === "active";

  const canCancel = (status: ReservationStatus) =>
    status === "upcoming" || status === "active";

  const viewDetails = (reservation: Reservation) => {
    if (!hasVersion(reservation)) {
      showFeedback("Reservation version information is missing. Refreshing data.", "error");
      fetchReservations();
      return;
    }

    selectedReservationId.value = reservation.id;
    showDetailsModal.value = true;
  };

  const modifyReservation = (reservation: ReservationWithStatus) => {
    if (!canModify(reservation.status)) {
      showFeedback("This reservation can no longer be modified.", "error");
      return;
    }

    if (!hasVersion(reservation)) {
      showFeedback("Reservation version information is missing. Refreshing data...", "error");
      fetchReservations();
      return;
    }

    selectedReservation.value = { ...reservation };
    showModifyModal.value = true;
  };

  const openModifyModal = (reservation: Reservation) => {
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

  const handleCancelFromDetails = async (reservation: Reservation) => {
    closeDetailsModal();

    if (!hasVersion(reservation)) {
      showFeedback("Reservation version information is missing. Refreshing data...", "error");
      await fetchReservations();
      return;
    }

    await cancelReservation(reservation);
  };

  const handleReservationModified = async (
    modificationResult?: ModificationResult,
  ) => {
    closeModifyModal();

    if (modificationResult?.success) {
      await fetchReservations();
      return;
    }

    if (modificationResult?.error) {
      if (
        modificationResult.error.toLowerCase().includes("version")
      ) {
        showFeedback(
          "This reservation was updated by another user. Refreshing data...",
          "error",
        );
        await fetchReservations();
        return;
      }

      showFeedback("Error while modifying reservation: " + modificationResult.error, "error");
      return;
    }

    await fetchReservations();
  };

  const cancelReservation = async (reservation: Reservation) => {
    cancelling.value = reservation.id;
    try {
      await reservationStore.cancelReservation(reservation.id, {
        expectedVersion: reservation.version || 0,
      });
      await fetchReservations();
    } catch (err) {
      logger.error("Cancel reservation error:", err);
      const message = getErrorMessage(err);
      const status = getErrorStatus(err);

      if (status === 409 || message.toLowerCase().includes("modified")) {
        showFeedback(
          "This reservation was updated by another user. Refreshing data...",
          "error",
        );
        await fetchReservations();
      } else if (message.toLowerCase().includes("conflict")) {
        showFeedback("Conflict while cancelling. Refreshing data, then try again.", "error");
        await fetchReservations();
      } else {
        showFeedback("Failed to cancel reservation. Please try again.", "error");
      }
    } finally {
      cancelling.value = null;
    }
  };

  const rateMovie = (reservation: Reservation) => {
    logger.warn("Rate movie for reservation:", reservation);
  };

  onMounted(() => {
    fetchReservations();
  });

  return {
    reservations,
    loading,
    error,
    reservationsWithStatus,
    cancelling,
    feedbackVisible,
    feedbackMessage,
    feedbackType,
    hideFeedback,
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
  };
}
