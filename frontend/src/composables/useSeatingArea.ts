import { computed } from "vue";
import { GAP_POSITION, canSelectSeat, getSeatStatus } from "../utils/seatUtils";
import { formatDateTimeEN, formatNumberFixed } from "../utils/formatters";
import type { Session } from "../types/session";

type Seat = {
  number: number;
  id: string;
  display: number;
  position: number;
};

type SeatRow = {
  label: string;
  seats: Seat[];
  hasGap: boolean;
};

export function useSeatingArea(
  props: {
    seatLayout: SeatRow[];
    bookedSeats: number[];
    selectedSeats: Seat[];
    session: Session | null;
  },
  emit: (event: "seat-click", seat: Seat) => void,
) {
  const sessionTimeLabel = computed(() => {
    if (!props.session?.startTime) return "Time TBA";
    return formatDateTimeEN(props.session.startTime, { weekday: true, hour12: true });
  });

  const priceLabel = computed(() =>
    formatNumberFixed(props.session?.price ?? 0, 2),
  );

  const getSeatClass = (seat: Seat) =>
    getSeatStatus(seat, props.bookedSeats, props.selectedSeats);

  const getSeatTooltip = (seat: Seat) => {
    const status = getSeatClass(seat);
    const statusText: Record<string, string> = {
      available: "Available - Click to select",
      selected: "Selected - Click to deselect",
      occupied: "Occupied - Cannot select",
    };
    return `Seat ${seat.display} - ${statusText[status] || "Unknown status"}`;
  };

  const getSeatAriaLabel = (seat: Seat) => {
    const status = getSeatClass(seat);
    const statusText: Record<string, string> = {
      available: "available",
      selected: "selected",
      occupied: "occupied",
    };
    return `Seat ${seat.display}, ${statusText[status] || "unknown status"}`;
  };

  const handleSeatClick = (seat: Seat) => {
    if (canSelectSeat(seat, props.bookedSeats)) {
      emit("seat-click", seat);
    }
  };

  const shouldShowGap = (row: SeatRow, seat: Seat) =>
    row.hasGap && seat.position === GAP_POSITION;

  return {
    canSelectSeat,
    getSeatClass,
    getSeatTooltip,
    getSeatAriaLabel,
    handleSeatClick,
    shouldShowGap,
    sessionTimeLabel,
    priceLabel,
  };
}
