import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: Breadcrumb[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="flex items-center gap-1.5">
                {item.href && !isLast ? (
                  <Link to={item.href} className="transition-colors hover:text-text">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className="text-text">
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <ChevronRight className="size-3.5 text-text-tertiary" aria-hidden="true" />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
