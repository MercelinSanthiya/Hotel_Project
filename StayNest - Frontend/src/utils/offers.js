// Shared helpers for the room/experience "offer" (percentage discount)
// feature. An item has an active offer when it has a positive
// offerPercent AND its offerExpiry (a "yyyy-MM-ddTHH:mm" datetime-local
// string) is still in the future. The backend also auto-clears expired
// offers, but checking here too means the UI reacts instantly even
// before the next refetch.

export function isOfferActive(item) {
  if (!item) return false;
  const percent = Number(item.offerPercent);
  if (!percent || percent <= 0) return false;
  if (!item.offerExpiry) return false;
  const expiry = new Date(item.offerExpiry);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() > Date.now();
}

export function getDiscountedPrice(price, item) {
  const base = Number(price) || 0;
  if (!isOfferActive(item)) return base;
  const percent = Number(item.offerPercent);
  const discounted = base - (base * percent) / 100;
  return Math.round(discounted * 100) / 100;
}

export function formatOfferExpiry(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
