// Admin authentication utilities

export const getAdminCredentials = () => {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'zim1234'
  }
}

export const checkAdminAuth = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const isAuthenticated = localStorage.getItem('admin_authenticated')
  const loginTime = localStorage.getItem('admin_login_time')
  
  if (!isAuthenticated || !loginTime) return false
  
  // Check if login is still valid (24 hours)
  const loginDate = new Date(loginTime)
  const now = new Date()
  const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60)
  
  if (hoursDiff > 24) {
    // Session expired
    localStorage.removeItem('admin_authenticated')
    localStorage.removeItem('admin_login_time')
    return false
  }
  
  return true
}

export const logoutAdmin = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('admin_authenticated')
  localStorage.removeItem('admin_login_time')
}

export const requireAdminAuth = (): boolean => {
  const isAuthenticated = checkAdminAuth()
  
  if (!isAuthenticated && typeof window !== 'undefined') {
    window.location.href = '/admin/login'
    return false
  }
  
  return isAuthenticated
}
