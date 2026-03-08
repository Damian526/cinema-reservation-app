import { computed, onMounted, onUnmounted, ref } from "vue";
import { useSessionStore } from "../stores/sessions";
import type { Session } from "../types/session";

type BookingMessage = {
  type: "success" | "error";
  text: string;
} | null;

type BookingResult = {
  success: boolean;
  message: string;
};

export function useSessionList() {
  const sessionStore = useSessionStore();
  const loading = ref(false);
  const error = ref<string | null>(null);
  const showDetailsModal = ref(false);
  const showBookingModal = ref(false);
  const selectedSession = ref<Session | null>(null);
  const bookingMessage = ref<BookingMessage>(null);
  const selectedDate = ref<string | null>(null);

  const sessions = computed(() => sessionStore.list);

  const filteredSessions = computed(() => {
    if (!selectedDate.value) return sessions.value;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const isToday = selectedDate.value === today;

    return sessions.value.filter((session) => {
      const sessionDate = new Date(session.startTime).toISOString().split("T")[0];
      if (sessionDate !== selectedDate.value) return false;

      if (isToday) {
        const sessionTime = new Date(session.startTime);
        const oneHourBeforeSession = new Date(
          sessionTime.getTime() - 60 * 60 * 1000,
        );
        return now < oneHourBeforeSession;
      }

      return true;
    });
  });

  const viewportWidth = ref(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  const isMobile = computed(() => viewportWidth.value <= 600);

  const handleResize = () => {
    viewportWidth.value = window.innerWidth;
  };

  const handleDateSelected = (date: string | null) => {
    selectedDate.value = date;
  };

  const loadSessions = async () => {
    loading.value = true;
    error.value = null;
    try {
      await sessionStore.fetchAll();
    } catch (err) {
      error.value = "Failed to load sessions. Please try again.";
      console.error("Error loading sessions:", err);
    } finally {
      loading.value = false;
    }
  };

  const handleViewDetails = (session: Session) => {
    selectedSession.value = session;
    showDetailsModal.value = true;
  };

  const handleBookSeats = (session: Session) => {
    selectedSession.value = session;
    showDetailsModal.value = false;
    showBookingModal.value = true;
  };

  const closeBookingModal = () => {
    showBookingModal.value = false;
    if (!showDetailsModal.value) selectedSession.value = null;
  };

  const handleBookingComplete = (result: BookingResult) => {
    if (result.success) {
      bookingMessage.value = { type: "success", text: result.message };
      loadSessions();
      closeBookingModal();
    } else {
      bookingMessage.value = { type: "error", text: result.message };
    }

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
    selectedDate.value = new Date().toISOString().split("T")[0];
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }
  });

  onUnmounted(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
    }
  });

  return {
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
  };
}
