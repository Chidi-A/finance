import { zodResolver } from "@hookform/resolvers/zod"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AuthLayout } from "@/components/Common/AuthLayout"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"

const formSchema = z
  .object({
    email: z.email(),
    full_name: z.string().min(1, { message: "Full Name is required" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z
      .string()
      .min(1, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "The passwords don't match",
    path: ["confirm_password"],
  })

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Sign Up - FastAPI Template",
      },
    ],
  }),
})

function SignUp() {
  const { signUpMutation } = useAuth()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  })

  const onSubmit = (data: FormData) => {
    if (signUpMutation.isPending) return

    // exclude confirm_password from submission data
    const { confirm_password: _confirm_password, ...submitData } = data
    signUpMutation.mutate(submitData)
  }

  return (
    <AuthLayout>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="bg-white rounded-xl p-8">
            <div className="flex mb-8">
              <h1 className="text-3xl font-bold">Sign Up</h1>
            </div>

            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Name</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="full-name-input"
                        placeholder=""
                        type="text"
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
                name="email"
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
                    <FormLabel className="text-xs font-bold">
                      Create Password
                    </FormLabel>
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

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        data-testid="confirm-password-input"
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
                loading={signUpMutation.isPending}
                className="h-14 bg-[#201F24] hover:bg-[#201F24]/90 text-white rounded-[0.5rem] mt-4 mb-8"
              >
                Create Account
              </LoadingButton>
            </div>

            <div className="text-center text-sm text-[#69686b]">
              Already have an account?{" "}
              <RouterLink
                to="/login"
                className="underline underline-offset-4 text-[#201F24] font-bold"
              >
                Login
              </RouterLink>
            </div>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}

export default SignUp
