import { useEffect, useMemo, useRef, useState } from 'react';
import { Mail, MailOpen, MessageCircle, Phone, Reply, Trash2 } from 'lucide-react';
import {
  formatDateTime,
  formatKenyanPhone,
  isValidKenyanPhone,
  telLink,
  whatsappLink,
  type MessageStatus,
} from '@areqa/shared';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill, type PillTone } from '@/components/ui/StatusPill';
import { deleteMessage, setMessageStatus, useMessagesLive } from '@/features/messages/api';
import { toast } from '@/features/ui/toastStore';
import { cn } from '@/lib/cn';

const TONE: Record<MessageStatus, PillTone> = { new: 'warn', read: 'mist', replied: 'mint' };

export default function MessagesPage() {
  const { data, loading } = useMessagesLive();
  const [filter, setFilter] = useState<MessageStatus | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const rows = useMemo(
    () => data.filter((m) => filter === 'all' || m.status === filter),
    [data, filter],
  );
  const open = data.find((m) => m.id === openId) ?? null;

  // Opening a new message marks it read — once, so "Mark unread" sticks.
  const autoRead = useRef(new Set<string>());
  useEffect(() => {
    if (!open || open.status !== 'new' || autoRead.current.has(open.id)) return;
    autoRead.current.add(open.id);
    void setMessageStatus(open.id, 'read');
  }, [open]);

  return (
    <>
      <PageHeader title="Messages" description="Contact form submissions from the store." />
      <div className="mb-4 flex gap-1" role="tablist">
        {(['all', 'new', 'read', 'replied'] as const).map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={filter === s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded px-3 py-2 text-sm font-medium capitalize',
              filter === s ? 'bg-ink text-paper' : 'bg-paper text-muted hover:text-ink',
            )}
          >
            {s}{' '}
            <span className="ml-1 opacity-70">
              {s === 'all' ? data.length : data.filter((m) => m.status === s).length}
            </span>
          </button>
        ))}
      </div>
      {loading ? (
        <Skeleton className="h-96" />
      ) : data.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Mail}
            title="No messages yet"
            body="Messages sent from the Contact page land here."
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
          <ul className="card divide-line max-h-[70vh] divide-y overflow-y-auto">
            {rows.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => setOpenId(m.id)}
                  className={cn(
                    'hover:bg-mist/60 w-full p-4 text-left transition-colors',
                    openId === m.id && 'bg-mint/30',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'truncate text-sm',
                        m.status === 'new' ? 'font-bold' : 'font-medium',
                      )}
                    >
                      {m.name}
                    </span>
                    <span className="text-muted shrink-0 text-xs">
                      {formatDateTime(m.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm">{m.subject || 'No subject'}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-muted truncate text-xs">{m.message}</p>
                    <StatusPill tone={TONE[m.status]}>{m.status}</StatusPill>
                  </div>
                </button>
              </li>
            ))}
            {rows.length === 0 && (
              <li className="text-muted p-6 text-center text-sm">Nothing here.</li>
            )}
          </ul>
          <section className="card p-6" aria-live="polite">
            {!open ? (
              <EmptyState icon={MailOpen} title="Select a message" />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg">{open.subject || 'No subject'}</h2>
                    <p className="text-muted text-sm">
                      {open.name} · {open.email} · {formatDateTime(open.createdAt)}
                    </p>
                  </div>
                  <StatusPill tone={TONE[open.status]}>{open.status}</StatusPill>
                </div>
                <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed">
                  {open.message}
                </p>
                <div className="border-line mt-8 flex flex-wrap gap-2 border-t pt-5">
                  <a
                    href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject || 'Your message'}`)}`}
                    onClick={() => void setMessageStatus(open.id, 'replied')}
                    className="bg-ink text-paper hover:bg-mint hover:text-ink inline-flex items-center gap-2 rounded px-4 py-2 text-xs font-semibold uppercase"
                  >
                    <Reply className="size-4" /> Reply by email
                  </a>
                  {open.phone && isValidKenyanPhone(open.phone) && (
                    <>
                      <a
                        href={whatsappLink(
                          open.phone,
                          `Hi ${open.name.split(' ')[0]}, thanks for contacting us.`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => void setMessageStatus(open.id, 'replied')}
                        className="border-line hover:border-ink inline-flex items-center gap-2 rounded border px-4 py-2 text-xs font-semibold uppercase"
                      >
                        <MessageCircle className="size-4" /> WhatsApp
                      </a>
                      <a
                        href={telLink(open.phone)}
                        className="border-line hover:border-ink inline-flex items-center gap-2 rounded border px-4 py-2 text-xs font-semibold uppercase"
                      >
                        <Phone className="size-4" /> {formatKenyanPhone(open.phone)}
                      </a>
                    </>
                  )}
                  {open.status !== 'replied' && (
                    <button
                      onClick={() => void setMessageStatus(open.id, 'replied')}
                      className="text-xs underline"
                    >
                      Mark replied
                    </button>
                  )}
                  {open.status !== 'new' && (
                    <button
                      onClick={() => void setMessageStatus(open.id, 'new')}
                      className="text-xs underline"
                    >
                      Mark unread
                    </button>
                  )}
                  <button
                    onClick={() => setDeleting(open.id)}
                    className="text-danger-deep ml-auto inline-flex items-center gap-1 text-xs"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        danger
        title="Delete message?"
        body="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteMessage(deleting!);
          setOpenId(null);
          toast.success('Message deleted');
        }}
      />
    </>
  );
}
