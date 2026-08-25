import { useEffect, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Nav } from '../../components/Nav';
import { Footer } from '../../sections/Footer';
import { PRODUCTS, productFor } from '../../data/products';
import { BlogCover } from './BlogCover';
import { CardText, PostCard } from './PostCard';
import { BLOG_CATEGORIES, sortedPosts, type BlogCategory } from './blogData';
import './blog.css';

const PER_PAGE = 9;

const CATEGORY_SET = new Set<string>(BLOG_CATEGORIES);

function parseTags(params: URLSearchParams): BlogCategory[] {
  const seen = new Set<BlogCategory>();
  for (const value of params.getAll('tag')) {
    if (CATEGORY_SET.has(value)) seen.add(value as BlogCategory);
  }
  return BLOG_CATEGORIES.filter((tag) => seen.has(tag));
}

/** Build the /blog query string. Filter changes always pass page 1 so we drop it. */
function blogSearch(product: string | null, tags: readonly string[], page: number): string {
  const sp = new URLSearchParams();
  if (product) sp.set('product', product);
  for (const tag of tags) sp.append('tag', tag);
  if (page > 1) sp.set('page', String(page));
  const s = sp.toString();
  return s ? `?${s}` : '';
}

function toggleTag(tags: readonly BlogCategory[], tag: BlogCategory): BlogCategory[] {
  return tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
}

function filterSummary(productLabel: string | null, tags: readonly string[]): string {
  const parts = [productLabel, ...tags].filter((part): part is string => Boolean(part));
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export function BlogIndex() {
  const [params, setParams] = useSearchParams();

  // Only honor a product filter that maps to a real product; anything else
  // (typo, stale link) falls back to the unfiltered "All" view.
  const activeProduct = productFor(params.get('product'))?.key ?? null;
  const activeTags = parseTags(params);
  const hasFilter = activeProduct !== null || activeTags.length > 0;

  const posts = sortedPosts();
  const filtered = posts.filter((post) => {
    if (activeProduct && post.product !== activeProduct) return false;
    if (activeTags.length > 0 && !activeTags.includes(post.category)) return false;
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
  // A leftover page from a previous tag (e.g. page 5 after a 3-page filter)
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

  const tagKey = activeTags.join(',');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, activeProduct, tagKey]);

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

        <div className="blog-filters">
          <div className="blog-filter" role="group" aria-label="Filter posts by product">
            <Link
              to={{ pathname: '/blog', search: blogSearch(null, activeTags, 1) }}
              className={`blog-filter-pill${activeProduct === null ? ' is-active' : ''}`}
              aria-current={activeProduct === null ? 'true' : undefined}
            >
              All posts
            </Link>
            {PRODUCTS.map((product) => {
              const isActive = activeProduct === product.key;
              return (
                <Link
                  key={product.key}
                  to={{ pathname: '/blog', search: blogSearch(product.key, activeTags, 1) }}
                  className={`blog-filter-pill${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                  style={{ '--pc': product.color } as CSSProperties}
                >
                  <img
                    src={product.icon}
                    alt=""
                    aria-hidden="true"
                    className="blog-filter-icon"
                    width={18}
                    height={18}
                  />
                  {product.label}
                </Link>
              );
            })}
          </div>

          <div className="blog-tags" role="group" aria-labelledby="blog-tags-label">
            <span className="blog-tags-label" id="blog-tags-label">
              Tags
            </span>
            {BLOG_CATEGORIES.map((tag) => {
              const isActive = activeTags.includes(tag);
              return (
                <Link
                  key={tag}
                  to={{
                    pathname: '/blog',
                    search: blogSearch(activeProduct, toggleTag(activeTags, tag), 1),
                  }}
                  className={`blog-tag${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {tag}
                  {isActive ? (
                    <span className="blog-tag-x" aria-hidden="true">
                      ×
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
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
            summary={filterSummary(productFor(activeProduct)?.label ?? null, activeTags)}
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
              search={blogSearch(activeProduct, activeTags, page - 1)}
              disabled={page <= 1}
              label="‹ Prev"
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PageLink
                key={p}
                search={blogSearch(activeProduct, activeTags, p)}
                label={String(p)}
                active={p === page}
              />
            ))}
            <PageLink
              search={blogSearch(activeProduct, activeTags, page + 1)}
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
          ? `Nothing is tagged ${summary}. Try another combination, or browse everything.`
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
