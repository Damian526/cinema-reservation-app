<template>
  <div class="loading-states">
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading sessions...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="$emit('retry')">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="isEmpty" class="empty-state">
      <p>No sessions available</p>
      <button class="btn btn-primary" @click="$emit('addSession')">Add First Session</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SessionStates",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    isEmpty: {
      type: Boolean,
      default: false
    }
  },
  emits: ['retry', 'addSession']
};
</script>

<style scoped>
.loading, .error, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error {
  color: #dc3545;
}

.error p {
  margin-bottom: 1rem;
}

.empty-state {
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
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
</style>
