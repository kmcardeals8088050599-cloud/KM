// WhatsApp Admin Control.
//
// Authorized administrators (phone number in WHATSAPP_ADMIN_PHONE) can drive the agent
// via WhatsApp: show pending drafts, approve, reject, change price, publish, mark sold,
// regenerate. Destructive / important actions always require explicit confirmation.

import {
  detectAdminCommand,
  getVehicleDraft,
  listVehicleDrafts,
  updateConversation,
  getOrCreateConversation,
} from './db.js';
import { sendWhatsAppText, isAdminSender } from './whatsapp-api.js';
import {
  approveDraft,
  markDraftArchived,
  markDraftSold,
  publishChannels,
  updateDraftPrice,
  PublishContext,
} from './publisher.js';
import { reprocessDraft } from './intake.js';
import type { IntakeContext } from './intake.js';
import { parseIndianPrice } from './config.js';
import { appendAudit } from './audit.js';
import { AdminCommand } from '../../src/types/ai.js';

export async function handleAdminMessage(
  conversationId: string,
  fromPhone: string,
  text: string,
  requestId: string
): Promise<void> {
  if (!isAdminSender(fromPhone)) {
    await sendWhatsAppText(fromPhone, '⚠️ You are not an authorized administrator for this action.');
    return;
  }
  const conversation = await getOrCreateConversation(fromPhone, 'admin');

  // 1. Handle pending confirmation
  const pending = conversation.metadata?.pendingAction;
  if (pending) {
    await handleConfirmation(conversationId, conversation, fromPhone, pending, text, requestId);
    return;
  }

  // 2. Detect a new command
  const match = detectAdminCommand(text);
  if (!match) {
    await maybeReplyUnknownAdminText(conversation, fromPhone, text);
    return;
  }
  await routeCommand(conversationId, conversation, fromPhone, match.command, match, text, requestId);
}

// Non-command admin chatter is acknowledged silently instead of echoing the full
// menu on every message. The full menu is only sent when the admin asks for help;
// otherwise a single short hint is sent, and repeated chatter within a cooldown
// window gets no reply at all.
async function maybeReplyUnknownAdminText(conversation: any, fromPhone: string, text: string): Promise<void> {
  const lower = text.toLowerCase();
  const asksHelp = /(^|[^a-z])(help|menu|commands?|what can you do|\?+)\b/.test(lower) || text.trim() === '';
  const now = Date.now();
  const metadata = conversation.metadata || {};
  const prev = metadata.adminChitchat;

  if (!asksHelp && prev && now - prev.last < 10 * 60_000) {
    return; // already hinted recently — stay silent
  }

  await sendWhatsAppText(fromPhone, asksHelp ? adminHelp(text) : '🤖 Typing a command like "Show pending" or "help" shows what I can do. Non-command messages are ignored.');

  await updateConversation(conversation.id, {
    metadata: { ...metadata, adminChitchat: { last: now } },
  });
}

