<template>
  <div class="register-form">
    <h2>Register</h2>
    <form class="form">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          type="text"
          id="username"
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
          name="confirmPassword"
          placeholder="Confirm your password"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary">Register</button>
    </form>

    <p class="form-footer">
      Already have an account? <a href="/login">Login here</a>
    </p>
  </div>
</template>

<script>
export default {
  name: "RegisterForm",
};
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
