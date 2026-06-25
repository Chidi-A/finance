import { Logo } from '@/components/Common/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[0.6fr_1fr] ">
      <div className="relative hidden lg:flex lg:flex-col bg-zinc-900 rounded-2xl m-5 overflow-hidden">
        {/* Logo top-left */}
        <div className="absolute top-10 left-10 z-10">
          <Logo className="h-8" asLink={false} />
        </div>

        {/* Illustration fills the panel */}
        <img
          src="/assets/images/illustration-authentication.svg"
          alt="Authentication illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Bottom text */}
        <div className="absolute bottom-10 left-10 right-30 z-10 text-white">
          <h2 className="text-[2rem] leading-tight font-bold mb-2">
            Keep track of your money and save for your future
          </h2>
          <p className="text-sm text-zinc-300">
            Personal finance app puts you in control of your spending. Track
            transactions, set budgets, and add to savings pots easily.
          </p>
        </div>
      </div>

      <div className="flex flex-col min-h-svh lg:min-h-0">
        <div className="flex items-center justify-center bg-[#201F24] px-6 py-8 lg:hidden [&_div]:pl-0 rounded-bl-[0.5rem] rounded-br-[0.5rem]">
          <Logo className="h-8 pl-0" asLink={false} />
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6 md:p-10">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[560px]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
