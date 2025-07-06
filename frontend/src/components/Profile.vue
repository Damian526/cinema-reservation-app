<template>
  <div class="profile-container">
    <div class="profile-card">
      <h2>Profile Settings</h2>
      
      <div class="profile-sections">
        <!-- Profile Information Section -->
        <div class="profile-section">
          <h3>Profile Information</h3>
          
          <!-- Current Info Display -->
          <div class="current-info">
            <h4>Current Information:</h4>
            <p><strong>Username:</strong> {{ user?.username || 'N/A' }}</p>
            <p><strong>Email:</strong> {{ user?.email || 'N/A' }}</p>
          </div>
          
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label for="username">New Username:</label>
              <input
                id="username"
                v-model="profileForm.username"
                type="text"
                placeholder="Enter new username"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="email">New Email:</label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                placeholder="Enter new email"
                required
              />
            </div>
            
            <button type="submit" class="update-btn" :disabled="profileLoading">
              {{ profileLoading ? 'Updating...' : 'Update Profile' }}
            </button>
          </form>
        </div>

        <!-- Change Password Section -->
        <div class="profile-section">
          <h3>Change Password</h3>
          <form @submit.prevent="changePassword" class="profile-form">
            <div class="form-group">
              <label for="currentPassword">Current Password:</label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="newPassword">New Password:</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="6"
              />
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password:</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                minlength="6"
              />
            </div>
            
            <button type="submit" class="update-btn" :disabled="passwordLoading">
              {{ passwordLoading ? 'Changing...' : 'Change Password' }}
            </button>
          </form>
        </div>

        <!-- Account Information -->
        <div class="profile-section">
          <h3>Account Information</h3>
          <div class="account-info">
            <p><strong>User ID:</strong> {{ user?.id }}</p>
            <p><strong>Role:</strong> {{ user?.role }}</p>
            <p><strong>Member Since:</strong> {{ formatDate(user?.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// Reactive data
const profileForm = ref({
  username: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileLoading = ref(false)
const passwordLoading = ref(false)
const message = ref('')
const messageType = ref('') // 'success' or 'error'

// Computed properties
const user = computed(() => authStore.user)

// Methods
const showMessage = (text, type = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 5000)
}

const updateProfile = async () => {
  try {
    profileLoading.value = true
    
    // Prepare the update data
    const updates = {}
    if (profileForm.value.username && profileForm.value.username.trim()) {
      updates.username = profileForm.value.username.trim()
    }
    if (profileForm.value.email && profileForm.value.email.trim()) {
      updates.email = profileForm.value.email.trim()
    }
    
    if (Object.keys(updates).length === 0) {
      showMessage('Please enter new username or email', 'error')
      return
    }
    
    await authStore.updateProfile(updates)
    showMessage('Profile updated successfully!')
    
    // Clear the form after successful update
    profileForm.value.username = ''
    profileForm.value.email = ''
    
  } catch (error) {
    console.error('Profile update error:', error)
    showMessage(error.response?.data?.message || 'Failed to update profile', 'error')
  } finally {
    profileLoading.value = false
  }
}

const changePassword = async () => {
  try {
    // Validate passwords match
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      showMessage('New passwords do not match', 'error')
      return
    }
    
    // Validate password length
    if (passwordForm.value.newPassword.length < 6) {
      showMessage('New password must be at least 6 characters long', 'error')
      return
    }
    
    passwordLoading.value = true
    
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    showMessage('Password changed successfully!')
    
    // Reset password form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
  } catch (error) {
    console.error('Password change error:', error)
    showMessage(error.response?.data?.message || 'Failed to change password', 'error')
  } finally {
    passwordLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  try {
    // Fetch latest user data
    await authStore.fetchProfile()
    
    // Initialize form as empty (user enters new values)
    profileForm.value.username = ''
    profileForm.value.email = ''
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    showMessage('Failed to load profile data', 'error')
  }
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.profile-card {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
}

.profile-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 2rem;
  font-weight: 600;
}

.profile-sections {
  display: grid;
  gap: 30px;
}

.profile-section {
  border: 1px solid #e1e5e9;
  border-radius: 10px;
  padding: 25px;
  background: #f8f9fa;
}

.profile-section h3 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 1.3rem;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.current-info {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.current-info h4 {
  margin: 0 0 10px 0;
  color: #1976d2;
  font-size: 1.1rem;
}

.current-info p {
  margin: 5px 0;
  color: #333;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #495057;
}

.form-group input {
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.update-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  align-self: flex-start;
}

.update-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.account-info p {
  margin: 0;
  padding: 8px 0;
  color: #495057;
  border-bottom: 1px solid #e1e5e9;
}

.account-info p:last-child {
  border-bottom: none;
}

.message {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
  
  .profile-card {
    padding: 20px;
  }
  
  .profile-card h2 {
    font-size: 1.5rem;
  }
  
  .profile-section {
    padding: 15px;
  }
}
</style>
