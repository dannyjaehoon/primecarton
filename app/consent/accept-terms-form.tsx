'use client';

import { Button } from "@/components/ui/button";
import { acceptTermsAndConsent } from "@/lib/actions/user.actions";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AcceptTermsForm = ({ callbackUrl }: { callbackUrl: string }) => {
  const [state, formAction] = useActionState(acceptTermsAndConsent, {
    success: false,
    message: '',
    redirectTo: '',
  });
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push(state.redirectTo || callbackUrl || "/");
    }
  }, [state?.success, state?.redirectTo, router, callbackUrl]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="termsAgreed" required className="mt-1 h-4 w-4 accent-muted-foreground" />
        <span className="leading-relaxed">
          I agree to the{" "}
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="link font-medium">Terms of Service</button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Terms of Service</DialogTitle>
                <div className="space-y-2 text-left text-sm text-muted-foreground">
                  <div>Use this service responsibly. Do not abuse, scrape, or attack the site.</div>
                  <div>Accounts may be suspended for fraud, abuse, or policy violations.</div>
                  <div>All purchases are subject to our posted return and refund policies.</div>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          {" "}and{" "}
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="link font-medium">Privacy Policy</button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Privacy Policy</DialogTitle>
                <div className="space-y-2 text-left text-sm text-muted-foreground">
                  <div>We collect the info you provide (name, email, phone) to create and manage your account.</div>
                  <div>We use it to process orders, send service emails, and improve the site. Marketing is only if you consent.</div>
                  <div>We share data only with essential providers (payments, email, hosting) and never sell your personal data.</div>
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          .
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="marketingConsent" className="mt-1 h-4 w-4 accent-muted-foreground" />
        <span>Send me marketing updates (optional).</span>
      </label>
      <Button type="submit" className="w-full">Agree and continue</Button>
      {state?.message && (
        <div className={state.success ? "text-center text-green-600 text-sm" : "text-center text-destructive text-sm"}>
          {state.message}
        </div>
      )}
    </form>
  );
};

export default AcceptTermsForm;
