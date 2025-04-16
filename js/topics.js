document.addEventListener('DOMContentLoaded', function() {
    // Load topics data and render topics
    fetch('data/topics.json')
        .then(response => response.json())
        .then(data => {
            renderTopics(data.topics);
            renderPopularGuides(data.guides);
            setupTopicFinder();
        })
        .catch(error => console.error('Error loading topics data:', error));

    // Display last modified date
    document.getElementById('lastModified').textContent = document.lastModified;
});

function renderTopics(topics) {
    const topicsContainer = document.querySelector('.row.g-4'); // The container for topic items
    
    topics.forEach(topic => {
        const topicItem = document.createElement('div');
        topicItem.className = 'col-lg-4 col-md-6 wow fadeInUp';
        topicItem.setAttribute('data-wow-delay', '0.1s');
        
        topicItem.innerHTML = `
            <div class="topic-item shadow">
                <div class="overflow-hidden">
                    <img class="img-fluid" src="${topic.image}" alt="${topic.title}">
                </div>
                <div class="p-4">
                    <h5 class="mb-3">${topic.title}</h5>
                    <p>${topic.description}</p>
                    <ul class="mb-3">
                        ${topic.keyPoints.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                    <a class="btn text-light py-2 px-4 mt-2" style="background-color: #4CAF50;" href="${topic.id}.html">
                        Explore ${topic.title}
                    </a>
                    <div class="d-flex justify-content-between mt-2 text-muted small">
                        <span><i class="fas fa-star text-warning"></i> ${topic.popularity}/5.0</span>
                        <span><i class="fas fa-book"></i> ${topic.resources} resources</span>
                    </div>
                </div>
            </div>
        `;
        
        topicsContainer.appendChild(topicItem);
    });
}

function renderPopularGuides(guides) {
    const guidesContainer = document.querySelector('.row.g-4'); // The container for popular guides
    
    guides.forEach(guide => {
        const guideItem = document.createElement('div');
        guideItem.className = 'col-lg-4 col-md-6 wow fadeInUp';
        guideItem.setAttribute('data-wow-delay', '0.1s');
        
        guideItem.innerHTML = `
            <div class="course-item shadow">
                <div class="position-relative overflow-hidden text-light image">
                    <img class="img-fluid" src="${guide.image}" alt="${guide.title}">
                    <div style="position:absolute;top: 15px;left: 16px; font-size:12px; border-radius:3px; background-color:#4CAF50;"
                        class="px-2 py-1 fw-bold text-uppercase">GUIDE</div>
                </div>
                <div class="p-2 pb-0">
                    <h5 class="mb-1"><a href="${guide.id}.html" class="text-dark">${guide.title}</a></h5>
                </div>
                <div class="d-flex">
                    <small class="flex-fill text-center py-1 px-2"><i class="fa fa-star text-warning me-2"></i>${guide.rating}</small>
                    <small class="flex-fill text-center py-1 px-2"><i class="fa fa-download me-2"></i>${guide.downloads.toLocaleString()}+ Downloads</small>
                </div>
                <div class="d-flex">
                    <small class="flex-fill text-left p-2 px-2"><i class="fa fa-clock me-2"></i>${guide.readTime}</small>
                    <small class="text-primary py-1 px-2 fw-bold fs-6" style="float:right;">
                        <a href="${guide.id}.html">Read Now </a><i class="fa fa-chevron-right me-2 fs-10"></i>
                    </small>
                </div>
            </div>
        `;
        
        guidesContainer.appendChild(guideItem);
    });
}

function setupTopicFinder() {
    const topicFinderForm = document.getElementById('topic-finder');
    
    if (topicFinderForm) {
        topicFinderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const experienceLevel = this.querySelector('select').value;
            const checkedBoxes = Array.from(this.querySelectorAll('input[type="checkbox"]:checked'));
            const interests = checkedBoxes.map(box => box.nextElementSibling.textContent);
            const challenge = this.querySelector('textarea').value;
            
            // In a real app, you would send this data to a server or process it further
            console.log('Topic Finder Submitted:', {
                experienceLevel,
                interests,
                challenge
            });
            
            // Show a success message (in a real app, you'd show recommendations)
            alert('Thanks for your input! Based on your responses, we recommend starting with our Waste Reduction and Energy Conservation topics.');
            
            // Reset form
            this.reset();
        });
    }
}

// Weather Tips Functionality
function getWeatherTips() {
    // This is a simplified version - in a real app, you'd use a weather API
    const tipsContainer = document.getElementById('weather-tips');
    
    if (tipsContainer) {
        const tips = {
            sunny: [
                "Harness solar energy by drying clothes outside",
                "Use natural lighting instead of electric lights",
                "Plant drought-resistant native plants"
            ],
            rainy: [
                "Collect rainwater for your garden",
                "Check for leaks in your home during heavy rain",
                "Use weatherstripping to improve energy efficiency"
            ],
            cold: [
                "Layer clothing instead of turning up the heat",
                "Use draft stoppers on doors and windows",
                "Insulate your water heater and pipes"
            ],
            hot: [
                "Use fans instead of AC when possible",
                "Close blinds during the day to keep heat out",
                "Grill outside to avoid heating up your kitchen"
            ]
        };
        
        // For demo purposes, we'll randomly select a weather type
        const weatherTypes = Object.keys(tips);
        const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        
        // Display tips
        tipsContainer.innerHTML = tips[randomWeather].map(tip => 
            `<li class="list-group-item d-flex align-items-center">
                <i class="fas fa-leaf me-3 text-success"></i>
                ${tip}
            </li>`
        ).join('');
    }
}

// Call weather tips function if the element exists
if (document.getElementById('weather-tips')) {
    getWeatherTips();
}