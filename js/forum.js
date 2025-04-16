document.addEventListener('DOMContentLoaded', function() {
    // Load forum data
    fetch('data/forum.json')
        .then(response => response.json())
        .then(data => {
            renderForumCategories(data.categories);
            renderTopics(data.topics);
            setupEventListeners();
        })
        .catch(error => console.error('Error loading forum data:', error));

    // Hide spinner when content is loaded
    setTimeout(() => {
        document.getElementById('spinner').classList.remove('show');
    }, 500);
});

function renderForumCategories(categories) {
    const categoriesContainer = document.getElementById('forum-categories');
    const modalCategoriesContainer = document.getElementById('topic-category');
    
    // Clear existing content
    categoriesContainer.innerHTML = '';
    modalCategoriesContainer.innerHTML = '<option value="" selected disabled>Select a category</option>';
    
    // Add "All Categories" option
    const allCategoriesItem = document.createElement('a');
    allCategoriesItem.href = '#';
    allCategoriesItem.className = 'list-group-item list-group-item-action active';
    allCategoriesItem.textContent = 'All Categories';
    allCategoriesItem.dataset.categoryId = 'all';
    categoriesContainer.appendChild(allCategoriesItem);
    
    // Add each category
    categories.forEach(category => {
        // Sidebar categories
        const categoryItem = document.createElement('a');
        categoryItem.href = '#';
        categoryItem.className = 'list-group-item list-group-item-action';
        categoryItem.textContent = category.name;
        categoryItem.dataset.categoryId = category.id;
        categoriesContainer.appendChild(categoryItem);
        
        // Modal dropdown categories
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        modalCategoriesContainer.appendChild(option);
    });
}

