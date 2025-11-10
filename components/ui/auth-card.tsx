import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col rounded-3xl border border-sky-200/70 bg-white/85 p-8 shadow-[0_25px_60px_-30px_rgba(14,116,234,0.7)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_35px_70px_-25px_rgba(14,116,234,0.75)] dark:border-sky-900/50 dark:bg-slate-900/80 dark:shadow-black/40">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
      {footer ? <div className="mt-8 text-center text-sm">{footer}</div> : null}
    </div>
  );
}

