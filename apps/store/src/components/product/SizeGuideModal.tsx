import type { SizeGuide } from '@areqa/shared';
import { Modal } from '@/components/ui/Modal';

export function SizeGuideModal({
  guide,
  open,
  onClose,
}: {
  guide: SizeGuide | undefined;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Size guide">
      {guide ? (
        <>
          <p className="label text-muted mb-4">{guide.title}</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-ink border-b-2">
                  {guide.columns.map((c) => (
                    <th key={c} scope="col" className="py-3 pr-4 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guide.rows.map((row, i) => (
                  <tr key={i} className="border-line odd:bg-mist/50 border-b">
                    {row.cells.map((cell, j) =>
                      j === 0 ? (
                        <th key={j} scope="row" className="py-3 pr-4 font-semibold">
                          {cell}
                        </th>
                      ) : (
                        <td key={j} className="py-3 pr-4">
                          {cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {guide.note && <p className="text-muted mt-5 text-sm">{guide.note}</p>}
        </>
      ) : (
        <p className="text-muted text-sm">
          This item is one size. Message us on WhatsApp if you need measurements.
        </p>
      )}
    </Modal>
  );
}
