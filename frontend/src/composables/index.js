// VueUse composables for the Cinema App
import { computed } from 'vue'
import { 
  useLocalStorage, 
  useSessionStorage, 
  useDark, 
  useToggle,
  useBreakpoints,
  breakpointsTailwind,
  useEventListener,
  useClipboard,
  useDateFormat,
  useTimeAgo,
  useFetch,
  useAsyncState
} from '@vueuse/core'

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

// Local storage helpers for cinema app
export function useAuth() {
  const token = useLocalStorage('cinema_auth_token', null)
  const user = useLocalStorage('cinema_user', null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  const logout = () => {
    token.value = null
    user.value = null
  }
  
  return {
    token,
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

// API helpers with VueUse
export function useApiHelpers() {
  const createApiCall = (url, options = {}) => {
    return useFetch(url, {
      ...options,
      beforeFetch({ url, options }) {
        // Add auth token if available
        const { token } = useAuth()
        if (token.value) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token.value}`
          }
        }
        return { url, options }
      }
    })
  }
  
  const createAsyncOperation = (operation) => {
    return useAsyncState(operation, null)
  }
  
  return {
    createApiCall,
    createAsyncOperation
  }
}
