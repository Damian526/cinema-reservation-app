<template>
  <div class="admin-session-list">
    <!-- Toolbar -->
    <div class="list-toolbar">
      <div class="toolbar-filters">
        <v-text-field
          v-model="search"
          placeholder="Search by title..."
          :prepend-inner-icon="mdiMagnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="search-field"
        />
        <v-select
          v-model="filterMovieId"
          :items="movieOptions"
          item-title="title"
          item-value="id"
          label="Filter by movie"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="movie-filter"
        />
        <v-text-field
          v-model="filterDateFrom"
          label="From date"
          type="date"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="date-filter"
        />
        <v-text-field
          v-model="filterDateTo"
          label="To date"
          type="date"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="date-filter"
        />
      </div>
      <v-btn
        color="primary"
        :prepend-icon="mdiPlus"
        to="/admin/sessions/new"
      >
        Add Session
      </v-btn>
    </div>

    <!-- Table -->
    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="sessions"
      :items-length="total"
      :loading="loading"
      :page="page"
      @update:page="page = $event"
      @update:items-per-page="itemsPerPage = $event"
      class="sessions-table"
    >
      <!-- Movie column -->
      <template #item.movie="{ item }">
        <div class="movie-cell">
          <v-avatar
            v-if="item.movie?.posterUrl"
            rounded="sm"
            size="36"
            class="mr-2"
          >
            <v-img :src="item.movie.posterUrl" cover />
          </v-avatar>
          <v-avatar v-else rounded="sm" size="36" color="surface-variant" class="mr-2">
            <v-icon :icon="mdiFilm" size="18" />
          </v-avatar>
          <span class="movie-title">{{ item.movieTitle }}</span>
        </div>
      </template>

      <!-- Date/time column -->
      <template #item.startTime="{ item }">
        <div class="time-cell">
          <div class="date">{{ formatDate(item.startTime) }}</div>
          <div class="time text-medium-emphasis">{{ formatTime(item.startTime) }} – {{ formatTime(item.endTime) }}</div>
        </div>
      </template>

      <!-- Seats column -->
      <template #item.seats="{ item }">
        <v-chip
          :color="item.availableSeats === 0 ? 'error' : item.availableSeats < item.totalSeats * 0.2 ? 'warning' : 'success'"
          size="small"
          variant="tonal"
        >
          {{ item.availableSeats }} / {{ item.totalSeats }}
        </v-chip>
      </template>

      <!-- Price column -->
      <template #item.price="{ item }">
        {{ formatPrice(item.price) }}
      </template>

      <!-- Room column -->
      <template #item.roomNumber="{ item }">
        <v-chip size="small" variant="outlined">
          Room {{ item.roomNumber }}
        </v-chip>
      </template>

      <!-- Actions column -->
      <template #item.actions="{ item }">
        <v-btn
          :icon="mdiPencil"
          variant="text"
          size="small"
          color="primary"
          :to="`/admin/sessions/${item.id}/edit`"
        />
        <v-btn
          :icon="mdiDelete"
          variant="text"
          size="small"
          color="error"
          @click="confirmDelete(item)"
        />
      </template>
    </v-data-table-server>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6 pa-4">Delete Session?</v-card-title>
        <v-card-text class="px-4 pb-2">
          <strong>{{ sessionToDelete?.movieTitle }}</strong> on
          {{ sessionToDelete ? formatDate(sessionToDelete.startTime) : '' }}
          at {{ sessionToDelete ? formatTime(sessionToDelete.startTime) : '' }}
          <br />
          <span class="text-caption text-medium-emphasis mt-1 d-block">
            Sessions with existing reservations cannot be deleted.
          </span>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleteLoading" @click="executeDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMsg }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { mdiMagnify, mdiPlus, mdiPencil, mdiDelete, mdiFilm } from '@mdi/js';
