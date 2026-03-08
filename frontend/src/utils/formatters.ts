export function formatDatePL(value: string | Date): string {
  return new Date(value).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTimePL(value: string | Date): string {
  return new Date(value).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPricePLN(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(value);
}

export function formatLongDateEN(value?: string | Date | null): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type DateTimeOptions = {
  weekday?: boolean;
  hour12?: boolean;
};

export function formatDateTimeEN(
  value?: string | Date | null,
  options: DateTimeOptions = {},
): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: options.hour12 ?? false,
  };

  if (options.weekday) {
    formatOptions.weekday = "short";
  }

  return date.toLocaleString("en-US", formatOptions);
}

export function formatNumberFixed(value: number, digits = 2): string {
  if (Number.isNaN(Number(value))) return (0).toFixed(digits);
  return Number(value).toFixed(digits);
}
