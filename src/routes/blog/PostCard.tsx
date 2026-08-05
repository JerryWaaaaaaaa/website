import { Link } from 'react-router-dom';
import { BlogCover } from './BlogCover';
import { authorFor, formatDate, initials, shortDate, type BlogPost } from './blogData';

/** Category · date meta row, reused on the detail page. */
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
 * Shared card text: eyebrow (date + category) + title anchored to the top,
 * description + author anchored to the bottom. Used by both the grid cards and
 * the featured panel; the parent (.card-body) spaces them apart.
 */
export function CardText({ post }: { post: BlogPost }) {
  const author = authorFor(post);
  return (
    <>
      <div className="card-top">
        <div className="card-eyebrow">
          <span className="card-date">{shortDate(post.date)}</span>
          <span className="card-cat">{post.category}</span>
        </div>
        <h3 className="card-title">{post.title}</h3>
      </div>
      <div className="card-bottom">
        <p className="card-desc">{post.excerpt}</p>
        <div className="card-author">
          <span className="card-avatar" aria-hidden="true">
            {initials(author.name)}
          </span>
          <span className="card-author-name">{author.name}</span>
          <span className="card-author-role">{author.role}</span>
        </div>
      </div>
    </>
  );
}

/** Grid card: the gradient tile is the card; text is arranged top + bottom. */
export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link to={`/blog/${post.slug}`} className="blog-card">
      <BlogCover slug={post.slug} className="bc--card" size={420}>
        <div className="card-body bc-card-content">
          <CardText post={post} />
        </div>
      </BlogCover>
    </Link>
  );
}
