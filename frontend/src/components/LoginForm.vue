<template>
  <div class="login-form">
    <h2>Login</h2>
    <form class="form" @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="username">Username/Email:</label>
        <input
          type="text"
          id="username"
          name="username"
          v-model="form.username"
          placeholder="Enter your username or email"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          v-model="form.password"
          placeholder="Enter your password"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading">Signing in…</span> <span v-else>Login</span>Login
      </button>
    </form>

    <p class="form-footer">
      Don't have an account? <a href="/register">Register here</a>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({ username: "", password: "" });
const loading = ref(false);
const error = ref("");

async function onSubmit() {
  error.value = "";
  try {
    loading.value = true;
    await auth.login({
      usernameOrEmail: form.username,
      password: form.password,
    });
    router.push("/sessions");
  } catch {
    error.value = "Invalid credentials.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-form h2 {
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
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
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
