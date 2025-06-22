<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <div class="header-actions">
        <button class="btn btn-primary">Add New Session</button>
        <button class="btn btn-secondary">Export Data</button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🎬</div>
        <div class="stat-content">
          <h3>12</h3>
          <p>Active Sessions</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎫</div>
        <div class="stat-content">
          <h3>245</h3>
          <p>Total Reservations</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>89</h3>
          <p>Registered Users</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>$2,940</h3>
          <p>Today's Revenue</p>
        </div>
      </div>
    </div>

    <!-- Sessions Management -->
    <div class="management-section">
      <div class="section-header">
        <h2>Session Management</h2>
        <div class="filters">
          <select class="filter-select">
            <option>All Sessions</option>
            <option>Today</option>
            <option>This Week</option>
          </select>
          <input
            type="search"
            placeholder="Search sessions..."
            class="search-input"
          />
        </div>
      </div>

      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>Movie</th>
              <th>Date & Time</th>
              <th>Seats</th>
              <th>Revenue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="movie-cell">
                  <strong>Matrix</strong>
                  <small>Screen 1</small>
                </div>
              </td>
              <td>Jan 21, 2025<br /><small>19:30</small></td>
              <td>
                <div class="seat-info">
                  <span class="available">85</span> / 100
                  <div class="seat-bar">
                    <div class="seat-fill" style="width: 15%"></div>
                  </div>
                </div>
              </td>
              <td>$180.00</td>
              <td><span class="status-badge active">Active</span></td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="Edit">✏️</button>
                  <button class="btn-icon" title="View">👁️</button>
                  <button class="btn-icon" title="Delete">🗑️</button>
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <div class="movie-cell">
                  <strong>Inception</strong>
                  <small>Screen 2</small>
                </div>
              </td>
              <td>Jan 21, 2025<br /><small>21:00</small></td>
              <td>
                <div class="seat-info">
                  <span class="available">72</span> / 80
                  <div class="seat-bar">
                    <div class="seat-fill" style="width: 10%"></div>
                  </div>
                </div>
              </td>
              <td>$96.00</td>
              <td><span class="status-badge active">Active</span></td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="Edit">✏️</button>
                  <button class="btn-icon" title="View">👁️</button>
                  <button class="btn-icon" title="Delete">🗑️</button>
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <div class="movie-cell">
                  <strong>Interstellar</strong>
                  <small>Screen 1</small>
                </div>
              </td>
              <td>Jan 22, 2025<br /><small>16:45</small></td>
              <td>
                <div class="seat-info">
                  <span class="available">120</span> / 120
                  <div class="seat-bar">
                    <div class="seat-fill" style="width: 0%"></div>
                  </div>
                </div>
              </td>
              <td>$0.00</td>
              <td><span class="status-badge upcoming">Upcoming</span></td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="Edit">✏️</button>
                  <button class="btn-icon" title="View">👁️</button>
                  <button class="btn-icon" title="Delete">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reservations Management -->
    <div class="tab-content" id="reservations">
      <div class="section-header">
        <h2>Reservation Management</h2>
        <div class="filters">
          <select class="filter-select">
            <option>All Reservations</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>User</th>
              <th>Movie</th>
              <th>Seats</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#RSV001</td>
              <td>John Doe<br /><small>john@example.com</small></td>
              <td>Matrix<br /><small>Today 19:30</small></td>
              <td>B2, B4</td>
              <td>$24.00</td>
              <td><span class="status-badge active">Active</span></td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="View">👁️</button>
                  <button class="btn-icon" title="Cancel">❌</button>
                </div>
              </td>
            </tr>

            <tr>
              <td>#RSV002</td>
              <td>Jane Smith<br /><small>jane@example.com</small></td>
              <td>Inception<br /><small>Tomorrow 21:00</small></td>
              <td>C5, C6, C7</td>
              <td>$36.00</td>
              <td><span class="status-badge upcoming">Upcoming</span></td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="View">👁️</button>
                  <button class="btn-icon" title="Cancel">❌</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Users Management -->
    <div class="tab-content" id="users">
      <div class="section-header">
        <h2>User Management</h2>
        <div class="filters">
          <input
            type="search"
            placeholder="Search users..."
            class="search-input"
          />
        </div>
      </div>

      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Reservations</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John Doe</td>
              <td>john@example.com</td>
              <td><span class="role-badge user">User</span></td>
              <td>3</td>
              <td>Jan 15, 2025</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="View">👁️</button>
                  <button class="btn-icon" title="Edit">✏️</button>
                  <button class="btn-icon" title="Ban">🚫</button>
                </div>
              </td>
            </tr>

            <tr>
              <td>Jane Smith</td>
              <td>jane@example.com</td>
              <td><span class="role-badge admin">Admin</span></td>
              <td>1</td>
              <td>Jan 10, 2025</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="View">👁️</button>
                  <button class="btn-icon" title="Edit">✏️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminDashboard",
};
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
  background: #f8f9fa;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  color: #333;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.management-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  color: #333;
  margin: 0;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select,
.search-input {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input {
  min-width: 200px;
}

.data-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e9ecef;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: top;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.movie-cell strong {
  display: block;
  color: #333;
}

.movie-cell small {
  color: #666;
}

.seat-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.seat-info .available {
  font-weight: bold;
  color: #28a745;
}

.seat-bar {
  width: 60px;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.seat-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.upcoming {
  background: #d1ecf1;
  color: #0c5460;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.role-badge.user {
  background: #e2e3e5;
  color: #383d41;
}

.role-badge.admin {
  background: #f8d7da;
  color: #721c24;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
  font-size: 1rem;
}

.btn-icon:hover {
  background: #f8f9fa;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
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
  .admin-dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filters {
    justify-content: center;
  }

  .data-table {
    overflow-x: auto;
  }

  .data-table table {
    min-width: 600px;
  }
}
</style>
