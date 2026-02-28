<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <v-icon :icon="mdiMovieOpen" color="primary" size="28" />
        <span v-if="!sidebarCollapsed" class="sidebar-title">Admin Panel</span>
        <v-btn
          :icon="sidebarCollapsed ? mdiChevronRight : mdiChevronLeft"
          variant="text"
          size="small"
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="collapse-btn"
        />
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
        >
          <v-icon :icon="item.icon" size="20" />
          <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          <v-tooltip v-if="sidebarCollapsed" :text="item.label" location="end" />
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div v-if="!sidebarCollapsed" class="user-info">
          <v-icon :icon="mdiAccount" size="18" />
          <span class="user-name">{{ authStore.user?.username }}</span>
        </div>
        <v-btn
          :icon="mdiLogout"
          variant="text"
          size="small"
          color="error"
          @click="handleLogout"
          :title="sidebarCollapsed ? 'Logout' : undefined"
        />
      </div>
    </aside>

    <!-- Main content -->
    <main class="admin-main">
      <div class="admin-topbar">
        <div class="breadcrumb">
          <span class="breadcrumb-item">Admin</span>
          <v-icon :icon="mdiChevronRight" size="16" class="breadcrumb-sep" />
          <span class="breadcrumb-current">{{ currentPageTitle }}</span>
        </div>
        <v-btn
          to="/sessions"
          variant="text"
          size="small"
          :prepend-icon="mdiOpenInNew"
        >
          View site
        </v-btn>
      </div>

      <div class="admin-content">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  mdiMovieOpen,
  mdiChevronLeft,
  mdiChevronRight,
  mdiViewDashboard,
  mdiFilm,
  mdiCalendarClock,
  mdiAccount,
  mdiLogout,
  mdiOpenInNew,
} from '@mdi/js';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const sidebarCollapsed = ref(false);

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: mdiViewDashboard, exact: true },
  { to: '/admin/movies', label: 'Movies', icon: mdiFilm },
  { to: '/admin/sessions', label: 'Sessions', icon: mdiCalendarClock },
];

const currentPageTitle = computed(() => {
  const path = route.path;
  if (path === '/admin') return 'Dashboard';
  if (path.includes('/admin/movies/new')) return 'Add Movie';
  if (path.includes('/admin/movies') && path.includes('/edit')) return 'Edit Movie';
  if (path.includes('/admin/movies')) return 'Movies';
  if (path.includes('/admin/sessions/new')) return 'Add Session';
  if (path.includes('/admin/sessions') && path.includes('/edit')) return 'Edit Session';
  if (path.includes('/admin/sessions')) return 'Sessions';
  return '';
});

async function handleLogout() {
  await authStore.logout();
  await router.push('/secret-admin');
}
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

$sidebar-width: 240px;
$sidebar-collapsed-width: 64px;
$topbar-height: 56px;

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f4f6f9;
}

.sidebar {
  width: $sidebar-width;
  min-height: 100vh;
  background: #1a1f2e;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;

  &.collapsed {
    width: $sidebar-collapsed-width;
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-md;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  height: $topbar-height;

  .sidebar-title {
    color: #fff;
    font-weight: 700;
    font-size: 1rem;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
  }

  .collapse-btn {
    color: rgba(255, 255, 255, 0.4);
    margin-left: auto;
  }
}

.sidebar-nav {
  flex: 1;
  padding: $spacing-md 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  border-radius: $border-radius-md;
  margin: 0 $spacing-sm;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.85);
  }

  &--active {
    background: rgba($cinema-primary, 0.15);
    color: lighten($cinema-primary, 20%) !important;
    border-left: 3px solid $cinema-primary;
    padding-left: calc(#{$spacing-md} - 3px);
  }

  .nav-label {
    overflow: hidden;
  }
}

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  .user-info {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex: 1;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    overflow: hidden;

    .user-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  height: $topbar-height;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-xl;
  position: sticky;
  top: 0;
  z-index: 10;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: 0.9rem;

  .breadcrumb-item {
    color: rgba(0, 0, 0, 0.4);
  }

  .breadcrumb-sep {
    color: rgba(0, 0, 0, 0.25);
  }

  .breadcrumb-current {
    color: rgba(0, 0, 0, 0.8);
    font-weight: 600;
  }
}

.admin-content {
  flex: 1;
  padding: $spacing-xl;
}
</style>
