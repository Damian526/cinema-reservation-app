<template>
  <div class="session-form">
    <div class="form-header">
      <h2>Create New Session</h2>
      <button class="btn btn-secondary">Cancel</button>
    </div>

    <form class="form">
      <div class="form-grid">
        <!-- Movie Information -->
        <div class="form-section">
          <h3>Movie Information</h3>
          
          <div class="form-group">
            <label for="movieTitle">Movie Title *</label>
            <input 
              type="text" 
              id="movieTitle" 
              name="movieTitle" 
              placeholder="Enter movie title"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="movieDescription">Description</label>
            <textarea 
              id="movieDescription" 
              name="movieDescription" 
              placeholder="Enter movie description"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="movieGenre">Genre</label>
            <select id="movieGenre" name="movieGenre">
              <option value="">Select genre</option>
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="horror">Horror</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="thriller">Thriller</option>
            </select>
          </div>
        </div>

        <!-- Session Details -->
        <div class="form-section">
          <h3>Session Details</h3>
          
          <div class="form-group">
            <label for="sessionDate">Date *</label>
            <input 
              type="date" 
              id="sessionDate" 
              name="sessionDate" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="sessionTime">Start Time *</label>
            <input 
              type="time" 
              id="sessionTime" 
              name="sessionTime" 
              required
            >
          </div>
          
          <div class="form-group">
            <label for="totalSeats">Total Seats *</label>
            <input 
              type="number" 
              id="totalSeats" 
              name="totalSeats" 
              placeholder="100"
              min="1"
              max="500"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="ticketPrice">Ticket Price *</label>
            <div class="input-group">
              <span class="input-prefix">$</span>
              <input 
                type="number" 
                id="ticketPrice" 
                name="ticketPrice" 
                placeholder="12.00"
                min="0"
                step="0.01"
                required
              >
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Create Session</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'SessionForm'
}
</script>

<style scoped>
.session-form {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.form-header h2 {
  color: #333;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.form-section h3 {
  color: #333;
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #007bff;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.input-group {
  display: flex;
  align-items: center;
}

.input-prefix {
  background: #e9ecef;
  border: 1px solid #ddd;
  border-right: none;
  padding: 0.75rem;
  border-radius: 4px 0 0 4px;
  font-weight: 600;
  color: #495057;
}

.input-group input {
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

@media (max-width: 768px) {
  .session-form {
    margin: 1rem;
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