async function routeCommand(
  conversationId: string,
  conversation: any,
  fromPhone: string,
  command: AdminCommand,
  match: any,
  rawText: string,
  requestId: string
): Promise<void> {
  const ctx: PublishContext = { requestId, actor: fromPhone, actorType: 'admin' };

  switch (command) {
    case 'show_pending':
    case 'show_today': {
      const drafts = await listVehicleDrafts({ state: command === 'show_today' ? 'all' : 'READY_FOR_REVIEW', limit: 10 });
      if (drafts.length === 0) {
        await sendWhatsAppText(fromPhone, '📭 No matching vehicle drafts right now.');
        return;
      }
      const lines = drafts.map(d => {
        const dd = d.data;
        return `${d.id} — ${dd.brand || ''} ${dd.model || ''} ${dd.manufacturingYear || ''} | ${d.state}${dd.price ? ' | ₹' + (dd.price / 100000).toFixed(2) + 'L' : ''}`;
      });
      await sendWhatsAppText(fromPhone, ['📋 *Draft list*', '', ...lines].join('\n'));
      return;
    }
    case 'show_draft': {
      const id = match.draftId || rawText.match(/show\s+draft\s+([\w-]+)/i)?.[1];
      if (!id) {
        const drafts = await listVehicleDrafts({ state: 'all', limit: 5 });
        const lines = drafts.map(d => `${d.id} — ${d.data.brand || ''} ${d.data.model || ''}`);
        await sendWhatsAppText(fromPhone, ['💡 Say e.g. "Show KMC-1042" or "show draft" then a draft id (last 5):', ...lines].join('\n'));
        return;
      }
      const log = await summarizeDraft(id);
      await sendWhatsAppText(fromPhone, log);
      return;
    }
    case 'approve': {
      const id = await resolveDraftId(match, rawText);
      if (!id) { await sendWhatsAppText(fromPhone, 'Specify a draft id to approve, e.g. "Approve KMC-1042".'); return; }
      const d = await getVehicleDraft(id);
      if (!d) { await sendWhatsAppText(fromPhone, 'Draft not found.'); return; }
      await setPending(conversationId, conversation, { action: 'approve', draftId: id });
      await sendWhatsAppText(fromPhone, `Approve draft *${id}* (${d.data.brand} ${d.data.model}) and publish to the website? Reply "Yes" to confirm.`);
      return;
    }
    case 'reject': {
      const id = await resolveDraftId(match, rawText);
      if (!id) { await sendWhatsAppText(fromPhone, 'Specify a draft id to reject, e.g. "Reject KMC-1042".'); return; }
      await setPending(conversationId, conversation, { action: 'reject', draftId: id });
      await sendWhatsAppText(fromPhone, `Reject and archive *${id}*? Reply "Yes" to confirm.`);
      return;
    }
    case 'publish': {
      const id = await resolveDraftId(match, rawText);
      if (!id) { await sendWhatsAppText(fromPhone, 'Specify a draft id to publish, e.g. "Publish KMC-1042".'); return; }
      const d = await getVehicleDraft(id);
      if (!d) { await sendWhatsAppText(fromPhone, 'Draft not found.'); return; }
      if (d.publishedCarId) {
        await sendWhatsAppText(fromPhone, `Draft *${id}* is already published (car ${d.publishedCarId}). Republish? Reply "Yes".`);
        await setPending(conversationId, conversation, { action: 'publish', draftId: id });
        return;
      }
      await setPending(conversationId, conversation, { action: 'publish', draftId: id });
      await sendWhatsAppText(fromPhone, `Publish *${id}* to the website now? Reply "Yes" to confirm.`);
      return;
    }
    case 'mark_sold': {
      const id = await resolveDraftId(match, rawText);
      if (!id) { await sendWhatsAppText(fromPhone, 'Specify a draft id to mark sold, e.g. "Mark KMC-1042 sold".'); return; }
      await setPending(conversationId, conversation, { action: 'mark_sold', draftId: id });
      await sendWhatsAppText(fromPhone, `Mark *${id}* as SOLD? This updates the published listing. Reply "Yes" to confirm.`);
      return;
    }
    case 'change_price': {
      const id = await resolveDraftId(match, rawText);
      const priceText = rawText.match(/change\s+price\s+(?:of\s+[\w-]+\s+)?to\s+(.+)/i)?.[1] || match.value;
      if (!id || !priceText) { await sendWhatsAppText(fromPhone, 'Usage: "Change price of KMC-1042 to 31.75 lakh".'); return; }
      const price = parseIndianPrice(priceText);
      if (!price) { await sendWhatsAppText(fromPhone, 'Could not understand that price. Try e.g. "Change price of KMC-1042 to ₹31.75 lakh".'); return; }
      const d = await getVehicleDraft(id);
      if (!d) { await sendWhatsAppText(fromPhone, 'Draft not found.'); return; }
      const current = d.data.price;
      const newLakh = (price / 100000).toFixed(2);
      const curLakh = current ? (current / 100000).toFixed(2) : '?';
      await setPending(conversationId, conversation, { action: 'change_price', draftId: id, value: price });
      await sendWhatsAppText(fromPhone, `I found draft *${id}* ${d.data.brand} ${d.data.model}. Current price ₹${curLakh} lakh. Change it to ₹${newLakh} lakh?`);
      return;
    }
    case 'regenerate_images':
    case 'regenerate_content': {
      const id = await resolveDraftId(match, rawText);
      if (!id) { await sendWhatsAppText(fromPhone, `Specify a draft id to regenerate ${command === 'regenerate_images' ? 'images' : 'content'}.`); return; }
      await setPending(conversationId, conversation, { action: command, draftId: id });
      await sendWhatsAppText(fromPhone, `Regenerate ${command === 'regenerate_images' ? 'images' : 'content'} for *${id}*? Reply "Yes" to confirm.`);
      return;
    }
    default:
      await sendWhatsAppText(fromPhone, adminHelp(rawText));
  }
}

