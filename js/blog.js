document.addEventListener('DOMContentLoaded', function() {
    // Initialize WOW.js for animations
    if (typeof WOW === 'function') {
        new WOW().init();
    }

    // Sample blog data (in a real app, this would come from an API)
    const blogPosts = [
        {
            id: 1,
            title: "10 Easy Ways to Reduce Plastic Waste",
            excerpt: "Discover simple changes you can make today to significantly reduce your plastic consumption and help the environment.",
            category: "Zero Waste Living",
            date: "March 15, 2023",
            readTime: "5 min read",
            image: "https://th.bing.com/th/id/OIP.0iTwf1gjpz2fhJCMEAAldAHaD8?w=1200&h=638&rs=1&pid=ImgDetMain",
            featured: true
        },
        {
            id: 2,
            title: "Beginner's Guide to Composting at Home",
            excerpt: "Learn how to turn your food scraps and yard waste into nutrient-rich compost for your garden with this easy guide.",
            category: "Sustainable Food",
            date: "February 28, 2023",
            readTime: "8 min read",
            image: "https://th.bing.com/th/id/OIP.7zNzBYMi-QUYBIu65q4nZAHaEO?rs=1&pid=ImgDetMain",
            featured: false
        },
        {
            id: 3,
            title: "Sustainable Alternatives to Everyday Items",
            excerpt: "Replace common household products with eco-friendly alternatives that are better for the planet and your health.",
            category: "Eco-Friendly Products",
            date: "January 10, 2023",
            readTime: "6 min read",
            image: "https://th.bing.com/th/id/R.9776b2ef080134d10e7c49ddc0f255c2?rik=5CsEXuhCgd7w%2bg&riu=http%3a%2f%2fethnasia.com%2fcdn%2fshop%2farticles%2fpexels-sarah-chai-7262469_edited.jpg%3fv%3d1654531616&ehk=8%2fI3dRljCNwEH%2fJWnzIc0GsL3bCDYaTAjHqeTnG9pRI%3d&risl=&pid=ImgRaw&r=0",
            featured: true
        },
        {
            id: 4,
            title: "How to Save Energy and Reduce Your Carbon Footprint",
            excerpt: "Practical tips for reducing your energy consumption at home and lowering your environmental impact.",
            category: "Green Energy",
            date: "December 5, 2022",
            readTime: "7 min read",
            image: "https://th.bing.com/th/id/OIP.7IEuGuOFXDqgm8hZNaxOrQHaE6?rs=1&pid=ImgDetMain",
            featured: false
        },
        {
            id: 5,
            title: "Community Garden Success Stories",
            excerpt: "Inspiring stories from urban communities that transformed vacant lots into thriving green spaces.",
            category: "Community Stories",
            date: "November 20, 2022",
            readTime: "10 min read",
            image: "https://th.bing.com/th/id/OIP.aEwAv6Mz6utlWeN2nZs58AHaEb?rs=1&pid=ImgDetMain",
            featured: true
        },
        {
            id: 6,
            title: "The Truth About Biodegradable Plastics",
            excerpt: "Examining whether biodegradable plastics are really as eco-friendly as they claim to be.",
            category: "Zero Waste Living",
            date: "October 15, 2022",
            readTime: "9 min read",
            image: "https://th.bing.com/th/id/OIP.zzL8EsUJqAD5Eo4Cgr6zbQAAAA?w=400&h=365&rs=1&pid=ImgDetMain",
            featured: false
        }
    ];

    // Load blog posts
    function loadBlogPosts(posts = blogPosts) {
        const blogPostsContainer = document.getElementById('blogPosts');
        
        if (!blogPostsContainer) return;
        
        // Clear loading spinner
        blogPostsContainer.innerHTML = '';
        
        // Create blog post cards
        posts.forEach(post => {
            const postCol = document.createElement('div');
            postCol.className = 'col-md-6 mb-4 wow fadeInUp';
            postCol.setAttribute('data-wow-delay', `${0.1 + (post.id % 3) * 0.1}s`);
            
            postCol.innerHTML = `
                <div class="blog-post-card h-100">
                    <div class="blog-post-img">
                        <img src="${post.image}" alt="${post.title}" class="img-fluid" loading="lazy">
                    </div>
                    <div class="blog-post-body">
                        <div class="blog-post-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${post.date}</span>
                            <span class="mx-2">•</span>
                            <span><i class="fas fa-clock"></i> ${post.readTime}</span>
                        </div>
                        <h3 class="blog-post-title">${post.title}</h3>
                        <p class="blog-post-excerpt">${post.excerpt}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-success">${post.category}</span>
                            <a href="blog-post.html?id=${post.id}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>
                </div>
            `;
            
            blogPostsContainer.appendChild(postCol);
        });
    }

    // Initialize search functionality
    function initSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        
        if (searchInput && searchButton) {
            searchButton.addEventListener('click', function() {
                const searchTerm = searchInput.value.toLowerCase();
                
                if (searchTerm.trim() === '') {
                    loadBlogPosts();
                    return;
                }
                
                const filteredPosts = blogPosts.filter(post => 
                    post.title.toLowerCase().includes(searchTerm) || 
                    post.excerpt.toLowerCase().includes(searchTerm) ||
                    post.category.toLowerCase().includes(searchTerm)
                );
                
                loadBlogPosts(filteredPosts);
            });
            
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    searchButton.click();
                }
            });
        }
    }

    // Initialize newsletter form
    function initNewsletter() {
        const newsletterForm = document.getElementById('newsletterForm');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput.value.trim();
                
                if (email && validateEmail(email)) {
                    // In a real app, you would send this to your backend
                    alert('Thank you for subscribing to our newsletter!');
                    this.reset();
                } else {
                    alert('Please enter a valid email address');
                }
            });
        }
    }

    // Helper function to validate email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Initialize everything
    loadBlogPosts();
    initSearch();
    initNewsletter();
});