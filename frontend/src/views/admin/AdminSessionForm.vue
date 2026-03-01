<template>
  <div class="session-form-page">
    <div class="form-grid">

      <!-- ───────────────── LEFT PANEL ───────────────── -->
      <div class="left-panel">

        <!-- Step 1: Movie -->
        <v-card variant="outlined" class="pa-5 mb-5">
          <div class="step-heading mb-4">
            <v-avatar color="primary" size="26" class="mr-2"><span class="text-caption font-weight-bold text-white">1</span></v-avatar>
            <span class="text-subtitle-1 font-weight-medium">Wybierz film</span>
          </div>

          <v-autocomplete
            v-model="selectedMovie"
            :items="movieOptions"
            item-title="title"
            item-value="id"
            return-object
            label="Film *"
            variant="outlined"
            :rules="[v => !!v || 'Film jest wymagany']"
            clearable
            class="mb-1"
            @update:model-value="onMovieChange"
          >
            <template #item="{ props: p, item }">
              <v-list-item v-bind="p">
                <template #prepend>
                  <v-avatar rounded="sm" size="32" class="mr-2">
                    <v-img v-if="item.raw.posterUrl" :src="item.raw.posterUrl" cover />
                    <v-icon v-else :icon="mdiFilm" size="16" />
                  </v-avatar>
                </template>
                <template #subtitle>{{ item.raw.durationMinutes }} min</template>
              </v-list-item>
            </template>
          </v-autocomplete>

          <v-text-field
            v-if="!selectedMovie"
            v-model="form.movieTitle"
            label="Tytuł (ręcznie) *"
            variant="outlined"
            :rules="[v => !!v || 'Tytuł jest wymagany']"
            hint="Wpisz ręcznie jeśli film nie ma w bibliotece"
            persistent-hint
          />
        </v-card>

        <!-- Step 2: Date mode -->
        <v-card variant="outlined" class="pa-5 mb-5">
          <div class="step-heading mb-4">
            <v-avatar color="primary" size="26" class="mr-2"><span class="text-caption font-weight-bold text-white">2</span></v-avatar>
            <span class="text-subtitle-1 font-weight-medium">Wybierz termin</span>
          </div>

          <!-- Mode toggle (only for new sessions) -->
          <v-btn-toggle
            v-if="!isEdit"
            v-model="dateMode"
            mandatory
            variant="outlined"
            color="primary"
            density="comfortable"
            class="mb-5 w-100"
          >
            <v-btn value="single" class="flex-grow-1">Jednorazowo</v-btn>
            <v-btn value="multi" class="flex-grow-1">Wiele dat</v-btn>
            <v-btn value="recurring" class="flex-grow-1">Cyklicznie</v-btn>
          </v-btn-toggle>

          <!-- SINGLE mode -->
          <div v-if="dateMode === 'single' || isEdit" class="date-row">
            <v-text-field
              v-model="form.startTime"
              label="Rozpoczęcie *"
              type="datetime-local"
              variant="outlined"
              :rules="[v => !!v || 'Wymagane']"
              @update:model-value="onStartTimeChange"
            />
            <v-text-field
              v-model="form.endTime"
              label="Zakończenie *"
              type="datetime-local"
              variant="outlined"
              :rules="[v => !!v || 'Wymagane', v => !form.startTime || v > form.startTime || 'Musi być po starcie']"
            />
          </div>

          <!-- MULTI mode -->
          <div v-if="dateMode === 'multi' && !isEdit">
            <v-date-picker
              v-model="multiDates"
              multiple
              show-adjacent-months
              width="100%"
              class="mb-4"
            />
            <div v-if="multiDates.length" class="d-flex flex-wrap gap-2 mb-4">
              <v-chip
                v-for="d in multiDates"
                :key="d"
                closable
                size="small"
                @click:close="removeMultiDate(d)"
              >{{ formatChipDate(d) }}</v-chip>
            </div>
            <div class="date-row">
              <v-text-field
                v-model="sharedTime"
                label="Godzina rozpoczęcia *"
                type="time"
                variant="outlined"
                :rules="[v => !!v || 'Wymagane']"
                @update:model-value="recalcSharedEnd"
              />
              <v-text-field
                v-model="sharedEndTime"
                label="Godzina zakończenia *"
                type="time"
                variant="outlined"
                :rules="[v => !!v || 'Wymagane']"
              />
            </div>
          </div>

          <!-- RECURRING mode -->
          <div v-if="dateMode === 'recurring' && !isEdit">
            <div class="section-label mb-2">Dni tygodnia</div>
            <div class="d-flex flex-wrap gap-2 mb-4">
              <v-chip
                v-for="d in weekdays"
                :key="d.value"
                :color="recurringDays.includes(d.value) ? 'primary' : undefined"
                :variant="recurringDays.includes(d.value) ? 'flat' : 'outlined'"
                size="small"
                class="cursor-pointer"
                @click="toggleDay(d.value)"
              >{{ d.label }}</v-chip>
            </div>

            <div class="date-row mb-4">
              <v-text-field
                v-model="recurringFrom"
                label="Od *"
                type="date"
                variant="outlined"
                :rules="[v => !!v || 'Wymagane']"
              />
              <v-text-field
                v-model="recurringTo"
                label="Do *"
                type="date"
                variant="outlined"
                :rules="[v => !!v || 'Wymagane', v => !recurringFrom || v >= recurringFrom || 'Musi być po dacie Od']"
              />
            </div>

            <div class="date-row">
              <v-text-field
                v-model="sharedTime"
                label="Godzina rozpoczęcia *"
                type="time"
                variant="outlined"
                :rules="[v => !!v || 'Wymagane']"
                @update:model-value="recalcSharedEnd"
              />
              <v-text-field
                v-model="sharedEndTime"
                label="Godzina zakończenia *"
                type="time"
                variant="outlined"
                :rules="[v => !!v || 'Wymagane']"
              />
            </div>

            <v-alert
              v-if="recurringPreviewDates.length"
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2"
            >
              Zostanie utworzonych <strong>{{ recurringPreviewDates.length }}</strong> seansów
              ({{ recurringPreviewDates[0] }} … {{ recurringPreviewDates[recurringPreviewDates.length - 1] }})
            </v-alert>
            <v-alert v-else-if="recurringFrom && recurringTo && recurringDays.length" type="warning" variant="tonal" density="compact" class="mt-2">
              Brak pasujących dat w podanym zakresie.
            </v-alert>
          </div>
        </v-card>

        <!-- Step 3: Details -->
        <v-card variant="outlined" class="pa-5 mb-5">
          <div class="step-heading mb-4">
            <v-avatar color="primary" size="26" class="mr-2"><span class="text-caption font-weight-bold text-white">3</span></v-avatar>
            <span class="text-subtitle-1 font-weight-medium">Szczegóły seansu</span>
          </div>

          <div class="details-row mb-2">
            <v-text-field
              v-model.number="form.roomNumber"
              label="Sala *"
              type="number"
              variant="outlined"
              :rules="[v => v > 0 || 'Wymagane']"
              min="1"
            />
            <v-text-field
              v-model.number="form.totalSeats"
              label="Liczba miejsc *"
              type="number"
              variant="outlined"
              :rules="[v => v > 0 || 'Wymagane', v => v <= 500 || 'Max 500']"
              min="1" max="500"
            />
            <v-text-field
              v-model.number="form.price"
              label="Cena (PLN) *"
              type="number"
              variant="outlined"
              :rules="[v => v >= 0 || 'Wymagane']"
              min="0" step="0.5"
            />
          </div>

          <v-textarea
            v-model="form.description"
            label="Opis (opcjonalnie)"
            variant="outlined"
            rows="3"
            auto-grow
          />
        </v-card>

        <!-- Alerts & Actions -->
        <v-alert v-if="errorMsg" type="error" variant="tonal" density="compact" class="mb-4">{{ errorMsg }}</v-alert>

        <v-progress-linear
          v-if="bulkProgress > 0"
          :model-value="bulkProgress"
          color="primary"
          rounded
          height="8"
          class="mb-4"
        />

        <div class="form-actions">
          <v-btn variant="text" @click="$router.back()">Anuluj</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="isLoading"
            :prepend-icon="isEdit ? mdiContentSave : mdiPlus"
            @click="handleSubmit"
          >
            {{ submitLabel }}
          </v-btn>
        </div>
      </div>

      <!-- ───────────────── RIGHT SIDEBAR ───────────────── -->
      <div class="right-panel">
        <v-card variant="outlined" class="pa-4 mb-4">
          <div class="section-label mb-3">Wybrany film</div>
          <div v-if="selectedMovie">
            <v-img
              v-if="selectedMovie.posterUrl"
              :src="selectedMovie.posterUrl"
              rounded="lg"
              cover
              height="200"
              class="mb-3"
            />
            <div v-else class="poster-placeholder mb-3">
              <v-icon :icon="mdiFilm" size="52" color="on-surface-variant" />
            </div>
            <div class="text-subtitle-2 font-weight-bold">{{ selectedMovie.title }}</div>
            <div class="text-caption text-medium-emphasis">{{ selectedMovie.durationMinutes }} minut</div>
          </div>
          <div v-else class="poster-placeholder">
            <v-icon :icon="mdiFilm" size="40" color="on-surface-variant" />
            <p class="text-caption text-medium-emphasis mt-1">Nie wybrano</p>
          </div>
        </v-card>

        <!-- Summary card -->
        <v-card variant="outlined" class="pa-4">
          <div class="section-label mb-3">Podsumowanie</div>

          <!-- single -->
          <template v-if="dateMode === 'single' || isEdit">
            <div v-if="form.startTime" class="summary-row">
              <span class="text-caption">Data</span>
              <span class="text-body-2">{{ formatDate(form.startTime) }}</span>
            </div>
            <div v-if="form.startTime" class="summary-row">
              <span class="text-caption">Godzina</span>
              <span class="text-body-2">{{ formatTime(form.startTime) }}<span v-if="form.endTime"> – {{ formatTime(form.endTime) }}</span></span>
            </div>
          </template>

          <!-- multi / recurring -->
          <template v-else>
            <div class="summary-row">
              <span class="text-caption">Seansów</span>
              <span class="text-body-2 font-weight-bold">{{ bulkDatesCount }}</span>
            </div>
            <div v-if="sharedTime" class="summary-row">
              <span class="text-caption">Godzina</span>
              <span class="text-body-2">{{ sharedTime }}<span v-if="sharedEndTime"> – {{ sharedEndTime }}</span></span>
            </div>
          </template>

          <div v-if="form.roomNumber" class="summary-row">
            <span class="text-caption">Sala</span>
            <span class="text-body-2">{{ form.roomNumber }}</span>
          </div>
          <div v-if="form.totalSeats" class="summary-row">
            <span class="text-caption">Miejsca</span>
            <span class="text-body-2">{{ form.totalSeats }}</span>
          </div>
          <div v-if="form.price != null" class="summary-row">
            <span class="text-caption">Cena</span>
            <span class="text-body-2">{{ formatPrice(form.price) }}</span>
          </div>
        </v-card>
      </div>
    </div>

    <v-snackbar v-model="snackbar" color="success" timeout="3000">
      {{ snackbarMsg }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiFilm, mdiPlus, mdiContentSave } from '@mdi/js';
