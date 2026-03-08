import { computed, onMounted, ref } from "vue";
import { useReservationStore } from "../stores/reservations";
import { getReservationStatus } from "../utils/seatUtils";
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

export function useMyReservations() {
  const reservationStore = useReservationStore();
  const cancelling = ref<number | null>(null);

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

  const fetchReservations = async () => {
    try {
      await reservationStore.fetchMine();
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
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
      alert("Brak informacji o wersji rezerwacji. Odśwież dane.");
      fetchReservations();
      return;
    }

    selectedReservationId.value = reservation.id;
    showDetailsModal.value = true;
  };

  const modifyReservation = (reservation: ReservationWithStatus) => {
    if (!canModify(reservation.status)) {
      alert("Ta rezerwacja nie może być już modyfikowana.");
      return;
    }

    if (!hasVersion(reservation)) {
      alert("Brak informacji o wersji rezerwacji. Odświeżam dane...");
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
      alert("Brak informacji o wersji rezerwacji. Odświeżam dane...");
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
        modificationResult.error.includes("wersja") ||
        modificationResult.error.includes("version")
      ) {
        alert(
          "Rezerwacja została zmieniona przez innego użytkownika. Odświeżam dane...",
        );
        await fetchReservations();
        return;
      }

      alert("Błąd podczas modyfikacji rezerwacji: " + modificationResult.error);
      return;
    }

    await fetchReservations();
  };

  const cancelReservation = async (reservation: Reservation) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    cancelling.value = reservation.id;
    try {
      await reservationStore.cancelReservation(reservation.id, {
        expectedVersion: reservation.version || 0,
      });
      await fetchReservations();
    } catch (err) {
      console.error("Cancel reservation error:", err);
      const message = getErrorMessage(err);

      if (message.includes("został zmodyfikowany")) {
        alert(
          "Ta rezerwacja została zmieniona przez innego użytkownika. Odświeżam dane...",
        );
        await fetchReservations();
      } else if (message.includes("Konflikt")) {
        alert("Konflikt podczas anulowania. Odświeżam dane i spróbuj ponownie.");
        await fetchReservations();
      } else {
        alert("Failed to cancel reservation. Please try again.");
      }
    } finally {
      cancelling.value = null;
    }
  };

  const rateMovie = (reservation: Reservation) => {
    console.log("Rate movie for reservation:", reservation);
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
