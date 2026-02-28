<template>
  <div class="movie-form-page">
    <div class="page-header">
      <v-btn
        :icon="mdiArrowLeft"
        variant="text"
        @click="router.push('/admin/movies')"
        class="mr-2"
      />
      <div>
        <h2 class="page-title">{{ isEdit ? 'Edit Movie' : 'Add New Movie' }}</h2>
        <p class="page-subtitle">
          {{ isEdit ? `Editing: ${moviesStore.currentMovie?.title}` : 'Fill in the movie details below' }}
        </p>
      </div>
    </div>

    <!-- Loading state when fetching movie for edit -->
    <div v-if="moviesStore.isLoading && isEdit && !formReady" class="loading-state">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-form v-else ref="formRef" @submit.prevent="handleSubmit" class="movie-form">
      <v-row>
        <!-- Left column -->
        <v-col cols="12" md="8">
          <v-card elevation="0" border class="mb-4">
            <v-card-title class="section-title">Basic Information</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="form.title"
                label="Title *"
                variant="outlined"
                :rules="required('Title')"
                counter="120"
                class="mb-3"
              />

              <v-textarea
                v-model="form.description"
                label="Description"
                variant="outlined"
                rows="4"
                auto-grow
                counter="2000"
                class="mb-3"
              />

              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.director"
                    label="Director *"
                    variant="outlined"
                    :rules="required('Director')"
                    counter="100"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.genre"
                    :items="MOVIE_GENRES"
                    label="Genre *"
                    variant="outlined"
                    :rules="required('Genre')"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card elevation="0" border>
            <v-card-title class="section-title">Details</v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.releaseYear"
                    label="Release Year *"
                    variant="outlined"
                    type="number"
                    :rules="yearRules"
                    min="1888"
                    :max="currentYear + 5"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.durationMinutes"
                    label="Duration (minutes) *"
                    variant="outlined"
                    type="number"
                    :rules="durationRules"
                    min="1"
                    max="600"
                    suffix="min"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right column -->
        <v-col cols="12" md="4">
          <v-card elevation="0" border class="mb-4">
            <v-card-title class="section-title">Poster</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="form.posterUrl"
                label="Poster URL"
                variant="outlined"
                :rules="urlRules"
                hint="Optional — direct link to poster image"
                persistent-hint
                class="mb-3"
              />
              <div v-if="form.posterUrl" class="poster-preview">
                <v-img
                  :src="form.posterUrl"
                  aspect-ratio="2/3"
                  cover
                  rounded="lg"
                  class="poster-img"
                >
                  <template #error>
                    <div class="poster-error">
                      <v-icon :icon="mdiImageBroken" />
                      <span>Invalid URL</span>
                    </div>
                  </template>
                </v-img>
              </div>
              <div v-else class="poster-placeholder">
                <v-icon :icon="mdiFilm" size="48" color="grey-lighten-1" />
                <p>No poster</p>
              </div>
            </v-card-text>
          </v-card>

          <!-- Save card -->
          <v-card elevation="0" border>
            <v-card-title class="section-title">Publish</v-card-title>
            <v-card-text>
              <v-alert
                v-if="moviesStore.error"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-3"
              >
                {{ moviesStore.error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="moviesStore.isLoading"
                class="mb-2"
              >
                {{ isEdit ? 'Save Changes' : 'Create Movie' }}
              </v-btn>
              <v-btn
                variant="outlined"
                block
                @click="router.push('/admin/movies')"
                :disabled="moviesStore.isLoading"
              >
                Cancel
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>

    <v-snackbar v-model="snackbar" color="success" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mdiArrowLeft, mdiFilm, mdiImageBroken } from '@mdi/js';
import { useMoviesStore } from '../../stores/movies';
import { MOVIE_GENRES } from '../../types/movie';
import type { CreateMoviePayload } from '../../types/movie';

const route = useRoute();
const router = useRouter();
const moviesStore = useMoviesStore();

const formRef = ref();
const snackbar = ref(false);
const snackbarText = ref('');
const formReady = ref(false);
const currentYear = new Date().getFullYear();

const isEdit = computed(() => !!route.params.id);
const movieId = computed(() =>
  route.params.id ? Number(route.params.id) : null,
);

const form = ref<CreateMoviePayload>({
  title: '',
  description: null,
  director: '',
  genre: '',
  releaseYear: currentYear,
  durationMinutes: 90,
  posterUrl: null,
});

// --- Validation rules ---
const required = (field: string) => [(v: string | number) => !!v || `${field} is required`];

const yearRules = [
  (v: number) => !!v || 'Year is required',
  (v: number) => (v >= 1888 && v <= currentYear + 5) || `Year must be between 1888 and ${currentYear + 5}`,
];

const durationRules = [
  (v: number) => !!v || 'Duration is required',
  (v: number) => (v > 0 && v <= 600) || 'Duration must be between 1 and 600 minutes',
];

const urlRules = [
  (v: string) =>
    !v || /^https?:\/\/.+/.test(v) || 'Must be a valid URL starting with http(s)://',
];

// --- Lifecycle ---
onMounted(async () => {
  if (isEdit.value && movieId.value) {
    await moviesStore.fetchMovie(movieId.value);
    const movie = moviesStore.currentMovie;
    if (movie) {
      form.value = {
        title: movie.title,
        description: movie.description,
        director: movie.director,
        genre: movie.genre,
        releaseYear: movie.releaseYear,
        durationMinutes: movie.durationMinutes,
        posterUrl: movie.posterUrl,
      };
    }
  }
  formReady.value = true;
});

onBeforeUnmount(() => {
  moviesStore.clearCurrentMovie();
});

// --- Submit ---
async function handleSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  try {
    if (isEdit.value && movieId.value) {
      await moviesStore.updateMovie(movieId.value, form.value);
      snackbarText.value = 'Movie updated successfully!';
    } else {
      await moviesStore.createMovie(form.value);
      snackbarText.value = 'Movie created successfully!';
    }
    snackbar.value = true;
    setTimeout(() => router.push('/admin/movies'), 1200);
  } catch {
    // Error is shown via moviesStore.error
  }
}
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-lg;

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 2px 0;
  }

  .page-subtitle {
    color: rgba(0, 0, 0, 0.45);
    margin: 0;
    font-size: 0.9rem;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: $spacing-xl * 2;
}

.section-title {
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: rgba(0, 0, 0, 0.5) !important;
  padding-bottom: 0 !important;
}

.poster-preview {
  .poster-img {
    width: 100%;
    max-height: 300px;
  }
}

.poster-placeholder,
.poster-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  height: 160px;
  border: 2px dashed rgba(0, 0, 0, 0.12);
  border-radius: $border-radius-lg;
  color: rgba(0, 0, 0, 0.35);
  font-size: 0.85rem;
}
</style>
