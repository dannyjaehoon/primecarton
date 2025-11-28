'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useActionState } from "react"; 
import { useFormStatus } from 'react-dom';
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { useSearchParams} from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

const CredentialsSigninForm = () => {
    const [data, action] = useActionState(signInWithCredentials, { success: false, message: ''});

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const SignInButton = () => {
        const {pending} = useFormStatus();
        return (
            <Button disabled={pending} className="w-full" variant='default'>
                {pending ? 'Signing In ..' : 'Sign In'}
            </Button>
        )
    }

    return <form action={action}>
        <Input type='hidden' name="callbackUrl" value={callbackUrl}></Input>
        <div className="space-y-6">
            <div className="space-y-2">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => signIn('google', { callbackUrl })}
                >
                    <FcGoogle className="h-5 w-5" aria-hidden />
                    Continue with Google
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex-1 border-t border-border" />
                    <span>or</span>
                    <span className="flex-1 border-t border-border" />
                </div>
            </div>
            <div>
                <Label htmlFor='email' >Email</Label>
                <Input id='email' name='email' type='email' required autoComplete="email" defaultValue={signInDefaultValues.email}/>
            </div>
            <div>
                <Label htmlFor='password' >Password</Label>
                <Input id='password' name='password' type='password' required autoComplete="password" defaultValue={signInDefaultValues.password}/>
            </div>
            <div>
                <SignInButton/>
            </div>
            
            
            { data && !data.success && (
                <div className="text-center text-destructive">
                    {data.message}
                </div>
            )}
            <div className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href='/sign-up' target='_self' className='link'>Sign Up</Link>
            </div>
        </div>
    </form>
}
 
export default CredentialsSigninForm;
