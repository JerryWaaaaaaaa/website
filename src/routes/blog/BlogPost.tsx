import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Nav } from '../../components/Nav';
import { Footer } from '../../sections/Footer';
import { BlogCover } from './BlogCover';
import { PostCard, PostMeta } from './PostCard';
import { sortedPosts } from './blogData';
import './blog.css';

export function BlogPost() {
  const { slug } = useParams();
  const posts = sortedPosts();
  const idx = Math.max(
    0,
    posts.findIndex((p) => p.slug === slug),
  );
  const post = posts[idx];

  const readNext = [1, 2, 3].map((k) => posts[(idx + k) % posts.length]).filter((p) => p.slug !== post.slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${post.title} — Zoom AI Create Blog`;
    return () => {
      document.title = 'Zoom AI Create';
    };
  }, [post.title]);

  return (
    <>
      <Nav />
      <article className="post">
        <Link to="/blog" className="post-back">
          ‹ All posts
        </Link>
        <PostMeta post={post} showReadTime />
        <h1 className="post-title">{post.title}</h1>
        <p className="post-lede">{post.excerpt}</p>
        <BlogCover slug={post.slug} text={post.coverText ?? post.title} className="bc--hero" />
        {/* Mock body is trusted, authored content (prototype only). */}
        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.body }} />
      </article>

      {readNext.length > 0 && (
        <section className="post-readnext">
          <h2 className="post-readnext-title">Read next</h2>
          <div className="blog-grid">
            {readNext.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
      <Footer />
    </>
  );
}
