import { formatKES } from '@areqa/shared';
import { Img } from '@/components/ui/Img';

interface MiniItem {
  name: string;
  image: string;
  color: string;
  size: string;
  qty: number;
  price: number;
}

export function OrderItemsMini({ items }: { items: MiniItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((i) => (
        <li key={`${i.name}-${i.color}-${i.size}`} className="flex gap-3">
          <div className="relative w-14 shrink-0">
            <Img
              src={i.image}
              alt=""
              aspect={0.8}
              sizes="56px"
              maxWidth={320}
              className="aspect-product w-full rounded object-cover"
            />
            <span className="bg-ink text-paper absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
              {i.qty}
            </span>
          </div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="line-clamp-2 font-medium">{i.name}</p>
            <p className="text-muted text-xs">
              {i.color} · {i.size}
            </p>
          </div>
          <p className="text-sm font-medium">{formatKES(i.price * i.qty)}</p>
        </li>
      ))}
    </ul>
  );
}
