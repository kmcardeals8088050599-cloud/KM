import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Check,
  X,
  DollarSign,
  Send,
  RotateCcw,
  Clock,
  MessageCircle,
  Bot,
  Layers,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Download
} from 'lucide-react';
import {
  fetchAiStatus,
  fetchAiDrafts,
  fetchAiDraft,
  aiApproveDraft,
  aiRejectDraft,
  aiMarkSold,
  aiUpdatePrice,
  aiRegenerate,
  aiIntakeText,
  getAuthToken,
  AiDraft
} from '../../lib/api';

const PUBLISH_REQUIRED_FIELDS = [
  'brand',
  'model',
  'manufacturingYear',
  'fuelType',
  'transmission',
  'bodyType',
  'ownerCount',
  'odometerKm',
  'price'
];

const MIN_PHOTOS_FOR_PUBLISH = 3;

function missingPublishFields(d: AiDraft, includeRequired = true): string[] {
  const data = d.data || {};
  return PUBLISH_REQUIRED_FIELDS.filter(k => {
    const v = data[k];
    return v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v));
  });
}

function photoPublishStatus(d: AiDraft): { count: number; ok: boolean } {
  const count = d.images?.length || 0;
  return { count, ok: count >= MIN_PHOTOS_FOR_PUBLISH };
}

function draftPublishGates(d: AiDraft): { missing: string[]; photos: { count: number; ok: boolean }; blocked: boolean } {
  const missing = missingPublishFields(d);
  const photos = photoPublishStatus(d);
  return { missing, photos, blocked: missing.length > 0 || !photos.ok };
}

const STATE_BADGES: Record<string, { bg: string; text: string }> = {
  RECEIVED: { bg: 'bg-slate-100', text: 'text-slate-700' },
  PROCESSING: { bg: 'bg-amber-100', text: 'text-amber-800' },
  INCOMPLETE: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  READY_FOR_REVIEW: { bg: 'bg-blue-100', text: 'text-blue-800' },
  APPROVED: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  PUBLISHED: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  UPDATED: { bg: 'bg-teal-100', text: 'text-teal-800' },
  SOLD: { bg: 'bg-purple-100', text: 'text-purple-800' },
  ARCHIVED: { bg: 'bg-gray-100', text: 'text-gray-500' },
  PROCESSING_FAILED: { bg: 'bg-red-100', text: 'text-red-700' },
  PUBLISH_FAILED: { bg: 'bg-red-100', text: 'text-red-700' },
  IMAGE_PROCESSING_FAILED: { bg: 'bg-red-100', text: 'text-red-700' }
};

