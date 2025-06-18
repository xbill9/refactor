import Link from 'next/link';
import { Code2, Settings } from 'lucide-react'; // Added Settings icon
// import AuthButtons from './AuthButtons'; // AuthButtons removed
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Code2 className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary font-headline">PHP Refactor Pro</span>
        </Link>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-1">
            <Button variant="ghost" asChild size="sm">
              <Link href="/advanced-config" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Advanced Config
              </Link>
            </Button>
            {/* Add other nav links here if needed in future */}
          </nav>
          <div className="md:hidden"> {/* Mobile menu trigger for settings */}
            <Button variant="ghost" asChild size="icon">
                <Link href="/advanced-config">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Advanced Config</span>
                </Link>
            </Button>
          </div>
          {/* <AuthButtons /> */} {/* AuthButtons removed */}
        </div>
      </div>
    </header>
  );
}
