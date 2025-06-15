import Link from 'next/link';
import { Code2 } from 'lucide-react';
import AuthButtons from './AuthButtons';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Code2 className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary font-headline">PHP Refactor Pro</span>
        </Link>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-4">
            {/* Add nav links here if needed in future */}
          </nav>
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