import { watchDebounced } from '@vueuse/core';
import { isAxiosError } from 'axios';
import { useSessionStore } from '../../stores/sessions';
import { useMoviesStore } from '../../stores/movies';
import type { Session } from '../../types/session';

const sessionStore = useSessionStore();
const moviesStore = useMoviesStore();

// Filters
const search = ref('');
const filterMovieId = ref<number | null>(null);
const filterDateFrom = ref('');
const filterDateTo = ref('');

// Pagination
const page = ref(1);
const itemsPerPage = ref(20);

// Data
const sessions = ref<Session[]>([]);
const total = ref(0);
const loading = computed(() => sessionStore.adminLoading);

// Movie options for filter dropdown
const movieOptions = ref<{ id: number; title: string }[]>([]);

// Delete dialog
const deleteDialog = ref(false);
const sessionToDelete = ref<Session | null>(null);
const deleteLoading = ref(false);

// Snackbar
const snackbar = ref(false);
const snackbarMsg = ref('');
const snackbarColor = ref<'success' | 'error'>('success');

const headers = [
  { title: 'Movie', key: 'movie', sortable: false, width: '280px' },
  { title: 'Date & Time', key: 'startTime', sortable: false },
  { title: 'Room', key: 'roomNumber', sortable: false, align: 'center' as const },
  { title: 'Seats (free/total)', key: 'seats', sortable: false, align: 'center' as const },
  { title: 'Price', key: 'price', sortable: false, align: 'end' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const, width: '100px' },
];

async function loadSessions() {
  const result = await sessionStore.adminFetchSessions({
    page: page.value,
    limit: itemsPerPage.value,
    search: search.value || undefined,
    movieId: filterMovieId.value ?? undefined,
    dateFrom: filterDateFrom.value || undefined,
    dateTo: filterDateTo.value || undefined,
  });
  sessions.value = result.data;
  total.value = result.total;
}

async function loadMovies() {
  try {
    await moviesStore.fetchMovies({ page: 1, limit: 1 }); // init store
    const { data } = await import('../../utils/axios').then(m => m.default.get('/admin/movies/all'));
    movieOptions.value = data;
  } catch {}
}

// Reset page on filter change
watchDebounced(search, () => { page.value = 1; loadSessions(); }, { debounce: 400 });
watch([filterMovieId, filterDateFrom, filterDateTo], () => { page.value = 1; loadSessions(); });
watch([page, itemsPerPage], loadSessions);

onMounted(() => {
  loadSessions();
  loadMovies();
});

function confirmDelete(session: Session) {
  sessionToDelete.value = session;
  deleteDialog.value = true;
}

async function executeDelete() {
  if (!sessionToDelete.value) return;
  deleteLoading.value = true;
  try {
    await sessionStore.adminDeleteSession(sessionToDelete.value.id);
    snackbarMsg.value = 'Session deleted.';
    snackbarColor.value = 'success';
    snackbar.value = true;
    deleteDialog.value = false;
    await loadSessions();
  } catch (e: unknown) {
    const message = isAxiosError(e) ? e.response?.data?.message : undefined;
    snackbarMsg.value = typeof message === 'string' ? message : 'Cannot delete — session has reservations.';
    snackbarColor.value = 'error';
    snackbar.value = true;
  } finally {
    deleteLoading.value = false;
    sessionToDelete.value = null;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}
function formatPrice(price: number) {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(price);
}
</script>

<style lang="scss" scoped>
.admin-session-list {
  padding: 0;
}
.list-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.toolbar-filters {
  display: flex;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
}
.search-field { min-width: 200px; max-width: 280px; }
.movie-filter { min-width: 200px; max-width: 240px; }
.date-filter  { min-width: 140px; max-width: 180px; }

.movie-cell {
  display: flex;
  align-items: center;
}
.movie-title {
  font-weight: 500;
  font-size: 0.875rem;
}
.time-cell .date { font-weight: 500; font-size: 0.875rem; }
.time-cell .time { font-size: 0.75rem; }
</style>
