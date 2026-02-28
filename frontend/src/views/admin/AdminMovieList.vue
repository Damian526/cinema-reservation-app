<template>
  <div class="movie-list-page">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Movies</h2>
        <p class="page-subtitle">{{ moviesStore.total }} movies total</p>
      </div>
      <v-btn
        color="primary"
        :prepend-icon="mdiPlus"
        @click="router.push('/admin/movies/new')"
      >
        Add Movie
      </v-btn>
    </div>

    <!-- Filters -->
    <v-card class="filters-card mb-4" elevation="0" border>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="search"
              label="Search by title..."
              :prepend-inner-icon="mdiMagnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="genreFilter"
              :items="['All', ...MOVIE_GENRES]"
              label="Genre"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              variant="outlined"
              @click="resetFilters"
              block
              density="compact"
              height="40"
            >
              Reset
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Error -->
    <v-alert
      v-if="moviesStore.error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
    >
      {{ moviesStore.error }}
    </v-alert>

    <!-- Table -->
    <v-card elevation="0" border>
      <v-data-table-server
        :headers="headers"
        :items="moviesStore.movies"
        :items-length="moviesStore.total"
        :loading="moviesStore.isLoading"
        :items-per-page="itemsPerPage"
        :page="page"
        @update:options="onTableOptions"
        item-value="id"
      >
        <!-- Poster -->
        <template #item.posterUrl="{ item }">
          <v-avatar size="40" rounded="sm" class="my-1">
            <v-img v-if="item.posterUrl" :src="item.posterUrl" cover />
            <v-icon v-else :icon="mdiFilm" />
          </v-avatar>
        </template>

        <!-- Title + director -->
        <template #item.title="{ item }">
          <div class="title-cell">
            <span class="movie-title">{{ item.title }}</span>
            <span class="movie-director">{{ item.director }}</span>
          </div>
        </template>

        <!-- Duration -->
        <template #item.durationMinutes="{ item }">
          {{ item.durationMinutes }} min
        </template>

        <!-- Release year as chip -->
        <template #item.releaseYear="{ item }">
          <v-chip size="small" variant="tonal">{{ item.releaseYear }}</v-chip>
        </template>

        <!-- Genre as chip -->
        <template #item.genre="{ item }">
          <v-chip size="small" color="primary" variant="tonal">{{ item.genre }}</v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="actions-cell">
            <v-btn
              :icon="mdiPencil"
              size="small"
              variant="text"
              color="primary"
              @click="router.push(`/admin/movies/${item.id}/edit`)"
            />
            <v-btn
              :icon="mdiDelete"
              size="small"
              variant="text"
              color="error"
              @click="openDeleteDialog(item)"
            />
          </div>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <div class="empty-table">
            <v-icon :icon="mdiFilm" size="48" color="grey-lighten-1" class="mb-2" />
            <p>No movies found</p>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          <v-icon :icon="mdiDelete" color="error" start />
          Delete Movie
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ movieToDelete?.title }}</strong>? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="moviesStore.isLoading"
            @click="confirmDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { watchDebounced } from '@vueuse/core';
import {
  mdiPlus,
  mdiMagnify,
  mdiPencil,
  mdiDelete,
  mdiFilm,
} from '@mdi/js';
import { useMoviesStore } from '../../stores/movies';
import { MOVIE_GENRES } from '../../types/movie';
import type { Movie } from '../../types/movie';

const router = useRouter();
const moviesStore = useMoviesStore();

const search = ref('');
const genreFilter = ref('All');
const page = ref(1);
const itemsPerPage = ref(15);

const deleteDialog = ref(false);
const movieToDelete = ref<Movie | null>(null);

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');

const headers = [
  { title: '', key: 'posterUrl', sortable: false, width: '60px' },
  { title: 'Title', key: 'title', sortable: true },
  { title: 'Genre', key: 'genre', sortable: true },
  { title: 'Year', key: 'releaseYear', sortable: true },
  { title: 'Duration', key: 'durationMinutes', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
];

async function loadMovies() {
  await moviesStore.fetchMovies({
    search: search.value || undefined,
    genre: genreFilter.value === 'All' ? undefined : genreFilter.value,
    page: page.value,
    limit: itemsPerPage.value,
  });
}

onMounted(loadMovies);

// Debounce search input
watchDebounced(search, () => { page.value = 1; loadMovies(); }, { debounce: 400 });
watch(genreFilter, () => { page.value = 1; loadMovies(); });

function onTableOptions(opts: { page: number; itemsPerPage: number }) {
  page.value = opts.page;
  itemsPerPage.value = opts.itemsPerPage;
  loadMovies();
}

function resetFilters() {
  search.value = '';
  genreFilter.value = 'All';
  page.value = 1;
  loadMovies();
}

function openDeleteDialog(movie: Movie) {
  movieToDelete.value = movie;
  deleteDialog.value = true;
}

async function confirmDelete() {
  if (!movieToDelete.value) return;
  try {
    await moviesStore.deleteMovie(movieToDelete.value.id);
    deleteDialog.value = false;
    snackbarText.value = `"${movieToDelete.value.title}" deleted successfully`;
    snackbarColor.value = 'success';
    snackbar.value = true;
    movieToDelete.value = null;
  } catch {
    snackbarText.value = 'Failed to delete movie';
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: $spacing-lg;

  .page-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px 0;
  }

  .page-subtitle {
    color: rgba(0, 0, 0, 0.45);
    margin: 0;
    font-size: 0.9rem;
  }
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;

  .movie-title {
    font-weight: 600;
    color: #1a1a2e;
  }

  .movie-director {
    font-size: 0.8rem;
    color: rgba(0, 0, 0, 0.5);
  }
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}

.empty-table {
  text-align: center;
  padding: $spacing-xl * 2;
  color: rgba(0, 0, 0, 0.4);
}
</style>
