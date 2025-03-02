import { marked } from 'marked';
import frontMatter from 'front-matter';

async function loadMarkdownPost(postId) {
    try {
        const response = await fetch(`/blog-posts/${postId}/post.md`);
        const markdown = await response.text();
        const { attributes, body } = frontMatter(markdown);
        return {
            id: postId,
            ...attributes,
            content: marked.parse(body)
        };
    } catch (error) {
        console.error(`Error loading post ${postId}:`, error);
        return null;
    }
}

function createPostCard(post) {
    return `
        <article class="post-card">
            <div class="post-thumbnail">
                <img src="/blog-posts/${post.id}/${post.thumbnail}" alt="${post.title}">
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="post-date">${post.date}</span>
                    <span class="post-read-time">${post.readTime}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.description}</p>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="/blog-posts/${post.id}" class="read-more">Read More →</a>
            </div>
        </article>
    `;
}

async function loadBlogPosts() {
    const posts = [
        'docker-deployment-on-aws'
        // Add more post IDs here as you create them
    ];

    const loadedPosts = await Promise.all(
        posts.map(postId => loadMarkdownPost(postId))
    );

    const postsGrid = document.getElementById('posts-grid');
    if (postsGrid) {
        postsGrid.innerHTML = loadedPosts
            .filter(post => post !== null)
            .map(post => createPostCard(post))
            .join('');
    }
}

document.addEventListener('DOMContentLoaded', loadBlogPosts); 