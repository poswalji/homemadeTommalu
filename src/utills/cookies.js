// Cookie utility functions
class CookieService {
  // Set cookie
  set(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const secure = process.env.NODE_ENV === 'production' ? ';secure' : '';
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${secure}`;
  }

  // Get cookie
  get(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Delete cookie
  delete(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }

  // Set auth data
  setAuthData(token, user, days = 7) {
    this.set('token', token, days);
    this.set('user', JSON.stringify(user), days);
  }

  // Clear auth data
  clearAuthData() {
    this.delete('token');
    this.delete('user');
    this.delete('guestId');
  }

  // Check if authenticated
  isAuthenticated() {
    return !!this.get('token');
  }

  // Get current user
  getCurrentUser() {
    const user = this.get('user');
    return user ? JSON.parse(user) : null;
  }

  // Get current token
  getCurrentToken() {
    return this.get('token');
  }
}

export const cookieService = new CookieService();