import { Link } from 'react-router-dom';
import { BlogCover } from './BlogCover';
import { formatDate, type BlogPost } from './blogData';

/** Category · date meta row, reused on cards, the featured block and detail. */
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

/** Grid card: generated cover on top, then title + meta. */
export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link to={`/blog/${post.slug}`} className="blog-card">
      <BlogCover slug={post.slug} text={post.coverText ?? post.title} className="bc--card" />
      <div className="blog-card-body">
        <h3 className="blog-card-title">{post.title}</h3>
        <PostMeta post={post} />
      </div>
    </Link>
  );
}
