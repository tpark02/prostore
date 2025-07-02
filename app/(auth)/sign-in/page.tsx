import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import CredentialsSignInForm from './credentials-signin-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sign In',
};

const SignInPage = async (props: {
  searchParams: Promise<{ callbackUrl: string }>;
}) => {
  const { callbackUrl } = await props.searchParams;
  console.log(callbackUrl);
  const session = await auth();
  console.log(session);
  if (session) {
    console.log(8);
    return redirect(callbackUrl || '/');
  }
  console.log(9);
  return (
    <div className="w-full max-w-md max-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image
              src="/images/logo.svg"
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
              priority={true}
            />
          </Link>
        </CardHeader>
        <CardTitle className="text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account
        </CardDescription>
        <CardContent className="space-y-4">
          {/* FORM */}
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
