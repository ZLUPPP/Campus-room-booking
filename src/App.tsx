import { useId, useMemo, useState } from 'react';
import { Clock, DoorClosed, CheckCircle2, XCircle, CalendarCheck, Building2 } from 'lucide-react';
import { evaluate, parseMinutes, toTime, type Decision, type Room } from '@/lib/availability';

const ROOMS: Room[] = [
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
];

const CURRENT_TIME = 540;

export default function App() {
  const [roomId, setRoomId] = useState<string>(ROOMS[0].id);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');

  const room = useMemo(() => ROOMS.find((r) => r.id === roomId) ?? null, [roomId]);
  const decision = useMemo(() => evaluate(room, start, end, CURRENT_TIME), [room, start, end]);

  const startNum = parseMinutes(start);
  const endNum = parseMinutes(end);
  const startValid = startNum !== null && startNum >= 0 && startNum <= 1440;
  const endValid = endNum !== null && endNum >= 0 && endNum <= 1440;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Header />

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RoomSelector rooms={ROOMS} selectedId={roomId} onSelect={setRoomId} />
            {room && <RoomDetail room={room} />}
          </div>

          <div className="lg:col-span-2">
            <CheckerPanel
              start={start}
              end={end}
              onStart={setStart}
              onEnd={setEnd}
              startValid={startValid}
              endValid={endValid}
              startDisplay={startValid ? toTime(startNum!) : undefined}
              endDisplay={endValid ? toTime(endNum!) : undefined}
              decision={decision}
            />
          </div>
        </div>

        <footer className="mt-10 text-center text-sm text-slate-400">
          Fictional data for demonstration. Checking availability does not save or confirm a booking.
        </footer>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
          <CalendarCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Smart Campus Room Availability</h1>
          <p className="text-sm text-slate-500">Check whether a room is free for your requested time.</p>
        </div>
      </div>
      <div className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm sm:self-auto">
        <Clock className="h-4 w-4 text-teal-600" />
        <span className="text-slate-500">Current time</span>
        <span className="font-semibold tabular-nums">{CURRENT_TIME} min</span>
        <span className="text-slate-300">·</span>
        <span className="font-semibold tabular-nums">{toTime(CURRENT_TIME)}</span>
      </div>
    </header>
  );
}

function RoomSelector({
  rooms,
  selectedId,
  onSelect,
}: {
  rooms: Room[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">Select a room</label>
      <div className="grid gap-3 sm:grid-cols-2">
        {rooms.map((r) => {
          const active = r.id === selectedId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r.id)}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorClosed className={`h-5 w-5 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="font-medium text-slate-800">{r.name}</span>
                </div>
                {r.blocked ? (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    Blocked
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    Open
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <Building2 className="h-3.5 w-3.5" />
                {r.building}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RoomDetail({ room }: { room: Room }) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">{room.name}</h2>
        {room.blocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
            <XCircle className="h-3.5 w-3.5" /> Blocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Bookable
          </span>
        )}
      </div>
      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
        <Building2 className="h-3.5 w-3.5" /> {room.building}
      </p>

      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Existing bookings today
      </h3>
      {room.bookings.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">No existing bookings on record.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {room.bookings.map((b, i) => (
            <li
              key={i}
              className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium text-slate-700">{b.label}</span>
              <span className="tabular-nums text-slate-500">
                {b.start}–{b.end} min · {toTime(b.start)}–{toTime(b.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CheckerPanel({
  start,
  end,
  onStart,
  onEnd,
  startValid,
  endValid,
  startDisplay,
  endDisplay,
  decision,
}: {
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  startValid: boolean;
  endValid: boolean;
  startDisplay?: string;
  endDisplay?: string;
  decision: Decision;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-800">Check availability</h2>
      <p className="mt-1 text-sm text-slate-500">
        Enter start and end times in minutes (0–1440). Intervals include start and exclude end.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <TimeField
          label="Start (min)"
          value={start}
          valid={startValid}
          display={startDisplay}
          onChange={onStart}
        />
        <TimeField
          label="End (min)"
          value={end}
          valid={endValid}
          display={endDisplay}
          onChange={onEnd}
        />
      </div>

      <div className="mt-5" role="status" aria-atomic="true">
        <DecisionBanner decision={decision} start={start} end={end} />
      </div>
    </div>
  );
}

function TimeField({
  label,
  value,
  valid,
  display,
  onChange,
}: {
  label: string;
  value: string;
  valid: boolean;
  display?: string;
  onChange: (v: string) => void;
}) {
  const inputId = useId();
  const showError = value !== '' && !valid;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <input
        id={inputId}
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0–1440"
        className={`w-full rounded-lg border px-3 py-2 text-sm tabular-nums outline-none transition focus:ring-2 ${
          showError
            ? 'border-red-300 focus:ring-red-200'
            : 'border-slate-300 focus:border-teal-400 focus:ring-teal-200'
        }`}
      />
      <div className="mt-1 h-4 text-xs">
        {showError ? (
          <span className="text-red-600">Must be a whole number 0–1440.</span>
        ) : display ? (
          <span className="text-slate-400">= {display}</span>
        ) : null}
      </div>
    </div>
  );
}

function DecisionBanner({ decision, start, end }: { decision: Decision; start: string; end: string }) {
  if (decision.kind === 'idle') {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
        Enter a start and end time to see the availability decision.
      </div>
    );
  }

  if (decision.kind === 'available') {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="font-semibold text-emerald-800">Available</span>
        </div>
        <p className="mt-2 text-sm text-emerald-700">
          The requested interval {start}–{end} ({toTime(Number(start))}–{toTime(Number(end))}) is valid and free.
        </p>
        <p className="mt-1 text-xs text-emerald-600">No booking has been saved or confirmed.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-5 text-amber-800">
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5" />
        <span className="font-semibold">Unavailable</span>
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {decision.reasons.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  );
}
