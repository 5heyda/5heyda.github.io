import fs from 'fs-extra';
import path from 'path';
import { marked } from 'marked';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to read and parse markdown files
function buildBlogPosts() {
    const postsDirectory = path.join(__dirname, 'blog-posts');
    const outputDirectory = path.join(__dirname, '_site');
    
    // Create output directory if it doesn't exist
    fs.ensureDirSync(outputDirectory);
    
    // Read all markdown files
    const files = fs.readdirSync(postsDirectory).filter(file => file.endsWith('.md'));
    
    // Generate posts HTML
    const posts = files.map(filename => {
        const filePath = path.join(postsDirectory, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);
        const htmlContent = marked.parse(content);
        
        return {
            ...data,
            content: htmlContent,
            slug: filename.replace('.md', '')
        };
    });

    // Update posts grid in index.html
    let indexHtml = fs.readFileSync('index.html', 'utf-8');
    const postsHtml = posts.map(post => `
        <article class="post-card">
            <div class="post-thumbnail">
                <img src="${post.image || ''}" alt="${post.title}">
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="post-date">${post.date}</span>
                    <span class="post-read-time">${post.readTime}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <a href="blog-posts/${post.slug}/index.html" class="read-more">Read More →</a>
            </div>
        </article>
    `).join('');

    // Replace posts grid content
    indexHtml = indexHtml.replace(
        /<div id="posts-grid" class="posts-grid">([\s\S]*?)<\/div>/,
        `<div id="posts-grid" class="posts-grid">${postsHtml}</div>`
    );

    fs.writeFileSync(path.join(outputDirectory, 'index.html'), indexHtml);
}

buildBlogPosts(); 