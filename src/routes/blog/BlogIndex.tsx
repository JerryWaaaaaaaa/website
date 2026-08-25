import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Nav } from '../../components/Nav';
import { Footer } from '../../sections/Footer';
import { PRODUCTS, productFor } from '../../data/products';
import { BlogCover } from './BlogCover';
import { BlogSelect, type BlogSelectOption } from './BlogSelect';
import { CardText, PostCard } from './PostCard';
import { BLOG_CATEGORIES, sortedPosts, type BlogCategory } from './blogData';
import './blog.css';

const PER_PAGE = 9;

const CATEGORY_SET = new Set<string>(BLOG_CATEGORIES);

const PRODUCT_OPTIONS: BlogSelectOption[] = [
  { value: null, label: 'All' },
  ...PRODUCTS.map((product) => ({
    value: product.key,
    label: product.label,
    icon: product.icon,
    color: product.color,
  })),
];

const TOPIC_OPTIONS: BlogSelectOption[] = [
  { value: null, label: 'All' },
  ...BLOG_CATEGORIES.map((tag) => ({ value: tag, label: tag })),
];

type OpenMenu = 'product' | 'topic' | null;

function parseTag(params: URLSearchParams): BlogCategory | null {
  const value = params.get('tag');
  return value && CATEGORY_SET.has(value) ? (value as BlogCategory) : null;
}

/** Build the /blog query string. Filter changes always pass page 1 so we drop it. */
function blogSearch(product: string | null, tag: string | null, page: number): string {
  const sp = new URLSearchParams();
  if (product) sp.set('product', product);
  if (tag) sp.set('tag', tag);
  if (page > 1) sp.set('page', String(page));
  const s = sp.toString();
  return s ? `?${s}` : '';
}

function filterSummary(productLabel: string | null, tag: string | null): string {
  const parts = [productLabel, tag].filter((part): part is string => Boolean(part));
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts[0]} and ${parts[1]}`;
}

export function BlogIndex() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);

  // Only honor a product / topic that maps to a real option; anything else
  // (typo, stale link) falls back to the unfiltered "All" view for that facet.
  const activeProduct = productFor(params.get('product'))?.key ?? null;
  const activeTag = parseTag(params);
  const hasFilter = activeProduct !== null || activeTag !== null;

  const posts = sortedPosts();
  const filtered = posts.filter((post) => {
    if (activeProduct && post.product !== activeProduct) return false;
    if (activeTag && post.category !== activeTag) return false;
    return true;
  });

  // The featured hero is part of the designed "All" landing; a filtered view
  // shows every matching post in the plain grid instead.
  const showFeatured = !hasFilter;
  const featured = showFeatured ? filtered[0] : undefined;
  const rest = showFeatured ? filtered.slice(1) : filtered;

  const totalPages = Math.ceil(rest.length / PER_PAGE);
  const rawPage = Number(params.get('page'));
  const requestedPage = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  // A leftover page from a previous filter (e.g. page 5 after a 3-page filter)
  // always snaps back to page 1 — never clamps to the last available page.
  const pageOutOfRange = requestedPage > 1 && (totalPages === 0 || requestedPage > totalPages);
  const page = pageOutOfRange ? 1 : Math.min(Math.max(1, requestedPage), Math.max(1, totalPages));
  const slice = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const isEmpty = filtered.length === 0;

  useEffect(() => {
    if (!pageOutOfRange) return;
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  }, [pageOutOfRange, setParams]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, activeProduct, activeTag]);

  const goTo = (product: string | null, tag: string | null) => {
    setOpenMenu(null);
    navigate({ pathname: '/blog', search: blogSearch(product, tag, 1) });
  };

  return (
    <>
      <Nav />
      <div className="blog-root">
        <main className="blog-page">
          <header className="blog-masthead">
            <h1 className="h1">Updates on AI Productivity Suite</h1>
            <p className="blog-masthead-sub">
              Product news, engineering deep-dives, and stories from the teams building the agentic
              workspace.
            </p>
          </header>

          <div className="blog-filters" role="group" aria-label="Filter posts">
            <BlogSelect
              label="Product"
              value={activeProduct}
              options={PRODUCT_OPTIONS}
              open={openMenu === 'product'}
              onOpenChange={(open) => setOpenMenu(open ? 'product' : null)}
              onChange={(value) => goTo(value, activeTag)}
            />
            <BlogSelect
              label="Topic"
              value={activeTag}
              options={TOPIC_OPTIONS}
              open={openMenu === 'topic'}
              onOpenChange={(open) => setOpenMenu(open ? 'topic' : null)}
              onChange={(value) => goTo(activeProduct, value)}
            />
            {hasFilter ? (
              <button type="button" className="blog-filters-clear" onClick={() => goTo(null, null)}>
                Clear
              </button>
            ) : null}
          </div>

          {page === 1 && featured && (
            <Link to={`/blog/${featured.slug}`} className="blog-featured">
              <div className="card-body blog-featured-body">
                <CardText post={featured} />
              </div>
              <BlogCover slug={featured.slug} className="bc--featured" size={560} />
            </Link>
          )}

          {isEmpty ? (
            <EmptyState
              summary={filterSummary(productFor(activeProduct)?.label ?? null, activeTag)}
            />
          ) : (
            <div className="blog-grid">
              {slice.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {!isEmpty && totalPages > 1 && (
            <nav className="blog-pagination" aria-label="Blog pagination">
              <PageLink
                search={blogSearch(activeProduct, activeTag, page - 1)}
                disabled={page <= 1}
                label="‹ Prev"
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PageLink
                  key={p}
                  search={blogSearch(activeProduct, activeTag, p)}
                  label={String(p)}
                  active={p === page}
                />
              ))}
              <PageLink
                search={blogSearch(activeProduct, activeTag, page + 1)}
                disabled={page >= totalPages}
                label="Next ›"
              />
            </nav>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

function EmptyState({ summary }: { summary: string }) {
  return (
    <section className="blog-empty" aria-live="polite">
      <h2 className="blog-empty-title">No matching posts</h2>
      <p className="blog-empty-copy">
        {summary
          ? `Nothing matches ${summary}. Try another combination, or browse everything.`
          : 'Nothing to show yet. Check back soon.'}
      </p>
      <Link to="/blog" className="btn btn-secondary">
        View all posts
      </Link>
    </section>
  );
}

function PageLink({
  search,
  label,
  disabled = false,
  active = false,
}: {
  search: string;
  label: string;
  disabled?: boolean;
  active?: boolean;
}) {
  if (disabled) return <span className="blog-page-btn is-disabled">{label}</span>;
  return (
    <Link
      to={{ pathname: '/blog', search }}
      className={`blog-page-btn${active ? ' is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  );
}
