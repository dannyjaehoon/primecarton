'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestEmailVerification } from '@/lib/actions/user.actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

type Props = {
  initialEmail?: string;
};

const VerifyEmailButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Sending...' : 'Send verification email'}
    </Button>
  );
};

const VerifyEmailRequestForm = ({ initialEmail }: Props) => {
  const [state, formAction] = useActionState(requestEmailVerification, {
    success: false,
    message: '',
    verified: false,
  });

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2 text-left">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initialEmail}
          placeholder="you@example.com"
          required
        />
      </div>
      <VerifyEmailButton />

      {state?.message && (
        <div
          className={state.success ? 'text-sm text-green-600' : 'text-sm text-destructive'}
        >
          {state.message}
        </div>
      )}
    </form>
  );
};

export default VerifyEmailRequestForm;
