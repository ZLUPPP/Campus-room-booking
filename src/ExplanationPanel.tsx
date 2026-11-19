import { useEffect, useRef, useState } from 'react';
import { buildContext, explain, mockAdapter, type Mode } from '@/lib/explanation';
import type { Room } from '@/lib/availability';

export default function ExplanationPanel({ room, start, end, now }: { room: Room | null; start: string; end: string; now: number }) {
  const [mode, setMode] = useState<Mode>('normal');
  const [result, setResult] = useState<{ explanation: string; fallback: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  useEffect(() => {
    requestId.current += 1;
    setResult(null);
    setError('');
    setLoading(false);
    return () => { requestId.current += 1; };
  }, [room, start, end, mode, now]);

  async function requestExplanation() {
    const id = ++requestId.current;
    setResult(null);
    setError('');
    try {
      const context = buildContext(room, start, end, now);
      setLoading(true);
      const response = await explain(context, mockAdapter(mode));
      if (id === requestId.current) setResult(response);
    } catch {
      if (id === requestId.current) setError('Enter complete whole-minute values using at most four digits to request an explanation.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-800">Optional explanation</h2>
      <p className="mt-1 text-sm text-slate-500">Mock-generated text based on the confirmed result above.</p>
      <button type="button" disabled={loading} onClick={requestExplanation}
        className="mt-3 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {loading ? 'Explaining…' : 'Explain availability'}
      </button>
      <div role="status" aria-live="polite" className="mt-3 text-sm text-slate-700">
        {error && <p>{error}</p>}
        {result && <><p className="mb-1 font-medium">{result.fallback ? 'Rule-based fallback' : 'Mock-generated explanation'}</p><p>{result.explanation}</p></>}
      </div>
      <details className="mt-3 text-xs text-slate-500">
        <summary>Classroom failure simulation</summary>
        <label className="mt-2 block" htmlFor="explanation-mode">Explanation mode</label>
        <select id="explanation-mode" value={mode} onChange={event => setMode(event.target.value as Mode)}
          className="mt-1 max-w-full rounded border border-slate-300 p-2">
          <option value="normal">Normal mock</option><option value="timeout">Timeout</option>
          <option value="error">Simulated API error</option><option value="missing-key">Unavailable key</option>
          <option value="invalid-output">Contradictory output</option>
        </select>
      </details>
    </section>
  );
}