import { isAxiosError } from 'axios';
import { useSessionStore } from '../../stores/sessions';
import api from '../../utils/axios';
import { formatDatePL, formatTimePL, formatPricePLN } from '../../utils/formatters';

interface MovieOption {
  id: number;
  title: string;
  durationMinutes: number;
  posterUrl: string | null;
}

const props = defineProps<{ id?: string }>();
const route  = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();

const isEdit     = computed(() => !!(props.id ?? route.params.id));
const sessionId  = computed(() => Number(props.id ?? route.params.id));

const isLoading  = ref(false);
const errorMsg   = ref('');
const snackbar   = ref(false);
const snackbarMsg = ref('');
const bulkProgress = ref(0);

/* ── Movies ──────────────────────────────────────────────── */
const movieOptions  = ref<MovieOption[]>([]);
const selectedMovie = ref<MovieOption | null>(null);

/* ── Date mode ───────────────────────────────────────────── */
type DateMode = 'single' | 'multi' | 'recurring';
const dateMode = ref<DateMode>('single');

/* ── Form (single / edit) ────────────────────────────────── */
const form = ref({
  movieTitle: '',
  description: '',
  startTime: '',
  endTime: '',
  totalSeats: 100,
  price: 25,
  roomNumber: 1,
});

/* ── Multi-date ──────────────────────────────────────────── */
const multiDates   = ref<string[]>([]);
const sharedTime   = ref('18:00');
const sharedEndTime = ref('');

