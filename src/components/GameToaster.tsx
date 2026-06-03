import { Toaster } from "sonner";

export function GameToaster() {
  return (
    <Toaster
      theme="dark"
      position="top-center"
      toastOptions={{
        className: "font-mono",
        style: {
          background: "oklch(0.12 0.04 270)",
          border: "1px solid oklch(0.78 0.18 220 / 0.6)",
          color: "oklch(0.96 0.02 220)",
        },
      }}
    />
  );
}