function renderTopics(topics, categoryId = 'all') {
    const topicList = document.getElementById('topic-list');
    topicList.innerHTML = '';
    
    // Filter topics by category if needed
    const filteredTopics = categoryId === 'all' 
        ? topics 
        : topics.filter(topic => topic.categoryId === categoryId);
    
    if (filteredTopics.length === 0) {
        topicList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-comment-slash fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No topics found</h5>
                <p class="text-muted">Be the first to start a discussion in this category!</p>
                <button class="btn btn-success" id="empty-new-topic-btn">
                    <i class="fas fa-plus-circle me-2"></i>Create New Topic
                </button>
            </div>
        `;
        return;
    }
    
    // Create topic items
    filteredTopics.forEach(topic => {
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item d-flex flex-column flex-md-row';
        topicItem.innerHTML = `
            <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-2">
                    <img src="${topic.author.avatar}" alt="${topic.author.name}" class="topic-avatar me-3">
                    <div>
                        <a href="topic-detail.html?id=${topic.id}" class="topic-title">${topic.title}</a>
                        <div class="topic-meta">
                            Started by <a href="#" class="text-success">${topic.author.name}</a> 
                            in <a href="#" class="text-success" data-category-id="${topic.categoryId}">${topic.category}</a> 
                            • ${formatDate(topic.date)}
                        </div>
                    </div>
                </div>
                <div class="topic-tags mb-2">
                    ${topic.tags.map(tag => `<span class="badge badge-tag">#${tag}</span>`).join('')}
                </div>
            </div>
            <div class="topic-stats d-flex flex-md-column justify-content-between ms-md-4 mt-3 mt-md-0">
                <div class="topic-stat">
                    <span class="topic-stat">${topic.replies}</span>
                    <span class="topic-stat-label">Replies</span>
                </div>
                <div class="topic-stat">
                    <span class="topic-stat">${topic.views}</span>
                    <span class="topic-stat-label">Views</span>
                </div>
                <div class="topic-stat">
                    <span class="topic-stat">${topic.likes}</span>
                    <span class="topic-stat-label">Likes</span>
                </div>
            </div>
        `;
        topicList.appendChild(topicItem);
    });
}

function setupEventListeners() {
    // Category selection
    document.querySelectorAll('#forum-categories a').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active category
            document.querySelector('#forum-categories a.active').classList.remove('active');
            this.classList.add('active');
            
            // Update current category title
            const categoryName = this.textContent;
            document.getElementById('current-category').textContent = categoryName === 'All Categories' 
                ? 'Recent Discussions' 
                : categoryName;
            
            // Filter topics
            const categoryId = this.dataset.categoryId;
            fetch('data/forum.json')
                .then(response => response.json())
                .then(data => renderTopics(data.topics, categoryId));
        });
    });
    
    // New topic button
    document.getElementById('new-topic-btn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('newTopicModal'));
        modal.show();
    });
    
    // Empty state new topic button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'empty-new-topic-btn') {
            const modal = new bootstrap.Modal(document.getElementById('newTopicModal'));
            modal.show();
        }
    });
    
    // Submit new topic
    document.getElementById('submit-topic-btn').addEventListener('click', function() {
        const title = document.getElementById('topic-title').value;
        const category = document.getElementById('topic-category').value;
        const content = document.getElementById('topic-content').value;
        const tags = document.getElementById('topic-tags').value.split(',').map(tag => tag.trim());
        
        if (!title || !category || !content) {
            alert('Please fill in all required fields');
            return;
        }
        
        // In a real app, you would send this data to a server
        console.log('New topic submitted:', { title, category, content, tags });
        
        // Show success message
        alert('Your topic has been created successfully!');
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('newTopicModal'));
        modal.hide();
        document.getElementById('new-topic-form').reset();
        
        // Reload topics (in a real app, you would add the new topic to the list)
        fetch('data/forum.json')
            .then(response => response.json())
            .then(data => renderTopics(data.topics));
    });
    
    // Sort dropdown
    document.querySelectorAll('[data-sort]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const sortType = this.dataset.sort;
            document.getElementById('sort-dropdown').textContent = `Sort by: ${this.textContent}`;
            
            // In a real app, you would sort the topics
            console.log('Sorting by:', sortType);
        });
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}




// Add this to your existing forum.js
function animateElements() {
    // Animate categories
    const categories = document.querySelectorAll('#forum-categories a');
    categories.forEach((category, index) => {
        category.style.opacity = '0';
        category.classList.add('animate-slide-left');
        category.style.animationDelay = `${index * 0.1}s`;
        
        // Force reflow to trigger animation
        void category.offsetWidth;
        category.style.opacity = '1';
    });
    
    // Animate topic items
    const topics = document.querySelectorAll('.topic-item');
    topics.forEach((topic, index) => {
        topic.style.opacity = '0';
        topic.classList.add('animate-fade');
        topic.style.animationDelay = `${index * 0.07 + 0.3}s`;
        
        // Mark as visible after animation
        setTimeout(() => {
            topic.classList.add('visible');
        }, index * 70 + 300);
    });
    
    // Animate cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.classList.add('card-hover');
        card.style.opacity = '0';
        card.classList.add('animate-slide-right');
        card.style.animationDelay = `${index * 0.1 + 0.2}s`;
        
        void card.offsetWidth;
        card.style.opacity = '1';
    });
    
    // Add pulse animation to buttons
    document.querySelectorAll('.btn-success').forEach(btn => {
        btn.classList.add('btn-pulse');
    });
}

// Call this function at the end of your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    animateElements();
    
    // Additional animation for modal when shown
    document.getElementById('newTopicModal').addEventListener('show.bs.modal', function() {
        const modalContent = this.querySelector('.modal-content');
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            modalContent.style.transition = 'all 0.3s ease-out';
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }, 10);
    });
    
    // Animate new topic button on hover
    const newTopicBtn = document.getElementById('new-topic-btn');
    if (newTopicBtn) {
        newTopicBtn.addEventListener('mouseenter', function() {
            this.querySelector('i').style.transform = 'rotate(90deg)';
        });
        
        newTopicBtn.addEventListener('mouseleave', function() {
            this.querySelector('i').style.transform = 'rotate(0)';
        });
    }
});




// In your forum.js
const seasonalImages = [
    'img/b.jpg',
    'img/z',
    'img/forum/autumn-planting.jpg',
    'img/forum/winter-sustainability.jpg'
];

function setSeasonalBackground() {
    const month = new Date().getMonth();
    const season = Math.floor(month / 3) % 4;
    document.querySelector('.page-header').style.backgroundImage = 
        `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${seasonalImages[season]}')`;
}



function renderTopics(topics, categoryId = 'all') {
    const topicList = document.getElementById('topic-list');
    topicList.innerHTML = '';
    
    const filteredTopics = categoryId === 'all' 
        ? topics 
        : topics.filter(topic => topic.categoryId === categoryId);
    
    filteredTopics.forEach(topic => {
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item d-flex flex-column flex-md-row';
        
        // Create avatar HTML with fallback
        const avatarHtml = topic.author.avatar 
            ? `<img src="${topic.author.avatar}" class="profile-image me-3" alt="${topic.author.name}">`
            : `<div class="profile-image profile-image-fallback me-3">${getInitials(topic.author.name)}</div>`;
        
        topicItem.innerHTML = `
            <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-2">
                    ${avatarHtml}
                    <div>
                        <a href="topic-detail.html?id=${topic.id}" class="topic-title">${topic.title}</a>
                        <div class="topic-meta">
                            Started by <a href="#" class="text-success">${topic.author.name}</a> 
                            in <a href="#" class="text-success" data-category-id="${topic.categoryId}">${topic.category}</a> 
                            • ${formatDate(topic.date)}
                        </div>
                    </div>
                </div>
                <div class="topic-tags mb-2">
                    ${topic.tags.map(tag => `<span class="badge badge-tag">#${tag}</span>`).join('')}
                </div>
            </div>
            <div class="topic-stats d-flex flex-md-column justify-content-between ms-md-4 mt-3 mt-md-0">
                <div class="topic-stat">
                    <span class="topic-stat">${topic.replies}</span>
                    <span class="topic-stat-label">Replies</span>
                </div>
                <div class="topic-stat">
                    <span class="topic-stat">${topic.views}</span>
                    <span class="topic-stat-label">Views</span>
                </div>
                <div class="topic-stat">
                    <span class="topic-stat">${topic.likes}</span>
                    <span class="topic-stat-label">Likes</span>
                </div>
            </div>
        `;
        topicList.appendChild(topicItem);
    });
}

// Helper function to get initials
function getInitials(name) {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
}






// function renderForumCategories(categories) {
//     const categoriesContainer = document.getElementById('forum-categories');
//     categoriesContainer.innerHTML = '';
    
//     categories.forEach(category => {
//         const categoryItem = document.createElement('a');
//         categoryItem.href = '#';
//         categoryItem.className = 'list-group-item list-group-item-action d-flex align-items-center';
//         categoryItem.dataset.categoryId = category.id;
        
//         // Example if your categories have moderators with avatars
//         const moderatorAvatar = category.moderator?.avatar 
//             ? `<img src="${category.moderator.avatar}" class="profile-image profile-image-sm me-2" alt="${category.moderator.name}">`
//             : `<div class="profile-image profile-image-sm profile-image-fallback me-2">${category.moderator ? getInitials(category.moderator.name) : '*'}</div>`;
        
//         categoryItem.innerHTML = `
//             ${moderatorAvatar}
//             <div>
//                 <h6 class="mb-1">${category.name}</h6>
//                 <small class="text-muted">${category.description}</small>
//             </div>
//             <span class="badge bg-success ms-auto">${category.topicCount || 0}</span>
//         `;
//         categoriesContainer.appendChild(categoryItem);
//     });
// }



// // In your modal setup
// function setupNewTopicModal() {
//     const currentUser = getCurrentUser(); // You'll need to implement this
    
//     if (currentUser) {
//         const avatarHtml = currentUser.avatar
//             ? `<img src="${currentUser.avatar}" class="profile-image profile-image-sm me-2" alt="Your profile">`
//             : `<div class="profile-image profile-image-sm profile-image-fallback me-2">${getInitials(currentUser.name)}</div>`;
        
//         document.getElementById('current-user-avatar').innerHTML = avatarHtml;
//     }
// }