/* ── Recurring ───────────────────────────────────────────── */
const recurringFrom = ref('');
const recurringTo   = ref('');
const recurringDays = ref<number[]>([]);
const weekdays = [
  { label: 'Pon', value: 1 },
  { label: 'Wt',  value: 2 },
  { label: 'Śr',  value: 3 },
  { label: 'Czw', value: 4 },
  { label: 'Pt',  value: 5 },
  { label: 'Sob', value: 6 },
  { label: 'Nd',  value: 0 },
];

function toggleDay(v: number) {
  const i = recurringDays.value.indexOf(v);
  if (i === -1) recurringDays.value.push(v);
  else          recurringDays.value.splice(i, 1);
}

/* ── Computed preview ────────────────────────────────────── */
const recurringPreviewDates = computed<string[]>(() => {
  if (!recurringFrom.value || !recurringTo.value || !recurringDays.value.length) return [];
  const result: string[] = [];
  const cur = new Date(recurringFrom.value + 'T00:00:00');
  const end = new Date(recurringTo.value   + 'T00:00:00');
  while (cur <= end) {
    if (recurringDays.value.includes(cur.getDay())) {
      result.push(cur.toISOString().slice(0, 10));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return result;
});

const bulkDatesCount = computed(() => {
  if (dateMode.value === 'multi')      return multiDates.value.length;
  if (dateMode.value === 'recurring')  return recurringPreviewDates.value.length;
  return 1;
});

const submitLabel = computed(() => {
  if (isEdit.value) return 'Zapisz zmiany';
  if (dateMode.value === 'single') return 'Utwórz seans';
  return `Utwórz ${bulkDatesCount.value} seansów`;
});

/* ── Helpers ─────────────────────────────────────────────── */
function toDatetimeLocal(iso: string) {
  const d   = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildISOStart(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}
function buildISOEnd(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

function calcEndTime(startISO: string, durationMin: number) {
  return new Date(new Date(startISO).getTime() + durationMin * 60_000).toISOString();
}

function onMovieChange(movie: MovieOption | null) {
  selectedMovie.value = movie;
  if (movie) {
    form.value.movieTitle = movie.title;
    if (form.value.startTime) onStartTimeChange(form.value.startTime);
    recalcSharedEnd(sharedTime.value);
  }
}

function onStartTimeChange(val: string) {
  if (selectedMovie.value && val) {
    const endISO = calcEndTime(new Date(val).toISOString(), selectedMovie.value.durationMinutes);
    form.value.endTime = toDatetimeLocal(endISO);
  }
}

function recalcSharedEnd(time: string) {
  if (!time || !selectedMovie.value) return;
  const [h, m] = time.split(':').map(Number);
  const totalMin = h * 60 + m + selectedMovie.value.durationMinutes;
  const eh = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
  const em = String(totalMin % 60).padStart(2, '0');
  sharedEndTime.value = `${eh}:${em}`;
}

function removeMultiDate(d: string) {
  multiDates.value = multiDates.value.filter(x => x !== d);
}

function formatChipDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const formatDate = formatDatePL;
const formatTime = formatTimePL;
const formatPrice = formatPricePLN;

/* ── Load data ───────────────────────────────────────────── */
async function loadMovies() {
  try {
    const { data } = await api.get<MovieOption[]>('/admin/movies/all');
    movieOptions.value = data;
  } catch {}
}

async function loadSession() {
  if (!isEdit.value) return;
  const session = await sessionStore.adminFetchSession(sessionId.value);
  form.value.movieTitle  = session.movieTitle;
  form.value.description = session.description ?? '';
  form.value.startTime   = toDatetimeLocal(session.startTime);
  form.value.endTime     = toDatetimeLocal(session.endTime);
  form.value.totalSeats  = session.totalSeats;
  form.value.price       = session.price;
  form.value.roomNumber  = session.roomNumber;
  if (session.movieId) {
    selectedMovie.value = movieOptions.value.find(m => m.id === session.movieId) ?? null;
  }
}

/* ── Submit ──────────────────────────────────────────────── */
async function handleSubmit() {
  errorMsg.value   = '';
  bulkProgress.value = 0;

  const basePayload = () => ({
    movieId:     selectedMovie.value?.id ?? null,
    movieTitle:  selectedMovie.value ? selectedMovie.value.title : form.value.movieTitle,
    description: form.value.description || undefined,
    totalSeats:  form.value.totalSeats,
    price:       form.value.price,
    roomNumber:  form.value.roomNumber,
  });

  isLoading.value = true;
  try {
    if (isEdit.value || dateMode.value === 'single') {
      if (!form.value.startTime || !form.value.endTime) { errorMsg.value = 'Uzupełnij daty.'; return; }
      const payload = {
        ...basePayload(),
        startTime: new Date(form.value.startTime).toISOString(),
        endTime:   new Date(form.value.endTime).toISOString(),
      };
      if (isEdit.value) {
        await sessionStore.adminUpdateSession(sessionId.value, payload);
        snackbarMsg.value = 'Seans zaktualizowany!';
      } else {
        await sessionStore.adminCreateSession(payload);
        snackbarMsg.value = 'Seans utworzony!';
      }
      snackbar.value = true;
      setTimeout(() => router.push('/admin/sessions'), 1200);
    } else {
      // Bulk create
      const dates = dateMode.value === 'multi'
        ? multiDates.value.slice().sort()
        : recurringPreviewDates.value;

      if (!dates.length) { errorMsg.value = 'Wybierz co najmniej jedną datę.'; return; }
      if (!sharedTime.value || !sharedEndTime.value) { errorMsg.value = 'Uzupełnij godziny.'; return; }

      let done = 0;
      for (const d of dates) {
        const payload = {
          ...basePayload(),
          startTime: buildISOStart(d, sharedTime.value),
          endTime:   buildISOEnd(d, sharedEndTime.value),
        };
        await sessionStore.adminCreateSession(payload);
        done++;
        bulkProgress.value = Math.round((done / dates.length) * 100);
      }
      snackbarMsg.value = `Utworzono ${done} seansów!`;
      snackbar.value = true;
      setTimeout(() => router.push('/admin/sessions'), 1400);
    }
  } catch (e: unknown) {
    const message = isAxiosError(e) ? e.response?.data?.message : undefined;
    errorMsg.value = typeof message === 'string' ? message : 'Coś poszło nie tak.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await loadMovies();
  await loadSession();
});
</script>

<style lang="scss" scoped>
.session-form-page { padding: 0; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  align-items: start;
}

@media (max-width: 860px) {
  .form-grid { grid-template-columns: 1fr; }
  .right-panel { order: -1; }
}

.step-heading {
  display: flex;
  align-items: center;
}

.section-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(0,0,0,.45);
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.details-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

@media (max-width: 600px) {
  .date-row, .details-row { grid-template-columns: 1fr; }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 4px;
}

.poster-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  border-radius: 12px;
  background: rgba(0,0,0,.04);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid rgba(0,0,0,.06);
  &:last-child { border-bottom: none; }
}

.cursor-pointer { cursor: pointer; }
.gap-2 { gap: 8px; }
.w-100 { width: 100%; }
</style>
