import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border-primary/15 group-[.toaster]:bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(255,247,250,0.9)_58%,rgba(255,249,235,0.84)_100%)] group-[.toaster]:text-foreground group-[.toaster]:shadow-[0_18px_36px_rgba(36,50,79,0.2)]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:shadow-[0_8px_18px_rgba(95,20,40,0.2)]",
          cancelButton: "group-[.toast]:bg-white/70 group-[.toast]:text-muted-foreground group-[.toast]:border group-[.toast]:border-primary/15",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
