<template>
  <v-container class="seat-selection-view py-6">
    <v-alert
      v-if="bookingMessage"
      :type="bookingMessage.type"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="bookingMessage = null"
    >
      {{ bookingMessage.text }}
    </v-alert>

    <v-card v-if="loading" class="state-card" elevation="0" border>
      <v-card-text class="text-center py-10">
        <v-progress-circular indeterminate color="primary" size="56" class="mb-4" />
        <p class="text-h6 text-medium-emphasis">Loading session details...</p>
      </v-card-text>
    </v-card>

    <v-card v-else-if="error" class="state-card" elevation="0" border>
      <v-card-text class="text-center py-10">
        <v-icon :icon="mdiAlertCircle" size="56" color="error" class="mb-4" />
        <h2 class="text-h5 mb-2">Unable To Load This Session</h2>
        <p class="text-medium-emphasis mb-5">{{ error }}</p>
        <div class="d-flex justify-center ga-3 flex-wrap">
          <v-btn color="primary" @click="loadSession">Try Again</v-btn>
          <v-btn variant="outlined" @click="router.push('/sessions')">Back To Sessions</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <SeatGrid
      v-else-if="session"
      :session-id="sessionId"
      :session="session"
      @booking-complete="handleBookingComplete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { mdiAlertCircle } from "@mdi/js";
import { useRouter } from "vue-router";
import { isAxiosError } from "axios";
import SeatGrid from "../components/SeatGrid.vue";
import api from "../utils/axios";
import type { Session } from "../types/session";

const props = defineProps<{
  sessionId: number;
}>();

const router = useRouter();
const loading = ref(true);
const error = ref<string | null>(null);
const session = ref<Session | null>(null);
const bookingMessage = ref<{
  type: "success" | "error";
  text: string;
} | null>(null);

async function loadSession() {
  if (!Number.isFinite(props.sessionId) || props.sessionId <= 0) {
    await router.replace({ name: "NotFound" });
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const { data } = await api.get<Session>(`/sessions/${props.sessionId}`);
    if (!data) {
      throw new Error("Session not found.");
    }
    session.value = data;
  } catch (err) {
    session.value = null;
    const apiMessage = isAxiosError(err) ? err.response?.data?.message : undefined;
    error.value =
      typeof apiMessage === "string"
        ? apiMessage
        : "The selected session could not be loaded.";
  } finally {
    loading.value = false;
  }
}

function handleBookingComplete(result: { success: boolean; message: string }) {
  bookingMessage.value = {
    type: result.success ? "success" : "error",
    text: result.message,
  };
}

watch(() => props.sessionId, loadSession, { immediate: true });
</script>

<style scoped lang="scss">
@use "../styles/variables.scss" as *;

.seat-selection-view {
  max-width: 1200px;
}

.state-card {
  border-radius: $border-radius-lg;
  background: $glass-bg;
  backdrop-filter: $glass-blur;
  border: $glass-border;
}
</style>
