import { Link } from 'react-router-dom';
import { BlogCover } from './BlogCover';
import { authorFor, formatDate, initials, type BlogPost } from './blogData';

/** Category · date meta row, reused on the featured block and the detail page. */
export function PostMeta({ post, showReadTime = false }: { post: BlogPost; showReadTime?: boolean }) {
  return (
    <div className="blog-meta">
      <span className="blog-cat">{post.category}</span>
      <span className="blog-dot" aria-hidden="true" />
      <span>{formatDate(post.date)}</span>
      {showReadTime && (
        <>
          <span className="blog-dot" aria-hidden="true" />
          <span>{post.readTime}</span>
        </>
      )}
    </div>
  );
}

/**
 * Grid card: the gradient tile IS the card. The title sits on the gradient;
 * the description + author reveal on hover/focus.
 */
export function PostCard({ post }: { post: BlogPost }) {
  const author = authorFor(post);
  return (
    <Link to={`/blog/${post.slug}`} className="blog-card">
      <BlogCover slug={post.slug} className="bc--card" size={360}>
        <div className="bc-card-content">
          <h3 className="bc-card-title">{post.title}</h3>
          <div className="bc-card-reveal">
            <p className="bc-card-desc">{post.excerpt}</p>
            <div className="bc-card-author">
              <span className="bc-avatar" aria-hidden="true">
                {initials(author)}
              </span>
              <span>
                {author} <span aria-hidden="true">·</span> {formatDate(post.date)}
              </span>
            </div>
          </div>
        </div>
      </BlogCover>
    </Link>
  );
}
