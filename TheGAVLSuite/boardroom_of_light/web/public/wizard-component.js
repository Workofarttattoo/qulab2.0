/**
 * GAVL Suite Wizard Component - Reusable Interactive Tutorial
 *
 * Copyright (c) 2025 Joshua Hendricks Cole (DBA: Corporation of Light). All Rights Reserved. PATENT PENDING.
 *
 * Usage:
 * 1. Include this script in your HTML: <script src="/path/to/wizard-component.js"></script>
 * 2. Call GAVLWizard.create(config) with your wizard steps
 * 3. Wizard automatically shows on first visit, saves preference to localStorage
 */

const GAVLWizard = {
    /**
     * Create and inject wizard into page
     * @param {Object} config - Wizard configuration
     * @param {string} config.toolName - Name of the tool (e.g., "Boardroom of Light")
     * @param {string} config.storageKey - localStorage key (e.g., "boardroom_wizard_seen")
     * @param {Array} config.steps - Array of step objects with {title, content}
     */
    create: function(config) {
        const { toolName, storageKey, steps } = config;

        // Check if wizard was already seen
        if (localStorage.getItem(storageKey) === 'true') {
            return; // Don't show wizard
        }

        // Inject CSS
        this.injectCSS();

        // Inject HTML
        this.injectHTML(toolName, steps);

        // Setup event listeners
        this.setupEventListeners(storageKey, steps.length);
    },

    injectCSS: function() {
        const style = document.createElement('style');
        style.textContent = `
            /* GAVL Wizard Styles */
            .gavl-wizard-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }

            .gavl-wizard-overlay.hidden {
                display: none;
            }

            .gavl-wizard-modal {
                background: white;
                border-radius: 20px;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: gavlWizardSlideIn 0.3s ease-out;
            }

            @keyframes gavlWizardSlideIn {
                from {
                    transform: translateY(-50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .gavl-wizard-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 20px 20px 0 0;
                text-align: center;
            }

            .gavl-wizard-header h2 {
                font-size: 2em;
                margin-bottom: 10px;
            }

            .gavl-wizard-header p {
                opacity: 0.9;
                font-size: 1.1em;
            }

            .gavl-wizard-content {
                padding: 30px;
            }

            .gavl-wizard-step {
                display: none;
            }

            .gavl-wizard-step.active {
                display: block;
                animation: gavlWizardFadeIn 0.3s;
            }

            @keyframes gavlWizardFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .gavl-wizard-step h3 {
                color: #764ba2;
                font-size: 1.5em;
                margin-bottom: 20px;
            }

            .gavl-wizard-step p {
                color: #666;
                line-height: 1.6;
                margin-bottom: 15px;
            }

            .gavl-wizard-step ul {
                margin: 15px 0;
                padding-left: 20px;
            }

            .gavl-wizard-step li {
                margin: 8px 0;
                color: #666;
            }

            .gavl-example-box {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 15px 0;
                border-radius: 5px;
            }

            .gavl-tip-box {
                background: #e3f2fd;
                border-left: 4px solid #2196f3;
                padding: 15px;
                margin: 15px 0;
                border-radius: 5px;
            }

            .gavl-progress-dots {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin: 20px 0;
            }

            .gavl-progress-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #e0e0e0;
                transition: all 0.3s;
            }

            .gavl-progress-dot.active {
                background: #667eea;
                transform: scale(1.3);
            }

            .gavl-progress-dot.completed {
                background: #4caf50;
            }

            .gavl-wizard-buttons {
                display: flex;
                justify-content: space-between;
                gap: 15px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
            }

            .gavl-wizard-buttons button {
                flex: 1;
                padding: 12px 30px;
                border: none;
                border-radius: 25px;
                font-size: 1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
            }

            .gavl-wizard-btn-prev {
                background: #e0e0e0;
                color: #666;
            }

            .gavl-wizard-btn-prev:hover:not(:disabled) {
                background: #d0d0d0;
            }

            .gavl-wizard-btn-next {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .gavl-wizard-btn-next:hover {
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                transform: translateY(-2px);
            }

            .gavl-wizard-btn-skip {
                background: transparent;
                color: #667eea;
                border: 2px solid #667eea;
            }

            .gavl-wizard-btn-skip:hover {
                background: #667eea;
                color: white;
            }

            .gavl-wizard-buttons button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    },

    injectHTML: function(toolName, steps) {
        const overlay = document.createElement('div');
        overlay.id = 'gavl-wizard-overlay';
        overlay.className = 'gavl-wizard-overlay';

        const dotsHTML = steps.map((_, i) =>
            `<div class="gavl-progress-dot ${i === 0 ? 'active' : ''}" data-step="${i}"></div>`
        ).join('');

        const stepsHTML = steps.map((step, i) => `
            <div class="gavl-wizard-step ${i === 0 ? 'active' : ''}" data-step="${i}">
                <h3>${step.title}</h3>
                ${step.content}
            </div>
        `).join('');

        overlay.innerHTML = `
            <div class="gavl-wizard-modal">
                <div class="gavl-wizard-header">
                    <h2>🧙‍♂️ ${toolName} Tutorial</h2>
                    <p>Let's show you how to use this tool</p>
                </div>
                <div class="gavl-wizard-content">
                    <div class="gavl-progress-dots">${dotsHTML}</div>
                    ${stepsHTML}
                    <div class="gavl-wizard-buttons">
                        <button class="gavl-wizard-btn-prev" id="gavl-wizard-prev" disabled>← Previous</button>
                        <button class="gavl-wizard-btn-skip" id="gavl-wizard-skip">Skip Tutorial</button>
                        <button class="gavl-wizard-btn-next" id="gavl-wizard-next">Next →</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertBefore(overlay, document.body.firstChild);
    },

    setupEventListeners: function(storageKey, totalSteps) {
        let currentStep = 0;

        const prevBtn = document.getElementById('gavl-wizard-prev');
        const nextBtn = document.getElementById('gavl-wizard-next');
        const skipBtn = document.getElementById('gavl-wizard-skip');
        const overlay = document.getElementById('gavl-wizard-overlay');

        const updateStep = () => {
            // Hide all steps
            document.querySelectorAll('.gavl-wizard-step').forEach(step => {
                step.classList.remove('active');
            });

            // Show current step
            document.querySelector(`.gavl-wizard-step[data-step="${currentStep}"]`).classList.add('active');

            // Update progress dots
            document.querySelectorAll('.gavl-progress-dot').forEach((dot, index) => {
                dot.classList.remove('active', 'completed');
                if (index === currentStep) {
                    dot.classList.add('active');
                } else if (index < currentStep) {
                    dot.classList.add('completed');
                }
            });

            // Update button states
            prevBtn.disabled = currentStep === 0;

            if (currentStep === totalSteps - 1) {
                nextBtn.textContent = '🚀 Start Using Tool';
            } else {
                nextBtn.textContent = 'Next →';
            }
        };

        const closeWizard = () => {
            overlay.classList.add('hidden');
            localStorage.setItem(storageKey, 'true');
        };

        prevBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateStep();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps - 1) {
                currentStep++;
                updateStep();
            } else {
                closeWizard();
            }
        });

        skipBtn.addEventListener('click', closeWizard);
    }
};

// Auto-init if window.GAVLWizardConfig is defined
if (typeof window !== 'undefined' && window.GAVLWizardConfig) {
    document.addEventListener('DOMContentLoaded', () => {
        GAVLWizard.create(window.GAVLWizardConfig);
    });
}
