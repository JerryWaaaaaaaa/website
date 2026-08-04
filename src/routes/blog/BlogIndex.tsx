import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Nav } from '../../components/Nav';
import { Footer } from '../../sections/Footer';
import { Chip } from '../../components/Chip';
import { BlogCover } from './BlogCover';
import { PostCard, PostMeta } from './PostCard';
import { sortedPosts } from './blogData';
import './blog.css';

const PER_PAGE = 9;

export function BlogIndex() {
  const [params] = useSearchParams();
  const posts = sortedPosts();
  const featured = posts[0];
  const rest = posts.slice(1);
  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const page = Math.min(totalPages, Math.max(1, Number(params.get('page')) || 1));
  const slice = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <>
      <Nav />
      <main className="blog-page">
        <header className="blog-masthead">
          <h1 className="h1">Blog</h1>
          <p className="blog-masthead-sub">
            Product news, engineering deep-dives, and stories from the teams building the agentic
            workspace.
          </p>
        </header>

        {page === 1 && featured && (
          <Link to={`/blog/${featured.slug}`} className="blog-featured">
            <BlogCover
              slug={featured.slug}
              text={featured.coverText ?? featured.title}
              className="bc--featured"
            />
            <div className="blog-featured-body">
              <Chip>Featured</Chip>
              <h2 className="blog-featured-title">{featured.title}</h2>
              <p className="blog-featured-excerpt">{featured.excerpt}</p>
              <PostMeta post={featured} showReadTime />
            </div>
          </Link>
        )}

        <div className="blog-divider">
          <span>Latest</span>
        </div>

        <div className="blog-grid">
          {slice.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="blog-pagination" aria-label="Blog pagination">
            <PageLink page={page - 1} disabled={page <= 1} label="‹ Prev" />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PageLink key={p} page={p} label={String(p)} active={p === page} />
            ))}
            <PageLink page={page + 1} disabled={page >= totalPages} label="Next ›" />
          </nav>
        )}
      </main>
      <Footer />
    </>
  );
}

function PageLink({
  page,
  label,
  disabled = false,
  active = false,
}: {
  page: number;
  label: string;
  disabled?: boolean;
  active?: boolean;
}) {
  if (disabled) return <span className="blog-page-btn is-disabled">{label}</span>;
  return (
    <Link
      to={{ pathname: '/blog', search: page <= 1 ? '' : `?page=${page}` }}
      className={`blog-page-btn${active ? ' is-active' : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  );
}
