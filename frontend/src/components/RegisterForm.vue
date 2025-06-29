<template>
  <div class="register-form">
    <h2>Register</h2>
    <form class="form" @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          type="text"
          id="username"
          v-model="form.username"
          name="username"
          placeholder="Choose a username"
          required
        />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          name="email"
          placeholder="Enter your email"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          v-moodel="form.password"
          name="password"
          placeholder="Create a password"
          required
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          v.model="form.confirmPassword"
          name="confirmPassword"
          placeholder="Confirm your password"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading">Registering...</span>
        <span v-else>Register</span>
      </button>
    </form>
    <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>
    <!-- ✨ -->
    <p v-if="success" class="text-green-600 mt-2">{{ success }}</p>
    <p class="form-footer">
      Already have an account? <a href="/login">Login here</a>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../utils/axios';

const router = useRouter();

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const loading = ref(false);
const error   = ref('');
const success = ref('');

async function onSubmit() {
  error.value = '';
  success.value = '';

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match.';
    return;
  }

  try {
    loading.value = true;
    await api.post('/auth/register', {
      username: form.username,
      email: form.email,
      password: form.password,
    });

    success.value = 'Account created! Redirecting to login…';
    setTimeout(() => router.push('/login'), 1200);
  } catch (e) {
    if (e.response?.data?.message) {
      error.value = Array.isArray(e.response.data.message)
        ? e.response.data.message.join(', ')
        : e.response.data.message;
    } else {
      error.value = 'Something went wrong. Please try again.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.register-form h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #28a745;
  color: white;
}

.btn-primary:hover {
  background-color: #218838;
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.form-footer a {
  color: #007bff;
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
