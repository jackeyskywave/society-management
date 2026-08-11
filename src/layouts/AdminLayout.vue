<template>
  <div class="admin-layout">
    <!-- Overlay for mobile navigation -->
    <div 
      v-if="isMobileMenuOpen" 
      class="sidebar-backdrop" 
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Sidebar component -->
    <aside class="sidebar" :class="{ 'open': isMobileMenuOpen }">
      <div class="sidebar-header">
        <div class="logo-box">
          <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span class="logo-text">AdminPanel</span>
        </div>
        <button class="mobile-close-btn" @click="isMobileMenuOpen = false" aria-label="Close sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- Sidebar Navigation: strictly Dashboard and Logout -->
        <router-link to="/admin" class="nav-item active" @click="isMobileMenuOpen = false">
          <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="9"></rect>
            <rect x="14" y="3" width="7" height="5"></rect>
            <rect x="14" y="12" width="7" height="9"></rect>
            <rect x="3" y="16" width="7" height="5"></rect>
          </svg>
          <span>Dashboard</span>
        </router-link>

        <button class="nav-item logout-btn" @click="handleLogout">
          <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </nav>
    </aside>

    <!-- Main Content Container -->
    <div class="main-wrapper">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <button class="hamburger-btn" @click="isMobileMenuOpen = !isMobileMenuOpen" aria-label="Toggle navigation">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 class="page-title">Overview</h1>
        </div>

        <div class="header-right">
          <div class="admin-badge">
            <span class="status-indicator"></span>
            <span class="admin-name">Administrator</span>
          </div>
        </div>
      </header>

      <!-- Dashboard View Content Slot -->
      <main class="content-area">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/authService';

const router = useRouter();
const isMobileMenuOpen = ref(false);

const handleLogout = () => {
  authService.logout();
  router.push('/login');
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
  position: relative;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  transition: transform var(--transition-normal);
}

.sidebar-header {
  height: 64px;
  padding: 0 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.logo-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: var(--primary);
}

.logo-text {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-main);
}

.mobile-close-btn {
  display: none;
  color: var(--text-muted);
}

.sidebar-nav {
  padding: 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 500;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  text-align: left;
  width: 100%;
}

.nav-item:hover, .nav-item.active {
  background-color: var(--primary-light);
  color: var(--primary);
}

.logout-btn {
  margin-top: auto;
  color: var(--text-muted);
}

.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.nav-icon {
  flex-shrink: 0;
}

/* Main Area */
.main-wrapper {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: 64px;
  background-color: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 90;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hamburger-btn {
  display: none;
  color: var(--text-muted);
  padding: 0.25rem;
}

.page-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-main);
}

.admin-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--success);
}

.content-area {
  padding: 1.5rem;
  flex: 1;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .mobile-close-btn {
    display: flex;
  }

  .main-wrapper {
    margin-left: 0;
  }

  .hamburger-btn {
    display: flex;
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    z-index: 99;
  }
}
</style>
