<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Logo / Header -->
        <div class="login-header">
          <div class="logo-icon">
            <v-icon :icon="mdiShieldLock" size="48" color="primary" />
          </div>
          <h1 class="login-title">Admin Access</h1>
          <p class="login-subtitle">Restricted area</p>
        </div>

        <!-- Form -->
        <v-form ref="formRef" @submit.prevent="handleSubmit" class="login-form">
          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            variant="outlined"
            :rules="emailRules"
            :disabled="isLoading"
            autocomplete="email"
            class="mb-3"
          />

          <v-text-field
            v-model="form.password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            :rules="passwordRules"
            :disabled="isLoading"
            autocomplete="current-password"
            :append-inner-icon="showPassword ? mdiEyeOff : mdiEye"
            @click:append-inner="showPassword = !showPassword"
            class="mb-4"
          />

          <v-alert
            v-if="errorMsg"
            type="error"
            variant="tonal"
            class="mb-4"
            density="compact"
          >
            {{ errorMsg }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            size="large"
            block
            :loading="isLoading"
            class="login-btn"
          >
            <v-icon :icon="mdiLogin" start />
            Sign In
          </v-btn>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { mdiShieldLock, mdiEye, mdiEyeOff, mdiLogin } from '@mdi/js';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const formRef = ref();
const isLoading = ref(false);
const showPassword = ref(false);
const errorMsg = ref('');

const form = ref({
  email: '',
  password: '',
});

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Enter a valid email',
];

const passwordRules = [(v: string) => !!v || 'Password is required'];

async function handleSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  isLoading.value = true;
  errorMsg.value = '';

  try {
    await authStore.adminLogin(form.value);
    await router.push('/admin');
  } catch {
    errorMsg.value = 'Invalid credentials or insufficient permissions.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1c2128 100%);
  padding: $spacing-lg;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: $border-radius-xl;
  padding: $spacing-xl * 1.5;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
}

.login-header {
  text-align: center;
  margin-bottom: $spacing-xl;

  .logo-icon {
    margin-bottom: $spacing-md;
    filter: drop-shadow(0 4px 16px rgba(25, 118, 210, 0.5));
  }

  .login-title {
    color: #ffffff;
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0 0 $spacing-xs 0;
  }

  .login-subtitle {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}

.login-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  border-radius: $border-radius-md;
}
</style>
