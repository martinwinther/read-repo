'use client';

import { LoginForm } from '@/components/ui/LoginForm';
import { SignUpForm } from '@/components/ui/SignUpForm';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';

export default function LoginPage() {
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/books');
      }
    };
    checkUser();
  }, [router, supabase]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center space-x-4 mb-4">
          <Button 
            variant={view === 'sign-in' ? 'default' : 'outline'}
            onClick={() => setView('sign-in')}
          >
            Sign In
          </Button>
          <Button 
            variant={view === 'sign-up' ? 'default' : 'outline'}
            onClick={() => setView('sign-up')}
          >
            Sign Up
          </Button>
        </div>
        
        {view === 'sign-in' ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  );
}