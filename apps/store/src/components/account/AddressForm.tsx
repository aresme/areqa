import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KENYA_COUNTIES, isValidKenyanPhone, type Address } from '@areqa/shared';
import { Field, Input, Select, Textarea } from '@/components/form/Field';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  label: z.string().trim().min(1, 'e.g. Home or Work').max(30),
  name: z.string().trim().min(2, 'Enter the recipient name').max(80),
  phone: z.string().trim().refine(isValidKenyanPhone, 'Use a Kenyan number like 0712 345 678'),
  county: z.enum(KENYA_COUNTIES, { errorMap: () => ({ message: 'Choose a county' }) }),
  town: z.string().trim().min(2, 'Enter town or area').max(80),
  address: z.string().trim().min(3, 'Enter street, building or landmark').max(200),
  notes: z.string().trim().max(300),
  isDefault: z.boolean(),
});
type Form = z.infer<typeof schema>;

export function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<Address>;
  onSave: (a: Omit<Address, 'id'>) => Promise<void>;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: 'Home',
      name: '',
      phone: '',
      town: '',
      address: '',
      notes: '',
      isDefault: false,
      ...initial,
    } as Form,
  });
  const e = formState.errors;
  return (
    <form
      onSubmit={handleSubmit((v) => onSave(v))}
      noValidate
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Label" error={e.label?.message}>
        {(a) => <Input {...a} {...register('label')} />}
      </Field>
      <Field label="Recipient name" error={e.name?.message}>
        {(a) => <Input {...a} {...register('name')} autoComplete="name" />}
      </Field>
      <Field label="Phone" error={e.phone?.message}>
        {(a) => <Input {...a} {...register('phone')} type="tel" autoComplete="tel" />}
      </Field>
      <Field label="County" error={e.county?.message}>
        {(a) => (
          <Select {...a} {...register('county')}>
            <option value="">Choose county</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Town / area" error={e.town?.message}>
        {(a) => <Input {...a} {...register('town')} />}
      </Field>
      <Field label="Street, building & landmark" error={e.address?.message}>
        {(a) => <Input {...a} {...register('address')} />}
      </Field>
      <Field label="Delivery notes" optional className="sm:col-span-2">
        {(a) => <Textarea {...a} {...register('notes')} />}
      </Field>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" {...register('isDefault')} className="accent-ink size-4" /> Use as my
        default address
      </label>
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Saving…' : 'Save address'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
