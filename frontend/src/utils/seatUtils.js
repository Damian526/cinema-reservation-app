// Utility functions for seat management

// Constants
export const SEATS_PER_ROW = 10;
export const GAP_THRESHOLD = 6;
export const GAP_POSITION = 5; // Add gap after 5th seat

// Seat status constants
export const SEAT_STATUS = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  OCCUPIED: 'occupied'
};

export function generateSeatLayout(totalSeats) {
  if (!totalSeats) return []
  
  const rows = Math.ceil(totalSeats / SEATS_PER_ROW)
  const layout = []
  
  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(65 + r) // A, B, C, etc.
    const row = {
      label: rowLabel,
      seats: [],
      hasGap: SEATS_PER_ROW > GAP_THRESHOLD // Add gap in middle for wider rows
    }
    
    for (let s = 1; s <= SEATS_PER_ROW; s++) {
      const seatNumber = r * SEATS_PER_ROW + s
      if (seatNumber <= totalSeats) {
        row.seats.push({
          number: seatNumber,
          id: `${rowLabel}${s}`,
          display: s,
          row: rowLabel,
          position: s
        })
      }
    }
    
    layout.push(row)
  }
  
  return layout
}

export function formatTime(timeString) {
  if (!timeString) return ''
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get seat status based on booked and selected seats
export function getSeatStatus(seat, bookedSeats = [], selectedSeats = []) {
  if (bookedSeats.includes(seat.number)) return SEAT_STATUS.OCCUPIED;
  if (selectedSeats.some(s => s.number === seat.number)) return SEAT_STATUS.SELECTED;
  return SEAT_STATUS.AVAILABLE;
}

// Check if seat can be selected
export function canSelectSeat(seat, bookedSeats = []) {
  return !bookedSeats.includes(seat.number);
}

// Format price with currency
export function formatPrice(price, currency = '$') {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) {
    console.warn('Invalid price value:', price);
    return `${currency}0.00`;
  }
  return `${currency}${numericPrice.toFixed(2)}`;
}

// Calculate total price for selected seats
export function calculateTotalPrice(selectedSeats, pricePerSeat) {
  const numericPrice = typeof pricePerSeat === 'string' ? parseFloat(pricePerSeat) : pricePerSeat;
  if (isNaN(numericPrice)) {
    console.warn('Invalid price per seat value:', pricePerSeat);
    return 0;
  }
  return selectedSeats.length * numericPrice;
}

// Generate seat display text (e.g., "A1, A2, B3")
export function formatSeatDisplay(seats) {
  return seats.map(seat => seat.id).join(', ');
}

// Validate seat selection (e.g., max seats, availability)
export function validateSeatSelection(selectedSeats, bookedSeats, maxSeats = 10) {
  const errors = [];
  
  if (selectedSeats.length === 0) {
    errors.push('Please select at least one seat');
  }
  
  if (selectedSeats.length > maxSeats) {
    errors.push(`You can select maximum ${maxSeats} seats`);
  }
  
  const unavailableSeats = selectedSeats.filter(seat => 
    bookedSeats.includes(seat.number)
  );
  
  if (unavailableSeats.length > 0) {
    errors.push(`Selected seats are no longer available: ${formatSeatDisplay(unavailableSeats)}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Find seat by number in layout
export function findSeatByNumber(seatLayout, seatNumber) {
  for (const row of seatLayout) {
    const seat = row.seats.find(seat => seat.number === seatNumber);
    if (seat) return seat;
  }
  return null;
}

// Get available seats count
export function getAvailableSeatsCount(totalSeats, bookedSeats) {
  return totalSeats - bookedSeats.length;
}
