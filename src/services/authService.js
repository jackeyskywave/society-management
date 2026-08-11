// Centralized Authentication Service
// Designed for static local credential checking now, isolatable for future POST /api/login integration.

const AUTH_KEY = 'admin_authenticated';

// Centralized static credentials (can easily be replaced or pointed to an API endpoint later)
export const STATIC_CREDENTIALS = {
  username: 'admin',
  password: '1234'
};

export const authService = {
  /**
   * Authenticates user against static credentials.
   * Resolves asynchronously to simulate API behavior and support easy future API replacement.
   */
  async login(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          username === STATIC_CREDENTIALS.username &&
          password === STATIC_CREDENTIALS.password
        ) {
          localStorage.setItem(AUTH_KEY, 'true');
          resolve({ success: true, user: { username } });
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 400); // realistic slight delay
    });
  },

  /**
   * Logs out the user and clears authentication state.
   */
  logout() {
    localStorage.removeItem(AUTH_KEY);
  },

  /**
   * Checks if the user is currently authenticated.
   */
  isAuthenticated() {
    return localStorage.getItem(AUTH_KEY) === 'true';
  }
};
