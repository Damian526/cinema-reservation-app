// VueUse composables for the Cinema App
import { computed } from 'vue'
import { 
  useSessionStorage, 
  useDark, 
  useToggle,
  useBreakpoints,
  breakpointsTailwind,
  useEventListener,
  useClipboard,
  useDateFormat,
  useTimeAgo
} from '@vueuse/core'
import { useAuthStore } from '../stores/auth'

// Theme composable
export function useTheme() {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
  
  return {
    isDark,
    toggleDark
  }
}

// Responsive breakpoints
export function useResponsive() {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  
  const isMobile = breakpoints.smaller('md')
  const isTablet = breakpoints.between('md', 'lg')
  const isDesktop = breakpoints.greater('lg')
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoints
  }
}

// Auth composable — thin wrapper around the Pinia store
// Token is stored in an HttpOnly cookie, not accessible from JS
export function useAuth() {
  const authStore = useAuthStore()
  
  const isAuthenticated = computed(() => authStore.isAuth)
  const user = computed(() => authStore.user)
  
  const logout = () => authStore.logout()
  
  return {
    user,
    isAuthenticated,
    logout
  }
}

// Session storage for temporary data
export function useBookingSession() {
  const selectedSeats = useSessionStorage('selected_seats', [])
  const selectedSession = useSessionStorage('selected_session', null)
  const bookingStep = useSessionStorage('booking_step', 1)
  
  const clearBookingSession = () => {
    selectedSeats.value = []
    selectedSession.value = null
    bookingStep.value = 1
  }
  
  return {
    selectedSeats,
    selectedSession,
    bookingStep,
    clearBookingSession
  }
}

// Clipboard utility
export function useClipboardHelper() {
  const { copy, copied, isSupported } = useClipboard()
  
  const copyToClipboard = async (text) => {
    if (isSupported.value) {
      await copy(text)
      // You can add toast notification here
      return true
    }
    return false
  }
  
  return {
    copyToClipboard,
    copied,
    isSupported
  }
}

// Date formatting helpers
export function useDateHelpers() {
  const formatDate = (date, format = 'YYYY-MM-DD') => {
    return useDateFormat(date, format)
  }
  
  const formatTime = (date) => {
    return useDateFormat(date, 'HH:mm')
  }
  
  const formatDateTime = (date) => {
    return useDateFormat(date, 'YYYY-MM-DD HH:mm')
  }
  
  const getTimeAgo = (date) => {
    return useTimeAgo(date)
  }
  
  return {
    formatDate,
    formatTime,
    formatDateTime,
    getTimeAgo
  }
}

// Global event listeners
export function useGlobalEvents() {
  // Escape key handler
  const onEscape = (callback) => {
    useEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        callback()
      }
    })
  }
  
  // Click outside handler
  const onClickOutside = (target, callback) => {
    useEventListener('click', (e) => {
      if (target.value && !target.value.contains(e.target)) {
        callback()
      }
    })
  }
  
  return {
    onEscape,
    onClickOutside
  }
}

