import { Camera } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-3">
          <Camera className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-headline">
            InstaTransform
          </h1>
        </div>
      </div>
    </header>
  );
}
