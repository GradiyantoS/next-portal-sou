'use client';

import { Button, Checkbox, Modal, NumberInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { StudentFormData } from '../types/student';

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => void;
  initial?: StudentFormData;
  mode?: 'add' | 'edit';
}

export default function StudentFormModal({
  opened,
  onClose,
  onSubmit,
  initial,
  mode = 'add',
}: Props) {
  const form = useForm<StudentFormData>({
    initialValues: initial || {
      name: '',
      nim: '',
      averageScore: 0,
      isAttending: true,
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name too short' : null),
      nim: (value) => (value.length < 2 ? 'NIM too short' : null),
      averageScore: (value) =>
        value < 0 || value > 100 ? 'Score must be 0-100' : null,
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={mode === 'add' ? 'Add Student' : 'Edit Student'}
      centered
    >
      <form
        onSubmit={form.onSubmit((values) => {
          onSubmit(values);
          form.reset();
          onClose();
        })}
      >
        <TextInput label="Name" {...form.getInputProps('name')} required />
        <TextInput
          label="NIM"
          {...form.getInputProps('nim')}
          required
          mt="sm"
        />
        <NumberInput
          label="Average Score"
          {...form.getInputProps('averageScore')}
          required
          mt="sm"
          min={0}
          max={100}
        />
        <Checkbox
          label="Is Attending"
          {...form.getInputProps('isAttending', { type: 'checkbox' })}
          mt="sm"
        />
        <Button fullWidth type="submit" mt="md">
          {mode === 'add' ? 'Add' : 'Update'}
        </Button>
      </form>
    </Modal>
  );
}
