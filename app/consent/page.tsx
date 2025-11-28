import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AcceptTermsForm from "./accept-terms-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const ConsentPage = async (props: { searchParams: Promise<{ callbackUrl?: string }> }) => {
  const { callbackUrl } = await props.searchParams;
  const session = await auth();

  if (!session) {
    return redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl || "/")}`);
  }

  // Already agreed -> go back
  if (session.user?.termsAgreed) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold">
            ✓
          </div>
          <CardTitle className="text-2xl">Review & continue</CardTitle>
          <CardDescription>Agree to the terms to finish setting up your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">What you&apos;re agreeing to</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the service responsibly and follow our policies.</li>
              <li>Your data is handled per our privacy policy.</li>
              <li>Marketing emails are optional—you can opt out anytime.</li>
            </ul>
          </div>
          <AcceptTermsForm callbackUrl={callbackUrl || "/"} />
          <p className="text-center text-sm text-muted-foreground">
            Want to sign out?{" "}
            <Link href="/sign-out" className="link">
              Sign out
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsentPage;
