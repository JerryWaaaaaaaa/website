import { useEffect, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Nav } from '../../components/Nav';
import { Footer } from '../../sections/Footer';
import { PRODUCTS, productFor } from '../../data/products';
import { BlogCover } from './BlogCover';
import { CardText, PostCard } from './PostCard';
import { sortedPosts } from './blogData';
import './blog.css';

const PER_PAGE = 9;

/** Build the /blog query string from the active filter + page (both optional). */
function blogSearch(product: string | null, page: number): string {
  const sp = new URLSearchParams();
  if (product) sp.set('product', product);
  if (page > 1) sp.set('page', String(page));
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function BlogIndex() {
  const [params] = useSearchParams();

  // Only honor a product filter that maps to a real product; anything else
  // (typo, stale link) falls back to the unfiltered "All" view.
  const activeProduct = productFor(params.get('product'))?.key ?? null;

  const posts = sortedPosts();
  const filtered = activeProduct ? posts.filter((p) => p.product === activeProduct) : posts;

  // The featured hero is part of the designed "All" landing; a filtered view
  // shows every matching post in the plain grid instead.
  const showFeatured = !activeProduct;
  const featured = showFeatured ? filtered[0] : undefined;
  const rest = showFeatured ? filtered.slice(1) : filtered;

  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const page = Math.min(totalPages, Math.max(1, Number(params.get('page')) || 1));
  const slice = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page, activeProduct]);

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

        <div className="blog-filter" role="group" aria-label="Filter posts by product">
          <Link
            to={{ pathname: '/blog', search: blogSearch(null, 1) }}
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
                to={{ pathname: '/blog', search: blogSearch(product.key, 1) }}
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

        {page === 1 && featured && (
          <Link to={`/blog/${featured.slug}`} className="blog-featured">
            <div className="card-body blog-featured-body">
              <CardText post={featured} />
            </div>
            <BlogCover slug={featured.slug} className="bc--featured" size={560} />
          </Link>
        )}

        {slice.length > 0 ? (
          <div className="blog-grid">
            {slice.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="blog-empty">No posts yet for this product — check back soon.</p>
        )}

        {totalPages > 1 && (
          <nav className="blog-pagination" aria-label="Blog pagination">
            <PageLink
              search={blogSearch(activeProduct, page - 1)}
              disabled={page <= 1}
              label="‹ Prev"
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PageLink
                key={p}
                search={blogSearch(activeProduct, p)}
                label={String(p)}
                active={p === page}
              />
            ))}
            <PageLink
              search={blogSearch(activeProduct, page + 1)}
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
