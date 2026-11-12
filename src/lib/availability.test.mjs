import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, parseMinutes, toTime } from './availability.ts';

const NOW = 540;
const REASON_MALFORMED = 'Start and end must be whole, non-negative minute values (0–1440).';
const REASON_RANGE = 'Times must be within the same day: 0 ≤ start and end ≤ 1440.';
const REASON_ORDER = 'Start must be strictly earlier than end.';
const REASON_NOW = 'Start must be strictly after the current time (540 = 9:00 AM).';
const REASON_DURATION = 'Bookings may not exceed 120 minutes.';
const REASON_BLOCKED = 'This room is currently blocked and cannot be booked.';
const REASON_OVERLAP =
  'Overlaps existing booking "Faculty Meeting" (600–660, 10:00 AM–11:00 AM). Touching endpoints are allowed.';

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

const FIXTURES = deepFreeze([
  {
    id: 'room-a',
    name: 'Room A — Study Lab',
    building: 'Engineering Block, Floor 2',
    blocked: false,
    bookings: [{ start: 600, end: 660, label: 'Faculty Meeting' }],
  },
  {
    id: 'room-b',
    name: 'Room B — Seminar Hall',
    building: 'Library Wing, Floor 3',
    blocked: true,
    bookings: [],
  },
  {
    id: 'room-c',
    name: 'Room C — Open Hall',
    building: 'Test Block',
    blocked: false,
    bookings: [],
  },
]);

const [ROOM_A, ROOM_B, ROOM_C] = FIXTURES;

function unavailable(...reasons) {
  return { kind: 'unavailable', reasons };
}

describe('AC5 idle state', () => {
  it('is idle when no room is selected', () => {
    assert.deepEqual(evaluate(null, '600', '700', NOW), { kind: 'idle' });
  });

  it('is idle when both inputs are empty or whitespace', () => {
    assert.deepEqual(evaluate(ROOM_C, '', '', NOW), { kind: 'idle' });
    assert.deepEqual(evaluate(ROOM_C, '   ', '\t', NOW), { kind: 'idle' });
  });

  it('reports malformed when only one input is empty', () => {
    assert.deepEqual(evaluate(ROOM_C, '', '700', NOW), unavailable(REASON_MALFORMED));
    assert.deepEqual(evaluate(ROOM_C, '600', '', NOW), unavailable(REASON_MALFORMED));
  });
});

describe('AC1 start must be strictly after the current time', () => {
  it('rejects a start in the past', () => {
    assert.deepEqual(evaluate(ROOM_C, '500', '600', NOW), unavailable(REASON_NOW));
  });

  it('rejects a start equal to the current time', () => {
    assert.deepEqual(evaluate(ROOM_C, '540', '600', NOW), unavailable(REASON_NOW));
  });

  it('accepts a start one minute after the current time', () => {
    assert.deepEqual(evaluate(ROOM_C, '541', '600', NOW), { kind: 'available' });
  });
});

describe('AC1 interval order and range', () => {
  it('rejects an equal interval with the ordering reason only', () => {
    assert.deepEqual(evaluate(ROOM_C, '700', '700', NOW), unavailable(REASON_ORDER));
  });

  it('rejects a reversed interval with the ordering reason only', () => {
    assert.deepEqual(evaluate(ROOM_C, '800', '700', NOW), unavailable(REASON_ORDER));
  });

  it('accepts the full valid range boundary ending at 1440', () => {
    assert.deepEqual(evaluate(ROOM_C, '1380', '1440', NOW), { kind: 'available' });
  });

  it('rejects an end beyond 1440 with the range reason only', () => {
    assert.deepEqual(evaluate(ROOM_C, '1400', '1441', NOW), unavailable(REASON_RANGE));
  });

  it('rejects an overlong numeric out-of-range input with the range reason, not malformed', () => {
    assert.deepEqual(evaluate(ROOM_C, '12345678901', '12345678950', NOW), unavailable(REASON_RANGE));
  });
});

