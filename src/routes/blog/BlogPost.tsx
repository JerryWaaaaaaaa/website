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
      <div className="blog-root">
      <header className="post-hero">
        {/* The post's mesh gradient becomes the header background, fading to white. */}
        <BlogCover slug={post.slug} className="bc--hero-bg" width={1120} height={520} />
        <span className="post-hero-fade" aria-hidden="true" />
        <div className="post-hero-inner">
          {/* On mobile these two groups split across the gradient band (top) and
              the white surface (head); on desktop they stack over the gradient. */}
          <div className="post-hero-top">
            <Link to="/blog" className="post-back">
              ‹ All posts
            </Link>
            <PostMeta post={post} showReadTime showAuthor />
          </div>
          <div className="post-hero-head">
            <h1 className="post-title">{post.title}</h1>
            <p className="post-lede">{post.excerpt}</p>
          </div>
        </div>
      </header>
      <article className="post">
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
      </div>
      <Footer />
    </>
  );
}
