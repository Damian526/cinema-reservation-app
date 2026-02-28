<template>
  <div class="dashboard-page">
    <h2 class="page-title">Dashboard</h2>
    <p class="page-subtitle">Overview of your cinema</p>

    <!-- Stat cards -->
    <v-row class="stats-grid mb-6">
      <v-col
        v-for="stat in stats"
        :key="stat.label"
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card elevation="0" border class="stat-card">
          <v-card-text>
            <div class="stat-icon" :style="{ background: stat.bgColor }">
              <v-icon :icon="stat.icon" :color="stat.color" size="22" />
            </div>
            <div class="stat-value">
              <template v-if="isLoading">
                <v-skeleton-loader type="text" width="80" />
              </template>
              <template v-else>{{ stat.value }}</template>
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <!-- Quick actions -->
    <v-card elevation="0" border>
      <v-card-title class="section-title pa-4 pb-0">Quick Actions</v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6" md="4">
            <v-btn
              variant="tonal"
              color="primary"
              block
              height="56"
              :prepend-icon="mdiPlus"
              @click="router.push('/admin/movies/new')"
            >
              Add Movie
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-btn
              variant="tonal"
              color="secondary"
              block
              height="56"
              :prepend-icon="mdiFilm"
              @click="router.push('/admin/movies')"
            >
              View All Movies
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-btn
              variant="tonal"
              block
              height="56"
              :prepend-icon="mdiCalendar"
              @click="router.push('/sessions')"
            >
              View Sessions
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  mdiFilm,
  mdiCalendar,
  mdiTicket,
  mdiCurrencyUsd,
  mdiPlus,
} from '@mdi/js';
import api from '../../utils/axios';

const router = useRouter();

interface DashboardData {
  moviesCount: number;
  sessionsCount: number;
  reservationsCount: number;
}

const isLoading = ref(true);
const error = ref('');
const data = ref<DashboardData>({
  moviesCount: 0,
  sessionsCount: 0,
  reservationsCount: 0,
});

const stats = computed(() => [
  {
    label: 'Total Movies',
    value: data.value.moviesCount,
    icon: mdiFilm,
    color: 'primary',
    bgColor: 'rgba(25,118,210,0.1)',
  },
  {
    label: 'Sessions',
    value: data.value.sessionsCount,
    icon: mdiCalendar,
    color: 'success',
    bgColor: 'rgba(76,175,80,0.1)',
  },
  {
    label: 'Reservations',
    value: data.value.reservationsCount,
    icon: mdiTicket,
    color: 'warning',
    bgColor: 'rgba(255,152,0,0.1)',
  },
  {
    label: 'Revenue',
    value: '—',
    icon: mdiCurrencyUsd,
    color: 'info',
    bgColor: 'rgba(33,150,243,0.1)',
  },
]);

onMounted(async () => {
  try {
    const [moviesRes, sessionsRes, reservationsRes] = await Promise.all([
      api.get('/admin/movies', { params: { page: 1, limit: 1 } }),
      api.get('/sessions'),
      api.get('/reservations'),
    ]);
    data.value = {
      moviesCount: moviesRes.data.total ?? 0,
      sessionsCount: Array.isArray(sessionsRes.data)
        ? sessionsRes.data.length
        : (sessionsRes.data.total ?? 0),
      reservationsCount: Array.isArray(reservationsRes.data)
        ? reservationsRes.data.length
        : (reservationsRes.data.total ?? 0),
    };
  } catch (e) {
    error.value = 'Failed to load dashboard data';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: rgba(0, 0, 0, 0.45);
  margin: 0 0 $spacing-lg 0;
  font-size: 0.9rem;
}

.stat-card {
  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: $border-radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-md;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.2;
    margin-bottom: 4px;
    min-height: 2rem;
  }

  .stat-label {
    font-size: 0.85rem;
    color: rgba(0, 0, 0, 0.5);
    font-weight: 500;
  }
}

.section-title {
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: rgba(0, 0, 0, 0.5);
}
</style>
