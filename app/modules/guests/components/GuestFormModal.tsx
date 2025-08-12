'use client';

import { Button, Checkbox, Modal, NumberInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { GuestRow } from '../types/guest';

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: GuestRow) => void;
  initial?: GuestRow;
  mode?: 'add' | 'edit';
}

export default function GuestFormModal({
  opened,
  onClose,
  onSubmit,
  initial,
  mode = 'add',
}: Props) {
  const form = useForm<GuestRow>({
    initialValues: initial || {
      name: '',
      is_matrimony_attendee: false,
      is_celebration_attendee: false,
      is_fixed_pax: false,
      pax_limit: 0,
      wedding_code: '',
    },
    validate: {
    name: (value: string) =>
      value.trim().length < 2 ? 'Name too short' : null,
    pax_limit: (value: number) =>
      value < 0 ? 'Pax limit must be 0 or greater' : null,
  },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'add' ? 'Add Guest' : 'Edit Guest'}
      centered
    >
      <form
        onSubmit={form.onSubmit((values) => {
          onSubmit(values);
          form.reset();
          onClose();
        })}
      >
        <TextInput
          label="Name"
          {...form.getInputProps('name')}
          required
        />

        <Checkbox
          label="Matrimony Attendee"
          {...form.getInputProps('is_matrimony_attendee', { type: 'checkbox' })}
          mt="sm"
        />

        <Checkbox
          label="Celebration Attendee"
          {...form.getInputProps('is_celebration_attendee', { type: 'checkbox' })}
          mt="sm"
        />

        <Checkbox
          label="Fixed Pax"
          {...form.getInputProps('is_fixed_pax', { type: 'checkbox' })}
          mt="sm"
        />

        <NumberInput
          label="Pax Limit"
          {...form.getInputProps('pax_limit')}
          min={0}
          mt="sm"
        />

        <Button fullWidth type="submit" mt="md">
          {mode === 'add' ? 'Add' : 'Update'}
        </Button>
      </form>
    </Modal>
  );
}
