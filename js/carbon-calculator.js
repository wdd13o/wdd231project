// Carbon Calculator Application
class CarbonCalculator {
    constructor() {
        this.questions = [];
        this.currentQuestion = 0;
        this.answers = {};
        this.totalFootprint = 0;
        
        this.loadQuestions().then(() => {
            this.initCalculator();
            this.renderQuestion();
        });
    }
    
    // Load questions from JSON file
    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            const data = await response.json();
            this.questions = data.questions;
            this.averages = data.averages;
            this.equivalents = data.equivalents;
            this.recommendations = data.recommendations;
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    }
    
    // Initialize calculator UI
    initCalculator() {
        this.formElement = document.getElementById('carbon-calculator');
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        this.resultsSection = document.getElementById('results');
        this.totalFootprintElement = document.getElementById('total-footprint');
        this.recommendationsElement = document.getElementById('recommendations');
        
        // Set up retake button
        document.getElementById('retake-btn').addEventListener('click', () => {
            this.resetCalculator();
        });
    }
    
    // Render current question
    renderQuestion() {
        if (this.currentQuestion >= this.questions.length) {
            this.calculateResults();
            return;
        }
        
        const question = this.questions[this.currentQuestion];
        this.updateProgress();
        
        let html = `
            <div class="question-section active-question card p-4 mb-4">
                <h3 class="mb-3">${question.question}</h3>
        `;
        
        // Generate appropriate input based on question type
        switch (question.type) {
            case 'number':
                html += `
                    <input type="number" class="form-control" id="${question.id}" 
                           min="0" step="1" required>
                    ${question.unit ? `<span class="input-group-text">${question.unit}</span>` : ''}
                `;
                break;
                
            case 'range':
                html += `
                    <input type="range" class="form-range" id="${question.id}" 
                           min="${question.min}" max="${question.max}" 
                           step="${question.step}" value="${question.default || question.min}">
                    <div class="d-flex justify-content-between">
                        <span>${question.min}${question.unit ? ' ' + question.unit : ''}</span>
                        <span id="${question.id}-value">${question.default || question.min}${question.unit ? ' ' + question.unit : ''}</span>
                        <span>${question.max}${question.unit ? ' ' + question.unit : ''}</span>
                    </div>
                    <script>
                        document.getElementById('${question.id}').addEventListener('input', function() {
                            document.getElementById('${question.id}-value').textContent = this.value + '${question.unit ? ' ' + question.unit : ''}';
                        });
                    </script>
                `;
                break;
                
            case 'select':
                html += `
                    <select class="form-select" id="${question.id}">
                        ${question.options.map(opt => `
                            <option value="${opt.value}">${opt.label}</option>
                        `).join('')}
                    </select>
                `;
                break;
        }
        
        // Add hint if available
        if (question.hint) {
            html += `<small class="text-muted">${question.hint}</small>`;
        }
        
        // Add navigation buttons
        html += `
            <div class="d-flex justify-content-between mt-4">
                ${this.currentQuestion > 0 ? `
                    <button type="button" class="btn btn-outline-secondary" id="prev-btn">Previous</button>
                ` : '<div></div>'}
                <button type="button" class="btn btn-primary" id="next-btn">
                    ${this.currentQuestion === this.questions.length - 1 ? 'Calculate' : 'Next'}
                </button>
            </div>
        `;
        
        this.formElement.innerHTML = html;
        
        // Set up event listeners
        if (this.currentQuestion > 0) {
            document.getElementById('prev-btn').addEventListener('click', () => {
                this.currentQuestion--;
                this.renderQuestion();
            });
        }
        
        document.getElementById('next-btn').addEventListener('click', () => {
            this.saveAnswer();
            this.currentQuestion++;
            this.renderQuestion();
        });
    }
    
    // Update progress bar and text
    updateProgress() {
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `Question ${this.currentQuestion + 1} of ${this.questions.length}`;
    }
    
    // Save user's answer
    saveAnswer() {
        const question = this.questions[this.currentQuestion];
        const inputElement = document.getElementById(question.id);
        
        if (question.type === 'select') {
            const selectedOption = question.options.find(opt => opt.value === inputElement.value);
            this.answers[question.id] = {
                value: inputElement.value,
                emissionFactor: selectedOption.emissionFactor
            };
        } else {
            this.answers[question.id] = {
                value: parseFloat(inputElement.value),
                emissionFactor: question.emissionFactor
            };
        }
    }
    
    // Calculate final results
    calculateResults() {
        this.formElement.style.display = 'none';
        this.resultsSection.style.display = 'block';
        
        // Calculate total footprint
        this.totalFootprint = 0;
        
        // Household (per capita calculation)
        if (this.answers.household) {
            const householdSize = this.answers.household.value || 1;
            this.totalFootprint += (this.answers.household.emissionFactor / householdSize);
        }
        
        // Electricity
        if (this.answers.electricity) {
            this.totalFootprint += this.answers.electricity.value * 12 * this.answers.electricity.emissionFactor;
        }
        
        // Transportation
        if (this.answers.car_mileage && this.answers.car_efficiency) {
            const gallons = this.answers.car_mileage.value / this.answers.car_efficiency.value;
            this.totalFootprint += gallons * this.answers.car_mileage.emissionFactor;
        }
        
        // Flights
        if (this.answers.flights) {
            this.totalFootprint += this.answers.flights.value * this.answers.flights.emissionFactor;
        }
        
        // Diet
        if (this.answers.diet) {
            this.totalFootprint += this.answers.diet.emissionFactor;
        }
        
        // Shopping
        if (this.answers.shopping) {
            this.totalFootprint += this.answers.shopping.value * 12 * this.answers.shopping.emissionFactor;
        }
        
        // Waste
        if (this.answers.waste) {
            this.totalFootprint += this.answers.waste.emissionFactor * 52;
        }
        
        // Recycling (negative value reduces footprint)
        if (this.answers.recycling) {
            this.totalFootprint += this.answers.recycling.emissionFactor;
        }
        
        // Display results
        this.displayResults();
    }
    
    // Display calculated results
    displayResults() {
        // Format total footprint
        const formattedFootprint = Math.round(this.totalFootprint).toLocaleString();
        this.totalFootprintElement.textContent = `${formattedFootprint} kg CO₂/year`;
        
        // Create comparison text
        let comparisonText;
        if (this.totalFootprint < this.averages.global) {
            comparisonText = `Great job! Your footprint is lower than the global average (${this.averages.global.toLocaleString()} kg).`;
        } else if (this.totalFootprint < this.averages.europe) {
            comparisonText = `Your footprint is close to the European average (${this.averages.europe.toLocaleString()} kg).`;
        } else {
            comparisonText = `Your footprint is higher than the US average (${this.averages.us.toLocaleString()} kg).`;
        }
        document.getElementById('comparison-text').textContent = comparisonText;
        
        // Create equivalents text
        const carMiles = Math.round(this.totalFootprint / this.equivalents.car_miles);
        document.getElementById('equivalent-text').textContent = 
            `Driving ${carMiles.toLocaleString()} miles in a gasoline car`;
        
        // Generate recommendations
        this.generateRecommendations();
        
        // Create chart
        this.createChart();
    }
    
    // Generate personalized recommendations
    generateRecommendations() {
        let recommendationsHTML = '';
        
        // Electricity recommendation
        if (this.answers.electricity && this.answers.electricity.value > 800) {
            const categoryRecs = this.recommendations.find(r => r.category === 'electricity');
            recommendationsHTML += `
                <div class="savings-tip">
                    <h5><i class="fas fa-bolt"></i> Energy Savings</h5>
                    <ul>
                        ${categoryRecs.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Transportation recommendation
        if (this.answers.car_mileage && this.answers.car_mileage.value > 10000) {
            const categoryRecs = this.recommendations.find(r => r.category === 'car_mileage');
            recommendationsHTML += `
                <div class="savings-tip">
                    <h5><i class="fas fa-car"></i> Transportation</h5>
                    <ul>
                        ${categoryRecs.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Diet recommendation
        if (this.answers.diet && this.answers.diet.value === 'meat_daily') {
            const categoryRecs = this.recommendations.find(r => r.category === 'diet');
            recommendationsHTML += `
                <div class="savings-tip">
                    <h5><i class="fas fa-utensils"></i> Food Choices</h5>
                    <ul>
                        ${categoryRecs.tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // General tips
        recommendationsHTML += `
            <div class="savings-tip">
                <h5><i class="fas fa-leaf"></i> General Tips</h5>
                <ul>
                    <li>Switch to renewable energy if available in your area.</li>
                    <li>Plant native trees in your yard to sequester carbon.</li>
                    <li>Support policies and businesses that prioritize sustainability.</li>
                </ul>
            </div>
        `;
        
        this.recommendationsElement.innerHTML = recommendationsHTML;
    }
    
    // Create footprint breakdown chart
    createChart() {
        const ctx = document.getElementById('impact-chart');
        
        // Group answers into categories
        const categories = {
            'Home Energy': (this.answers.electricity?.value * 12 * this.answers.electricity?.emissionFactor || 0) +
                          (this.answers.heating?.emissionFactor || 0),
            'Transportation': (this.answers.car_mileage && this.answers.car_efficiency ? 
                             (this.answers.car_mileage.value / this.answers.car_efficiency.value) * 
                             this.answers.car_mileage.emissionFactor : 0) +
                            (this.answers.flights?.value * this.answers.flights?.emissionFactor || 0),
            'Food': this.answers.diet?.emissionFactor || 0,
            'Goods & Services': this.answers.shopping?.value * 12 * this.answers.shopping?.emissionFactor || 0,
            'Waste': this.answers.waste?.emissionFactor * 52 || 0
        };
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#4CAF50',
                        '#8BC34A',
                        '#CDDC39',
                        '#FFC107',
                        '#FF9800'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Your Carbon Footprint Breakdown'
                    }
                }
            }
        });
    }
    
    // Reset calculator to initial state
    resetCalculator() {
        this.currentQuestion = 0;
        this.answers = {};
        this.totalFootprint = 0;
        this.formElement.style.display = 'block';
        this.resultsSection.style.display = 'none';
        this.renderQuestion();
    }
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CarbonCalculator();
});