export const AIOpsPanel: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [drafts, setDrafts] = useState<AiDraft[]>([]);
  const [stateFilter, setStateFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<{ draft: AiDraft; messages: any[]; publishLog: any[] } | null>(null);
  const [actionMsg, setActionMsg] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [intakeText, setIntakeText] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, d] = await Promise.all([fetchAiStatus(), fetchAiDrafts(stateFilter)]);
      setStatus(s);
      setDrafts(d);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI operations');
    } finally {
      setLoading(false);
    }
  }, [stateFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openDetail = async (id: string) => {
    setActionMsg('');
    setPriceInput('');
    try {
      setDetail(await fetchAiDraft(id));
    } catch (err: any) {
      setActionMsg(`⚠️ ${err.message}`);
    }
  };

  const runAction = async (fn: () => Promise<any>, successMsg: string) => {
    setBusy(true);
    setActionMsg('');
    try {
      await fn();
      setActionMsg(successMsg);
      await refresh();
      if (detail) setDetail(await fetchAiDraft(detail.draft.id));
    } catch (err: any) {
      setActionMsg(`⚠️ ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleIntake = async () => {
    if (!intakeText.trim()) return;
    await runAction(async () => aiIntakeText(intakeText.trim()), '✅ Intake ran — draft created.');
    setIntakeText('');
  };

  const handleExport = async () => {
    setBusy(true);
    setError('');
    setActionMsg('');
    try {
      const token = getAuthToken();
      const res = await fetch('/api/cars/export', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `km-car-deals-catalogue-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setActionMsg('📄 Catalogue exported — product ids + prices included. Open in Excel.');
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setBusy(false);
    }
  };

  const priceLakh = (p?: number) =>
    p === undefined || p === null ? '' : `₹${(p / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakh`;

  return (
    <div className="space-y-6">
      {/* Header + status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">AI Vehicle Operations</h2>
            <p className="text-xs text-slate-500 font-medium">WhatsApp intake, drafts, approval &amp; publishing</p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 w-fit shadow-xs"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        <button
          onClick={handleExport}
          disabled={busy}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 w-fit shadow-xs"
          title="Admin-only CSV with product ids + asking prices"
        >
          <Download className="w-4 h-4" /> Export Catalogue (Excel)
        </button>
      </div>

      {/* Integration readiness */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <StatusCard label="AI Provider" ok={status ? aiProviderReady(status) : undefined} hint={aiProviderHint(status)} />
        <StatusCard label="WhatsApp API" ok={status?.whatsappConfigured} />
        <StatusCard label="Instagram" ok={status?.instagramConfigured} />
        <StatusCard label="WA Catalogue" ok={status?.whatsappCatalogueConfigured} hint="Commerce + PUBLIC_SITE_URL" />
        <StatusCard label="Drafts" ok={status ? status.draftsTotal > 0 : false} count={status?.draftsTotal} />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-bold text-red-700">{error}</div>
      )}

      {/* Manual intake (fast path for admin, no WhatsApp needed) */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wide">
          <Send className="w-4 h-4 text-amber-600" /> Manual Intake
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Paste a seller message (e.g. “Toyota Fortuner 2022, 2.8 diesel automatic, 48k, first owner, ₹32.5 lakh”)
          to run extraction + validation + content without WhatsApp.
        </p>
        <div className="flex gap-2">
          <textarea
            value={intakeText}
            onChange={e => setIntakeText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleIntake(); }}
            placeholder="Vehicle details (text)..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 min-h-[70px]"
          />
        </div>
        <button
          onClick={handleIntake}
          disabled={busy || !intakeText.trim()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 w-fit"
        >
          <Bot className="w-4 h-4" /> Run AI Intake
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">{actionMsg}</div>
      )}

      {/* Draft filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-black text-slate-600">State:</span>
        {['All', 'READY_FOR_REVIEW', 'INCOMPLETE', 'PROCESSING', 'PUBLISHED', 'PUBLISH_FAILED', 'SOLD', 'ARCHIVED', 'PROCESSING_FAILED'].map(s => (
          <button
            key={s}
            onClick={() => setStateFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold border transition-colors ${
              stateFilter === s
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Draft list */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="py-16 text-center text-sm font-bold text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
          No drafts in this state yet. Authenticate the WhatsApp webhook and send a vehicle message.
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map(d => {
            const badge = STATE_BADGES[d.state] || STATE_BADGES.PROCESSING;
            return (
              <div key={d.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${badge.bg} ${badge.text}`}>{d.state}</span>
                    <span className="text-sm font-black text-slate-900 truncate">
                      {d.data.brand || '?'} {d.data.model || ''} {d.data.variant ? `· ${d.data.variant}` : ''} {d.data.manufacturingYear ? `(${d.data.manufacturingYear})` : ''}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] font-bold text-slate-500 space-x-3">
                    {d.data.fuelType && <span>{d.data.fuelType}</span>}
                    {d.data.transmission && <span>{d.data.transmission}</span>}
                    {d.data.bodyType && <span>{d.data.bodyType}</span>}
                    {d.data.odometerKm && <span>{d.data.odometerKm.toLocaleString('en-IN')} km</span>}
                    {d.data.price ? <span className="text-emerald-700">{priceLakh(d.data.price)}</span> : null}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 font-medium truncate">
                    {d.id} · {d.images?.length || 0} images · {d.source || 'whatsapp'} · {new Date(d.createdAt).toLocaleString('en-IN')}
                  </div>
                  {d.publishResult?.entries?.length ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {d.publishResult.entries.map(e => (
                        <span key={e.channel} className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${e.status === 'success' ? 'bg-emerald-100 text-emerald-700' : e.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                          {e.channel}: {e.status}{e.error ? ` (${e.error.slice(0, 40)})` : ''}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex sm:flex-col gap-2 sm:shrink-0">
                  <button
                    onClick={() => openDetail(d.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-extrabold rounded-lg flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                  {d.state === 'READY_FOR_REVIEW' && (() => {
                    const gates = draftPublishGates(d);
                    return (
                      <>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {gates.missing.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-red-100 text-red-700">
                              Missing: {gates.missing.join(', ')}
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${gates.photos.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {gates.photos.count} / {MIN_PHOTOS_FOR_PUBLISH} photos
                          </span>
                          {gates.blocked && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-700">
                              Remaining required fields: {gates.missing.length + (gates.photos.ok ? 0 : 1)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => runAction(async () => aiApproveDraft(d.id), '✅ Approved & published.')}
                          disabled={busy || gates.blocked}
                          title={gates.blocked
                            ? `Cannot publish yet — missing: ${gates.missing.length ? gates.missing.join(', ') : 'none'}; photos ${gates.photos.count}/3`
                            : 'Publish to catalogue'}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Approve {gates.blocked ? '(blocked)' : ''}
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 p-0 sm:p-6" onClick={() => setDetail(null)}>
          <div
            className="bg-slate-50 w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between gap-4 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-500 flex items-center justify-center text-xs font-black shrink-0">{detail.draft.id.slice(0, 4)}</div>
                <div className="min-w-0">
                  <p className="text-sm font-black truncate">{detail.draft.data.brand} {detail.draft.data.model} {detail.draft.data.manufacturingYear}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{detail.draft.state}</p>
                </div>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 bg-slate-100 rounded-lg">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="p-4 space-y-5">
              {actionMsg && <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">{actionMsg}</div>}

              {/* Extracted info */}
              <Section title="Extracted Vehicle Information" icon={<Layers className="w-4 h-4" />}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(detail.draft.data).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => (
                    <Field key={k} k={k} v={v as any} locked={detail.draft.lockedFields.includes(k)} conf={detail.draft.confidence?.[k]} />
                  ))}
                </div>
              </Section>

              {/* Content */}
              {detail.draft.content && (
                <Section title="Generated Content" icon={<Bot className="w-4 h-4" />}>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Website Title</p>
                      <p className="text-sm font-bold text-slate-800">{detail.draft.content.websiteTitle}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Website Description</p>
                      <p className="text-sm text-slate-700">{detail.draft.content.websiteDescription}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Instagram Caption</p>
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans">{detail.draft.content.instagramCaption}</pre>
                    </div>
                    {detail.draft.content.seo && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">SEO</p>
                        <p className="text-xs text-slate-500 font-medium">
                          {detail.draft.content.seo.title} — {detail.draft.content.seo.slug}
                        </p>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Publish results */}
              {detail.publishLog.length > 0 && (
                <Section title="Publishing" icon={<Send className="w-4 h-4" />}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {detail.publishLog.map(entry => (
                      <div key={entry.id} className={`p-3 rounded-xl border ${entry.status === 'success' ? 'bg-emerald-50 border-emerald-200' : entry.status === 'failed' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                        <p className="text-[11px] font-black uppercase">{entry.channel}</p>
                        <p className="text-xs font-bold">{entry.status}</p>
                        {entry.error && <p className="text-[10px] text-red-600 mt-0.5">{entry.error}</p>}
                        {entry.external_id && <p className="text-[10px] text-slate-400">{entry.external_id}</p>}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Source messages */}
              {detail.messages.length > 0 && (
                <Section title="Source WhatsApp Messages" icon={<MessageCircle className="w-4 h-4" />}>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {detail.messages.map(m => (
                      <div key={m.id} className="text-xs text-slate-600">
                        <span className="font-black text-slate-400">{new Date(m.created_at).toLocaleTimeString('en-IN', { hour12: false })}</span>{' '}
                        {m.text || (m.media?.length ? `[${m.media.map(a => a.kind).join(', ')}]` : `[${m.type}]`)}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {detail.draft.state === 'READY_FOR_REVIEW' && (
                  <>
                    <button onClick={() => runAction(async () => aiApproveDraft(detail.draft.id), '✅ Approved & published.')} disabled={busy} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 disabled:opacity-40">
                      <Check className="w-4 h-4" /> Approve &amp; Publish
                    </button>
                    <button onClick={() => runAction(async () => aiRejectDraft(detail.draft.id), 'Draft archived.')} disabled={busy} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-extrabold rounded-xl flex items-center gap-2 disabled:opacity-40">
                      <ThumbsDown className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                {detail.draft.publishedCarId && (
                  <button onClick={() => runAction(async () => aiMarkSold(detail.draft.id), 'Marked SOLD.')} disabled={busy} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl disabled:opacity-40">
                    Mark Sold
                  </button>
                )}
                <button onClick={() => runAction(async () => aiRegenerate(detail.draft.id), '🔄 Regenerated.')} disabled={busy} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl flex items-center gap-2 disabled:opacity-40">
                  <RotateCcw className="w-4 h-4" /> Regenerate
                </button>
                <div className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-xl">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <input
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    placeholder="New price in Lakh (e.g. 31.75)"
                    className="w-32 text-xs font-bold outline-none"
                  />
                  <button
                    onClick={() => {
                      const lakh = parseFloat(priceInput);
                      if (!isNaN(lakh) && lakh > 0) runAction(async () => aiUpdatePrice(detail.draft.id, Math.round(lakh * 100000)), '✅ Price updated.');
                    }}
                    disabled={busy || !priceInput}
                    className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-extrabold rounded-lg disabled:opacity-40"
                  >
                    Update
                  </button>
                </div>
              </div>

              {detail.draft.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold whitespace-pre-wrap">
                  {JSON.stringify(detail.draft.error)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function aiProviderReady(status: any): boolean {
  return Boolean(status.aiProviderConfigured && status.aiProviderAvailable && status.aiModelAvailable);
}

function aiProviderHint(status: any): string | undefined {
  if (!status) return '…';
  if (!status.aiProviderConfigured) return 'not configured';
  if (status.aiProviderError) return `${status.aiProvider} · ${status.aiProviderError}`;
  return [
    status.aiProvider,
    status.aiModelAvailable ? 'ready' : 'model missing',
    status.aiVisionModelAvailable ? 'vision' : 'no vision',
  ].join(' · ');
}

function StatusCard({ label, ok, hint, count }: { label: string; ok?: boolean; hint?: string; count?: number }) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ok === undefined ? 'bg-slate-100' : ok ? 'bg-emerald-100' : 'bg-red-100'}`}>
        {ok === undefined ? <Clock className="w-4 h-4 text-slate-400" /> : ok ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-red-600" />}
      </div>
      <div>
        <p className="text-xs font-black text-slate-700">{label}</p>
        <p className="text-[10px] font-bold text-slate-400">{hint ?? (count !== undefined ? count : ok ? 'Ready' : 'Not configured')}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wide">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

function Field({ k, v, locked, conf }: { k: string; v: string | number | boolean | string[]; locked: boolean; conf?: number; key?: React.Key }) {
  const label = k.replace(/([A-Z])/g, ' $1').trim();
  const display = Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : v;
  return (
    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
      <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
        {label}
        {locked && <span className="text-[9px] bg-slate-900 text-white px-1 rounded">LOCKED</span>}
      </p>
      <p className="text-xs font-bold text-slate-800 truncate" title={String(display)}>{String(display)}</p>
      {conf !== undefined && <p className="text-[9px] text-slate-400 font-bold">confidence {Math.round(conf * 100)}%</p>}
    </div>
  );
}