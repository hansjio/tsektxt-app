import { MethodologyContent } from "@/components/MethodologyContent";

export default function DashboardMethodsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Methods</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Model methodology</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-base">Three classifiers, side by side, with Integrated Gradients word highlights.</p>
      </div>
      <MethodologyContent compact />
    </div>
  );
}
