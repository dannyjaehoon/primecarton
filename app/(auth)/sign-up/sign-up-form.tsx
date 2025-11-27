'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { signUpDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react"; 
import { requestEmailVerification, signUpUser } from "@/lib/actions/user.actions";
import { useSearchParams} from "next/navigation";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type Props = {
    initialEmail?: string;
    verifiedEmail?: string;
}

const SignUpForm = ({ initialEmail, verifiedEmail }: Props) => {
    const [data, action] = useActionState(signUpUser, { success: false, message: '', email: ''});
    const [verifyState, verifyAction] = useActionState(requestEmailVerification, { success: false, message: '', verified: false});
    const [email, setEmail] = useState(initialEmail || signUpDefaultValues.email);
    const [name, setName] = useState(signUpDefaultValues.name);
    const [phone, setPhone] = useState(signUpDefaultValues.phone);
    const [password, setPassword] = useState(signUpDefaultValues.password);
    const [confirmPassword, setConfirmPassword] = useState(signUpDefaultValues.confirmPassword);
    const [termsAgreed, setTermsAgreed] = useState(signUpDefaultValues.termsAgreed);
    const [marketingConsent, setMarketingConsent] = useState(signUpDefaultValues.marketingConsent);
    const [showTerms, setShowTerms] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);
    const draftKey = 'signup-draft';
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail);
        }
    }, [initialEmail]);

    // On successful sign up, notify and redirect to sign-in
    useEffect(() => {
        if (data?.success) {
            toast({
                variant: 'default',
                description: data.message || 'Account created. Please sign in.',
            });
            const next = callbackUrl ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/sign-in';
            router.push(next);
        }
    }, [data?.success, data?.message, router, toast, callbackUrl]);

    // Restore draft for non-email fields on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = window.localStorage.getItem(draftKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.name) setName(parsed.name);
                if (parsed.phone) setPhone(parsed.phone);
                if (typeof parsed.termsAgreed === 'boolean') setTermsAgreed(parsed.termsAgreed);
                if (typeof parsed.marketingConsent === 'boolean') setMarketingConsent(parsed.marketingConsent);
            } catch {
                // ignore malformed draft
            }
        }
    }, []);

    // Persist draft for non-sensitive fields
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const payload = { name, phone, termsAgreed, marketingConsent };
        window.localStorage.setItem(draftKey, JSON.stringify(payload));
    }, [name, phone, termsAgreed, marketingConsent]);

    // Clear draft after successful signup
    useEffect(() => {
        if (data?.success) {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(draftKey);
            }
        }
    }, [data?.success, draftKey]);

    const emailIsLocked = verifyState?.verified === true || (!!verifiedEmail && verifiedEmail === email);
    const emailIsVerified = emailIsLocked;

    const canSubmit = emailIsLocked && termsAgreed;

    return <form action={action} className="space-y-6">
        <Input type='hidden' name="callbackUrl" value={callbackUrl}></Input>
        <Input type='hidden' name='marketingConsent' value={marketingConsent ? 'true' : 'false'} />
        <Input type='hidden' name='email' value={email} />
        <div className="space-y-2">
            <Label htmlFor='name' >Name</Label>
            <Input
                id='name'
                name='name'
                type='text'
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor='email' >Email</Label>
            <div className="flex gap-2">
                <Button
                    type="submit"
                    variant="outline"
                    formAction={verifyAction}
                    formNoValidate
                    disabled={emailIsLocked}
                    aria-label={emailIsVerified ? 'Email verified' : 'Verify email'}
                    title={emailIsVerified ? 'Email verified' : 'Verify email'}
                    className={`shrink-0 ${emailIsVerified ? 'bg-muted text-muted-foreground border border-muted-foreground/40 cursor-default hover:bg-muted' : ''}`}
                >
                    {emailIsVerified ? 'Verified ✓' : 'Verify'}
                </Button>
                <Input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={emailIsLocked}
                />
            </div>
            {verifyState?.message && (
                <div className={verifyState.success ? 'text-sm text-green-600' : 'text-sm text-destructive'}>
                    {verifyState.message}
                </div>
            )}
            {emailIsVerified && !verifyState?.message && (
                <div className="text-sm text-green-600">Email verified</div>
            )}
            {!emailIsLocked && (
                <div className="text-xs text-muted-foreground">Verify your email to enable sign up.</div>
            )}
        </div>
        <div className="space-y-2">
            <Label htmlFor='phone' >Phone</Label>
            <Input
                id='phone'
                name='phone'
                type='tel'
                inputMode="numeric"
                pattern="\d*"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D+/g, '');
                    setPhone(digitsOnly);
                }}
                required
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor='password' >Password</Label>
            <Input
                id='password'
                name='password'
                type='password'
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 chars, 1 uppercase"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor='confirmPassword' >Confirm Password</Label>
            <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
        </div>
        <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm">
                <input
                    type="checkbox"
                    name="termsAgreed"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-muted-foreground"
                    required
                />
                <span className="space-x-1">
                    <span>I agree to the</span>
                    <Dialog open={showTerms} onOpenChange={setShowTerms}>
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                className="link inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
                            >
                                Terms of Service
                                <span aria-hidden>↗</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
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
                    <span>and</span>
                    <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                className="link inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
                            >
                                Privacy Policy
                                <span aria-hidden>↗</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
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
                </span>
            </label>
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                    type="checkbox"
                    name="marketingConsent"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-muted-foreground"
                />
                <span>Send me marketing updates (optional).</span>
            </label>
        </div>
        <div>
            <Button disabled={!canSubmit} className="w-full" variant='default' type='submit'>
                Sign Up
            </Button>
        </div>
        
        { data && !data.success && data.message && (
            <div className="text-center text-destructive">
                {data.message}
            </div>
        )}
        <div className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href='/sign-in' target='_self' className='link'>Sign In</Link>
        </div>
    </form>
}
 
export default SignUpForm;
