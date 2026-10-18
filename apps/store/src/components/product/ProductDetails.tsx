import { Link } from 'react-router-dom';
import { formatKES, type Product } from '@areqa/shared';
import { useDeliveryZones, useSettings } from '@/features/content/hooks';
import { AccordionItem } from '@/components/ui/Accordion';

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="mb-3 last:mb-0">
          {p}
        </p>
      ))}
    </>
  );
}

export function ProductDetails({ product }: { product: Product }) {
  const { data: zones = [] } = useDeliveryZones();
  const { settings } = useSettings();
  return (
    <div className="border-line mt-10 border-t">
      <AccordionItem title="Description" defaultOpen>
        <Paragraphs text={product.description} />
      </AccordionItem>
      <AccordionItem title="Material & care">
        <Paragraphs text={product.materialCare} />
      </AccordionItem>
      <AccordionItem title="Delivery & returns">
        {zones.length > 0 && (
          <ul className="mb-4 space-y-1.5">
            {zones.map((z) => (
              <li key={z.id} className="flex justify-between gap-4">
                <span>
                  <span className="text-ink font-medium">{z.name}</span> · {z.estimatedDays}
                </span>
                <span className="text-ink shrink-0">{formatKES(z.fee)}</span>
              </li>
            ))}
          </ul>
        )}
        {settings.freeDeliveryThreshold > 0 && (
          <p className="mb-3">
            Free delivery on orders over {formatKES(settings.freeDeliveryThreshold)}.
          </p>
        )}
        <p>
          Unworn items with tags can be exchanged or returned within 7 days.{' '}
          <Link to="/returns" className="text-ink font-medium underline underline-offset-4">
            Returns policy
          </Link>
        </p>
      </AccordionItem>
    </div>
  );
}
