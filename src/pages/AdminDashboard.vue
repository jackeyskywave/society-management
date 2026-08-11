<template>
  <AdminLayout>
    <div class="dashboard-content">
      <!-- Stats Cards Row -->
      <div class="stats-grid">
        <div class="stat-card" v-for="(stat, index) in stats" :key="index">
          <div class="stat-header">
            <span class="stat-title">{{ stat.title }}</span>
            <div class="stat-icon-bg" :class="stat.variant">
              <component :is="stat.icon" />
            </div>
          </div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-trend" :class="stat.trendType">
            <span>{{ stat.trend }}</span> vs last month
          </div>
        </div>
      </div>

      <!-- Quick Action & Activity Grid -->
      <div class="content-grid">
        <!-- Quick Action Area -->
        <div class="card quick-actions-card">
          <h3>Quick Actions</h3>
          <p class="section-desc">Common dashboard controls & operations</p>

          <div class="action-buttons">
            <button class="action-btn" @click="triggerAction('Generate Report')">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Export Summary</span>
            </button>

            <button class="action-btn" @click="triggerAction('System Diagnostics')">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <span>Run Health Check</span>
            </button>

            <button class="action-btn" @click="triggerAction('Sync Cache')">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>Refresh Metrics</span>
            </button>
          </div>

          <div v-if="actionNotice" class="action-notice">
            {{ actionNotice }}
          </div>
        </div>

        <!-- Recent Activity Area -->
        <div class="card activity-card">
          <h3>Recent System Logs</h3>
          <p class="section-desc">Audit trail of automated dashboard events</p>

          <div class="activity-list">
            <div class="activity-item" v-for="item in activities" :key="item.id">
              <div class="activity-dot" :class="item.type"></div>
              <div class="activity-details">
                <div class="activity-title">{{ item.message }}</div>
                <div class="activity-time">{{ item.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, h } from 'vue';
import AdminLayout from '../layouts/AdminLayout.vue';

const actionNotice = ref('');

const triggerAction = (actionName) => {
  actionNotice.value = `Action "${actionName}" executed successfully.`;
  setTimeout(() => {
    actionNotice.value = '';
  }, 3000);
};

// Inline Stat Icons
const UsersIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: '9', cy: '7', r: '4' }),
  h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
  h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
]);

const RevenueIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('line', { x1: '12', y1: '1', x2: '12', y2: '23' }),
  h('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
]);

const ServerIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('rect', { x: '2', y: '2', width: '20', height: '8', rx: '2', ry: '2' }),
  h('rect', { x: '2', y: '14', width: '20', height: '8', rx: '2', ry: '2' }),
  h('line', { x1: '6', y1: '6', x2: '6.01', y2: '6' }),
  h('line', { x1: '6', y1: '18', x2: '6.01', y2: '18' })
]);

const UptimeIcon = () => h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('polyline', { points: '22 12 18 12 15 21 9 3 6 12 2 12' })
]);

const stats = ref([
  { title: 'Total Visits', value: '128,430', trend: '+12.5%', trendType: 'positive', variant: 'primary', icon: UsersIcon },
  { title: 'Monthly Revenue', value: '$45,210', trend: '+8.2%', trendType: 'positive', variant: 'success', icon: RevenueIcon },
  { title: 'Server Load', value: '24.8%', trend: '-3.1%', trendType: 'positive', variant: 'warning', icon: ServerIcon },
  { title: 'System Uptime', value: '99.98%', trend: 'Stable', trendType: 'neutral', variant: 'info', icon: UptimeIcon }
]);

const activities = ref([
  { id: 1, message: 'Admin authentication session started', time: 'Just now', type: 'info' },
  { id: 2, message: 'Automated database backup completed', time: '14 minutes ago', type: 'success' },
  { id: 3, message: 'Security rule check executed clean', time: '1 hour ago', type: 'info' },
  { id: 4, message: 'SSL certificates renewed successfully', time: '3 hours ago', type: 'success' }
]);
</script>

<style scoped>
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.stat-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.stat-title {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

.stat-icon-bg {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-bg.primary { background: rgba(99, 102, 241, 0.15); color: var(--primary); }
.stat-icon-bg.success { background: rgba(16, 185, 129, 0.15); color: var(--success); }
.stat-icon-bg.warning { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
.stat-icon-bg.info { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.35rem;
}

.stat-trend {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-trend.positive span {
  color: var(--success);
  font-weight: 600;
}

.stat-trend.neutral span {
  color: var(--text-muted);
  font-weight: 600;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}

.card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
}

.section-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 500;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.action-btn:hover {
  border-color: var(--primary);
  background-color: var(--primary-light);
  color: var(--primary);
}

.action-notice {
  margin-top: 1rem;
  padding: 0.6rem 0.85rem;
  background-color: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--success);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.4rem;
  flex-shrink: 0;
}

.activity-dot.info { background-color: var(--primary); }
.activity-dot.success { background-color: var(--success); }

.activity-title {
  font-size: 0.9rem;
  color: var(--text-main);
  font-weight: 500;
}

.activity-time {
  font-size: 0.78rem;
  color: var(--text-muted);
}
</style>
