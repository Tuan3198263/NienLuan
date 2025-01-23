<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <h1>Dashboard</h1>
    </header>

    <!-- Content -->
    <div class="dashboard-content">
      <!-- Statistics Section -->
      <div class="stats-section">
        <div class="stat-card">
          <h3>Total Users</h3>
          <p>1,245</p>
        </div>
        <div class="stat-card">
          <h3>Total Posts</h3>
          <p>512</p>
        </div>
        <div class="stat-card">
          <h3>Active Sessions</h3>
          <p>120</p>
        </div>
        <div class="stat-card">
          <h3>Server Uptime</h3>
          <p>99.9%</p>
        </div>
      </div>

      <!-- Tables Section -->
      <div class="tables-section">
        <!-- Recent Users Table -->
        <div class="table-card">
          <h2>Recent Users</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- System Logs Table -->
        <div class="table-card">
          <h2>System Logs</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Event</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id">
                <td>{{ log.id }}</td>
                <td>{{ log.event }}</td>
                <td>{{ log.status }}</td>
                <td>{{ log.timestamp }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Mock data
const users = ref([
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: 3, name: "Michael Lee", email: "michael@example.com", role: "Editor" },
]);

const logs = ref([
  { id: 1, event: "Login", status: "Success", timestamp: "2025-01-23 10:00" },
  {
    id: 2,
    event: "Data Backup",
    status: "Success",
    timestamp: "2025-01-22 18:45",
  },
  {
    id: 3,
    event: "Password Change",
    status: "Failure",
    timestamp: "2025-01-22 15:30",
  },
]);
</script>

<style scoped>
.dashboard {
  width: 75vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f4f4;
  font-family: Arial, sans-serif;
  color: #333;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

.stats-section,
.tables-section {
  width: 100%;
}

.dashboard-header {
  padding: 20px;
  background: #2c3e50;
  color: white;
  text-align: center;
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
}

/* Statistics Section */
.stats-section {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
.stat-card {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.stat-card h3 {
  margin-bottom: 10px;
  color: #555;
}

/* Tables Section */
.tables-section {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
.table-card {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.table-card h2 {
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
table th,
table td {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
table th {
  background: #f9f9f9;
}
table tr:hover {
  background: #f1f1f1;
}
</style>
