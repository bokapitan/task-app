import Link from "next/link";
import { UserCircle, Wand2 } from "lucide-react";

const Header = () => {
  return (
    // Updated container: Glass effect + bottom border + sticky positioning
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        {/* Left Side: Logo & Brand */}
        <Link href={"/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {/* The "Minty" Logo Container */}
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">TaskAI</span>
        </Link>

        {/* Right Side: Profile Link */}
        <Link href="/profile">
          <div className="p-2 hover:bg-accent rounded-full transition-colors">
            <UserCircle className="w-6 h-6 text-muted-foreground hover:text-foreground" />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;