import { zodResolver } from '@hookform/resolvers/zod';
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Body_login_login_access_token as AccessToken } from '@/client';
import { AuthLayout } from '@/components/Common/AuthLayout';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { PasswordInput } from '@/components/ui/password-input';
import useAuth, { isLoggedIn } from '@/hooks/useAuth';

const formSchema = z.object({
  username: z.email(),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
}) satisfies z.ZodType<AccessToken>;

type FormData = z.infer<typeof formSchema>;

export const Route = createFileRoute('/login')({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: '/',
      });
    }
  },
  head: () => ({
    meta: [
      {
        title: 'Log In - Finance App',
      },
    ],
  }),
});

function Login() {
  const { loginMutation } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: FormData) => {
    if (loginMutation.isPending) return;
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="bg-white rounded-xl p-8">
            <div className="flex mb-8">
              <h1 className="text-3xl font-bold">Login</h1>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Email</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="email-input"
                        placeholder=""
                        type="email"
                        {...field}
                        className="h-11 border-[#98908B]"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel className="text-xs font-bold">
                        Password
                      </FormLabel>
                    </div>
                    <FormControl>
                      <PasswordInput
                        data-testid="password-input"
                        placeholder=""
                        {...field}
                        className="h-11 border-[#98908B] dark:bg-transparent"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <LoadingButton
                type="submit"
                loading={loginMutation.isPending}
                className="h-14 bg-[#201F24] hover:bg-[#201F24]/90 text-white rounded-[0.5rem] mt-4 mb-8"
              >
                Login
              </LoadingButton>
            </div>

            <div className="text-center text-sm text-[#69686b]">
              Need to create an account?{' '}
              <RouterLink
                to="/signup"
                className="underline underline-offset-4 text-[#201F24] font-bold "
              >
                Sign up
              </RouterLink>
            </div>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