describe('AC2 duration limit', () => {
  it('accepts a 120-minute booking', () => {
    assert.deepEqual(evaluate(ROOM_C, '600', '720', NOW), { kind: 'available' });
  });

  it('rejects a 121-minute booking with the duration reason only', () => {
    assert.deepEqual(evaluate(ROOM_C, '600', '721', NOW), unavailable(REASON_DURATION));
  });
});

describe('AC3 blocked room', () => {
  it('rejects a valid interval in a blocked room with the blocked reason', () => {
    assert.deepEqual(evaluate(ROOM_B, '600', '660', NOW), unavailable(REASON_BLOCKED));
  });
});

describe('AC4 overlaps use half-open intervals', () => {
  it('rejects an exact match of an existing booking', () => {
    assert.deepEqual(evaluate(ROOM_A, '600', '660', NOW), unavailable(REASON_OVERLAP));
  });

  it('rejects an interval contained within a booking', () => {
    assert.deepEqual(evaluate(ROOM_A, '610', '650', NOW), unavailable(REASON_OVERLAP));
  });

  it('rejects an interval that spans a booking', () => {
    assert.deepEqual(evaluate(ROOM_A, '580', '680', NOW), unavailable(REASON_OVERLAP));
  });

  it('rejects an interval that partially overlaps the start of a booking', () => {
    assert.deepEqual(evaluate(ROOM_A, '580', '620', NOW), unavailable(REASON_OVERLAP));
  });

  it('rejects an interval that partially overlaps the end of a booking', () => {
    assert.deepEqual(evaluate(ROOM_A, '640', '700', NOW), unavailable(REASON_OVERLAP));
  });

  it('accepts an interval whose end touches the start of a booking', () => {
    assert.deepEqual(evaluate(ROOM_A, '540', '600', 400), { kind: 'available' });
  });

  it('accepts an interval whose start touches the end of a booking', () => {
    assert.deepEqual(evaluate(ROOM_A, '660', '720', NOW), { kind: 'available' });
  });
});

describe('AC1 raw input policy', () => {
  it('accepts whole decimal values with surrounding whitespace', () => {
    assert.deepEqual(evaluate(ROOM_C, ' 600 ', ' 700 ', NOW), { kind: 'available' });
  });

  it('rejects inputs that are not strict whole decimals', () => {
    for (const bad of ['-5', '+60', '1.5', '1e3', 'abc', '6 00', '01', '00', '0x10']) {
      assert.deepEqual(
        evaluate(ROOM_C, bad, '700', NOW),
        unavailable(REASON_MALFORMED),
        `start input ${JSON.stringify(bad)}`,
      );
      assert.deepEqual(
        evaluate(ROOM_C, '600', bad, NOW),
        unavailable(REASON_MALFORMED),
        `end input ${JSON.stringify(bad)}`,
      );
    }
  });

  it('parses only strict whole decimals', () => {
    assert.equal(parseMinutes('0'), 0);
    assert.equal(parseMinutes('1440'), 1440);
    assert.equal(parseMinutes('010'), null);
    assert.equal(parseMinutes(''), null);
  });
});

describe('1440 and time formatting', () => {
  it('formats 1440 as the end of day', () => {
    assert.equal(toTime(1440), '24:00 (end of day)');
  });

  it('formats midnight, noon, and the current time', () => {
    assert.equal(toTime(0), '12:00 AM');
    assert.equal(toTime(720), '12:00 PM');
    assert.equal(toTime(540), '9:00 AM');
  });
});

describe('immutable fixtures', () => {
  it('keeps fixtures deep-equal to their snapshot after evaluation', () => {
    const snapshot = structuredClone(FIXTURES);
    for (const room of FIXTURES) {
      evaluate(room, '600', '660', NOW);
      evaluate(room, '540', '600', 400);
      evaluate(room, '580', '620', NOW);
    }
    assert.deepEqual(FIXTURES, snapshot);
  });

  it('keeps fixtures frozen', () => {
    assert.equal(Object.isFrozen(ROOM_A), true);
    assert.equal(Object.isFrozen(ROOM_A.bookings[0]), true);
  });
});