async function handleConfirmation(
  conversationId: string,
  conversation: any,
  fromPhone: string,
  pending: any,
  text: string,
  requestId: string
): Promise<void> {
  const affirmative = /^(yes|y|ok|confirm|sure|do it|go ahead|yes\s*please)/i.test(text.trim());
  await updateConversation(conversationId, { metadata: { ...(conversation.metadata || {}), pendingAction: null } });

  const ctx: PublishContext = { requestId, actor: fromPhone, actorType: 'admin' };
  if (!affirmative) {
    await sendWhatsAppText(fromPhone, 'Cancelled. Nothing was changed.');
    return;
  }

  try {
    switch (pending.action) {
      case 'approve': {
        const { car } = await approveDraft(pending.draftId, ctx);
        const ent = (await getVehicleDraft(pending.draftId))?.publishResult?.entries || [];
        const ig = ent.find(e => e.channel === 'instagram')?.status || 'skipped';
        await sendWhatsAppText(
          fromPhone,
          ['✅ *Vehicle approved & published*',
            `Listing: ${car.title}`,
            `Stock: ${car.id}`,
            `Website: Published`,
            `Instagram: ${ig === 'success' ? 'Published' : 'Not published (see dashboard)'}`,
          ].join('\n')
        );
        return;
      }
      case 'reject':
        await markDraftArchived(pending.draftId, ctx, 'Rejected by admin via WhatsApp');
        await sendWhatsAppText(fromPhone, `🗑 Draft ${pending.draftId} archived.`);
        return;
      case 'publish': {
        const draft = await getVehicleDraft(pending.draftId);
        if (!draft || !draft.publishedCarId) {
          await sendWhatsAppText(fromPhone, 'This draft is not approved yet. Approve it first.');
          return;
        }
        const result = await publishChannels(pending.draftId, draft.publishedCarId, ctx);
        const wa = result.entries.find(e => e.channel === 'website');
        await sendWhatsAppText(fromPhone, `✅ Website ${wa?.status === 'success' ? 'published' : 'failed'} for ${pending.draftId}.`);
        return;
      }
      case 'mark_sold':
        await markDraftSold(pending.draftId, ctx);
        await sendWhatsAppText(fromPhone, `💰 ${pending.draftId} marked SOLD.`);
        return;
      case 'change_price': {
        await updateDraftPrice(pending.draftId, pending.value, ctx);
        await sendWhatsAppText(fromPhone, `✅ Price updated for ${pending.draftId} to ₹${(pending.value / 100000).toFixed(2)} lakh.`);
        return;
      }
      case 'regenerate_images':
      case 'regenerate_content': {
        const intakeCtx: IntakeContext = { requestId, fromPhone, participantType: 'admin' };
        await reprocessDraft(pending.draftId, intakeCtx);
        await sendWhatsAppText(fromPhone, `♻️ Regenerated content for ${pending.draftId}. It is ready for review again.`);
        return;
      }
      default:
        await sendWhatsAppText(fromPhone, 'Unknown pending action. Nothing was changed.');
    }
  } catch (err: any) {
    await sendWhatsAppText(fromPhone, `⚠️ Action failed: ${err.message}`);
    await appendAudit({
      actor: fromPhone,
      actorType: 'admin',
      action: 'confirm_execute_failed',
      entity: 'vehicle_draft',
      entityId: pending.draftId,
      newValue: { error: err.message, action: pending.action },
      source: 'whatsapp',
      conversationId,
      requestId,
    });
  }
}

async function setPending(conversationId: string, conversation: any, pending: any): Promise<void> {
  await updateConversation(conversationId, {
    metadata: { ...(conversation.metadata || {}), pendingAction: pending, pendingAt: new Date().toISOString() },
  });
}

async function resolveDraftId(match: any, rawText: string): Promise<string | undefined> {
  return match.draftId || rawText.match(/\b(vd-[\w-]+|kmc-[\w-]+|car-[\w-]+)\b/i)?.[1];
}

async function summarizeDraft(id: string): Promise<string> {
  const draft = await getVehicleDraft(id);
  if (!draft) return 'Draft not found.';
  const d = draft.data;
  return [
    `🚘 *Draft ${draft.id}*`,
    `State: ${draft.state}`,
    '',
    `${d.brand || '?'} ${d.model || ''} ${d.variant || ''} (${d.manufacturingYear || '?'})`,
    `Fuel: ${d.fuelType || '?'} | ${d.transmission || '?'} | ${d.bodyType || '?'}`,
    d.odometerKm ? `Odo: ${d.odometerKm.toLocaleString('en-IN')} km` : '',
    d.ownerCount ? `Owner: ${d.ownerCount}` : '',
    d.price ? `Price: ₹${d.price >= 100000 ? (d.price / 100000).toFixed(2) + ' lakh' : d.price.toLocaleString('en-IN')}` : '',
    draft.data.location ? `Location: ${draft.data.location}` : '',
    '',
    `Images: ${Array.isArray(draft.images) ? draft.images.length : 0} | Source: ${draft.source || 'whatsapp'}`,
    `Created: ${new Date(draft.createdAt).toLocaleString('en-IN')}`,
  ].filter(Boolean).join('\n');
}

function adminHelp(text: string): string {
  const lower = text.toLowerCase();
  if (/fortuner/.test(lower) && /show|draft/.test(lower)) {
    return '📌 Usage: "Show Fortuner draft" or "Show draft <id>".';
  }
  return [
    '🤖 *KM AI Admin*',
    '',
    'Commands:',
    '• Show pending — drafts ready for review',
    '• Show today\'s submissions',
    '• Show draft <id>',
    '• Approve <id>',
    '• Reject <id>',
    '• Publish <id>',
    '• Mark <id> sold',
    '• Change price of <id> to <amount>',
    '• Regenerate images/content <id>',
  ].join('\n');
}