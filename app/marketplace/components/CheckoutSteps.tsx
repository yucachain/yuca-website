import React from "react";
import { Check } from "lucide-react";

export interface CheckoutStepsProps {
  currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  { n: 1, title: "Shipping", subtitle: "Delivery Details" },
  { n: 2, title: "Review", subtitle: "Review & Place Order" },
  { n: 3, title: "Payment", subtitle: "Select Payment Method" },
] as const;




export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
      {STEPS.map((step, i) => {
        const isDone = step.n < currentStep;
        const isCurrent = step.n === currentStep;
        const isActive = isDone || isCurrent;

        return (
          <React.Fragment key={step.n}>
            <div className="flex items-center gap-2 sm:gap-3 font-sans">
              <span
                className={[
                  "flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-semibold",
                  isActive
                    ? "bg-emerald-800 text-white"
                    : "border-2 border-gray-300 bg-white text-gray-400",
                ].join(" ")}
              >
                {isDone ? <Check size={14} strokeWidth={2.5} /> : step.n}
              </span>
              <span>
                <span
                  className={[
                    "block text-xs sm:text-base font-semibold",
                    isActive ? "text-gray-900" : "text-gray-400",
                  ].join(" ")}
                >
                  {step.title}
                </span>
                <span
                  className={["hidden sm:block text-xs", isActive ? "text-gray-500" : "text-gray-300"].join(
                    " "
                  )}
                >
                  {step.subtitle}
                </span>
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <span className="hidden h-px w-6 sm:w-12 shrink-0 bg-gray-200 xs:block lg:w-20" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}