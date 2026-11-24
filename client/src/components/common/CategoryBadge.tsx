import { Link } from 'react-router-dom';
import { getCategoryMeta } from '../../lib/categories';

interface CategoryBadgeProps {
  category: string;
  clickable?: boolean;
  size?: 'xs' | 'sm';
}

export function CategoryBadge({ category, clickable = false, size = 'xs' }: CategoryBadgeProps) {
  const meta = getCategoryMeta(category);
  const sizeClass =
    size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-2 py-0.5 text-[10.5px]';

  const badge = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono font-medium uppercase tracking-wider transition ${sizeClass} ${meta.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {meta.shortLabel}
    </span>
  );

  if (clickable) {
    return (
      <Link
        to={`/category/${meta.slug}`}
        className="hover:brightness-110 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {badge}
      </Link>
    );
  }

  return badge;
}
