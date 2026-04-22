import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap ${className}`}>
      <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5 group">
        <Home className="w-3 h-3 text-secondary group-hover:scale-110 transition-transform" />
        Beranda
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-3 h-3 text-gray-300" />
          {item.path ? (
            <Link to={item.path} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-primary italic">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
