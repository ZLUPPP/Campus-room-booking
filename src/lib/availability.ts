export type Room = {
  id: string;
  name: string;
  building: string;
  blocked: boolean;
  bookings: Array<{ start: number; end: number; label: string }>;
};

export type Decision =
  | { kind: 'idle' }
  | { kind: 'available' }
  | { kind: 'unavailable'; reasons: string[] };

export function toTime(minutes: number): string {
  if (minutes === 1440) return '24:00 (end of day)';
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const suffix = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${mm.toString().padStart(2, '0')} ${suffix}`;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

// Strict whole, non-negative decimal minute parser. Rejects signs, decimals,
// exponents, letters, and leading zeros (except "0"). Returns null when malformed.
export function parseMinutes(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  if (!/^(0|[1-9][0-9]*)$/.test(trimmed)) return null;
  return Number(trimmed);
}

export function evaluate(
  room: Room | null,
  startRaw: string,
  endRaw: string,
  currentTime: number,
): Decision {
  if (!room) return { kind: 'idle' };

  const start = parseMinutes(startRaw);
  const end = parseMinutes(endRaw);

  if (start === null && end === null && startRaw.trim() === '' && endRaw.trim() === '') {
    return { kind: 'idle' };
  }

  const reasons: string[] = [];

  if (start === null || end === null) {
    return {
      kind: 'unavailable',
      reasons: ['Start and end must be whole, non-negative minute values (0–1440).'],
    };
  }
  if (start < 0 || start > 1440 || end < 0 || end > 1440) {
    reasons.push('Times must be within the same day: 0 ≤ start and end ≤ 1440.');
  }
  if (!(start < end)) {
    reasons.push('Start must be strictly earlier than end.');
  }
  if (!(start > currentTime)) {
    reasons.push(`Start must be strictly after the current time (${currentTime} = ${toTime(currentTime)}).`);
  }
  if (end - start > 120) {
    reasons.push('Bookings may not exceed 120 minutes.');
  }
  if (reasons.length > 0) return { kind: 'unavailable', reasons };

  if (room.blocked) {
    return { kind: 'unavailable', reasons: ['This room is currently blocked and cannot be booked.'] };
  }
  const conflict = room.bookings.find((b) => overlaps(start, end, b.start, b.end));
  if (conflict) {
    return {
      kind: 'unavailable',
      reasons: [
        `Overlaps existing booking "${conflict.label}" (${conflict.start}–${conflict.end}, ${toTime(conflict.start)}–${toTime(conflict.end)}). Touching endpoints are allowed.`,
      ],
    };
  }
  return { kind: 'available' };
}
