// Utility functions for seat management
export function generateSeatLayout(totalSeats) {
  if (!totalSeats) return []
  
  const seatsPerRow = 10
  const rows = Math.ceil(totalSeats / seatsPerRow)
  const layout = []
  
  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(65 + r) // A, B, C, etc.
    const row = {
      label: rowLabel,
      seats: [],
      hasGap: seatsPerRow > 6 // Add gap in middle for wider rows
    }
    
    for (let s = 1; s <= seatsPerRow; s++) {
      const seatNumber = r * seatsPerRow + s
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
