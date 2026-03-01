document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prep-form');
    const outputContainer = document.getElementById('output-container');
    const resultDisplay = document.getElementById('result-display');
    const placeholderContent = document.querySelector('.placeholder-content');
    const downloadBtn = document.getElementById('download-btn');
    const savePlanBtn = document.getElementById('save-plan-btn');
    const sharePlanBtn = document.getElementById('share-plan-btn');
    const dailyComplete = document.getElementById('daily-complete');
    const progressFill = document.getElementById('dashboard-progress-fill');
    const progressText = document.getElementById('progress-text');
    const confidenceSection = document.getElementById('confidence-section');
    const adaptiveMsg = document.getElementById('adaptive-msg');
    const ratingBtns = document.querySelectorAll('.rating-btn');
    const navSignin = document.getElementById('nav-signin');
    const userProfile = document.getElementById('user-profile');
    const userDisplayEmail = document.getElementById('user-display-email');
    const logoutBtn = document.getElementById('logout-btn');

    // Summary Stats elements
    const statDaysLeft = document.getElementById('stat-days-left');
    const statTotalHours = document.getElementById('stat-total-hours');
    const statCompletedHours = document.getElementById('stat-completed-hours');
    const statRemainingHours = document.getElementById('stat-remaining-hours');
    const studyHoursInput = document.getElementById('study-hours');
    const sustainabilityWarning = document.getElementById('sustainability-warning');
    const aiInsightCard = document.getElementById('ai-insight-card');
    const aiInsightMsg = document.getElementById('ai-insight-msg');
    const featureCards = document.querySelectorAll('.feature-card');

    let currentPlanData = null;

    // Login State Check
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userEmail = sessionStorage.getItem('userEmail');

    if (isLoggedIn === 'true') {
        navSignin.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userDisplayEmail.textContent = userEmail || 'Student User';
    }

    // Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userEmail');
            window.location.reload();
        });
    }

    // Tabs logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabPanes.forEach(pane => {
                pane.classList.add('hidden');
                if (pane.id === `${tabId}-pane`) pane.classList.remove('hidden');
            });
        });
    });

    // Save as PDF (Print)
    downloadBtn.addEventListener('click', () => {
        window.print();
    });

    // Save Plan to Local Storage
    savePlanBtn.addEventListener('click', () => {
        if (currentPlanData) {
            currentPlanData.isCompleted = dailyComplete.checked;
            localStorage.setItem('savedPrepPlan', JSON.stringify(currentPlanData));
            showToast('Plan saved to your browser! 💾');
        }
    });

    // Share Plan (Copy Link)
    sharePlanBtn.addEventListener('click', () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showToast('Website link copied to clipboard! 🔗');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showToast('Error copying link. ❌');
        });
    });

    // Daily Completion Toggle
    dailyComplete.addEventListener('change', () => {
        updateProgress();
        if (dailyComplete.checked) {
            confidenceSection.classList.remove('hidden');
        } else {
            confidenceSection.classList.add('hidden');
            resetRatings();
        }

        if (currentPlanData) {
            currentPlanData.isCompleted = dailyComplete.checked;
            localStorage.setItem('savedPrepPlan', JSON.stringify(currentPlanData));
        }
    });

    // Rating Logic
    ratingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = parseInt(btn.getAttribute('data-value'));
            ratingBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (currentPlanData) {
                currentPlanData.lastConfidence = val;
                localStorage.setItem('savedPrepPlan', JSON.stringify(currentPlanData));
            }

            showAdaptiveFeedback(val);
        });
    });

    function showAdaptiveFeedback(val) {
        adaptiveMsg.classList.remove('hidden');
        const feedback = {
            1: "Boosting tomorrow's review sessions for tougher topics. 🔄",
            2: "Adjusting focus to core fundamentals for next session. 📚",
            3: "Maintaining current pace. Balanced review incoming. ⚖️",
            4: "Efficiency high! Proceeding to advanced applications. 🚀",
            5: "Mastery detected. Ready for a simulation exam? 🎯"
        };
        adaptiveMsg.textContent = `AI Response: ${feedback[val]}`;
    }

    function resetRatings() {
        ratingBtns.forEach(b => b.classList.remove('active'));
        adaptiveMsg.classList.add('hidden');
    }

    // Sustainability Warning Logic
    studyHoursInput.addEventListener('input', () => {
        const hours = parseInt(studyHoursInput.value);
        if (hours >= 10) {
            sustainabilityWarning.classList.remove('hidden');
        } else {
            sustainabilityWarning.classList.add('hidden');
        }
    });

    // Feature Card Click Effects
    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.add('clicked');
            const featureName = card.querySelector('h3').textContent;
            showToast(`Insight: ${featureName} is active! 🚀`);

            setTimeout(() => {
                card.classList.remove('clicked');
            }, 800);
        });
    });

    function updateProgress() {
        if (!currentPlanData) return;

        const today = new Date();
        const start = new Date(currentPlanData.createdAt || today);
        const target = new Date(currentPlanData.examDate);
        const totalDuration = Math.ceil(Math.abs(target - start) / (1000 * 60 * 60 * 24)) || 1;
        const daysPassed = Math.ceil(Math.abs(today - start) / (1000 * 60 * 60 * 24));
        const diffDays = Math.ceil(Math.max(0, (target - today) / (1000 * 60 * 60 * 24)));

        let baseProgress = Math.min(((daysPassed / totalDuration) * 100), 100);
        if (dailyComplete.checked) baseProgress = Math.min(baseProgress + 5, 100);

        const finalProgress = Math.round(baseProgress);
        progressFill.style.width = `${finalProgress}%`;
        progressText.textContent = `${finalProgress}% Completed`;

        // Update Summary Pills
        const dailyHours = currentPlanData.studyHours || 8;
        const totalPlannedHours = totalDuration * dailyHours;
        let completedHours = Math.floor((baseProgress / 100) * totalPlannedHours);

        statDaysLeft.textContent = diffDays;
        statTotalHours.textContent = `${totalPlannedHours}h`;
        statCompletedHours.textContent = `${completedHours}h`;
        statRemainingHours.textContent = `${totalPlannedHours - completedHours}h`;
    }

    // Load saved plan on startup
    const savedData = localStorage.getItem('savedPrepPlan');
    if (savedData) {
        try {
            currentPlanData = JSON.parse(savedData);
            generateContent(currentPlanData.subjects, currentPlanData.examDate, currentPlanData.difficulty);
            dailyComplete.checked = currentPlanData.isCompleted || false;

            if (currentPlanData.studyHours) {
                studyHoursInput.value = currentPlanData.studyHours;
                if (currentPlanData.studyHours >= 10) sustainabilityWarning.classList.remove('hidden');
            }

            if (dailyComplete.checked) {
                confidenceSection.classList.remove('hidden');
                if (currentPlanData.lastConfidence) {
                    const activeBtn = Array.from(ratingBtns).find(b => parseInt(b.getAttribute('data-value')) === currentPlanData.lastConfidence);
                    if (activeBtn) {
                        activeBtn.classList.add('active');
                        showAdaptiveFeedback(currentPlanData.lastConfidence);
                    }
                }
            }

            updateProgress();

            placeholderContent.classList.add('hidden');
            resultDisplay.classList.remove('hidden');
            aiInsightCard.classList.remove('hidden');
            showToast('Welcome back! Loaded your saved plan. 👋');
        } catch (e) {
            console.error('Error loading saved plan', e);
        }
    }

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loader"></span> Generating...';
        btn.disabled = true;

        const subjectsStr = document.getElementById('subjects').value;
        const examDate = document.getElementById('exam-date').value;
        const difficulty = document.getElementById('difficulty').value;
        const studyHours = parseInt(studyHoursInput.value);
        const subjects = subjectsStr.split(',').map(s => s.trim());

        currentPlanData = {
            subjects,
            examDate,
            difficulty,
            studyHours,
            isCompleted: false,
            createdAt: new Date().toISOString()
        };

        setTimeout(() => {
            generateContent(subjects, examDate, difficulty);
            dailyComplete.checked = false;
            confidenceSection.classList.add('hidden');
            aiInsightCard.classList.remove('hidden');
            resetRatings();
            updateProgress();

            placeholderContent.classList.add('hidden');
            resultDisplay.classList.remove('hidden');
            btn.innerHTML = originalText;
            btn.disabled = false;

            showToast('AI Plan Generated successfully!');
            outputContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1800);
    });

    function showToast(message) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = `<span class="toast-icon">✓</span> <span class="toast-msg">${message}</span>`;
            document.body.appendChild(toast);
        } else {
            toast.querySelector('.toast-msg').textContent = message;
        }

        setTimeout(() => toast.classList.add('active'), 100);
        setTimeout(() => {
            if (toast) toast.classList.remove('active');
        }, 4000);
    }

    function generateContent(subjects, examDate, difficulty) {
        const timetablePane = document.getElementById('timetable-pane');
        const topicsPane = document.getElementById('topics-pane');
        const revisionPane = document.getElementById('revision-pane');

        const today = new Date();
        const target = new Date(examDate);
        const diffDays = Math.ceil(Math.abs(target - today) / (1000 * 60 * 60 * 24));

        // 1. Timetable
        let timetableHTML = `<div class="result-card"><h3>Daily Schedule: ${diffDays} Days to Go</h3><div class="schedule-grid">`;
        const schedules = {
            beginner: ['Conceptual Reading', 'Basic Exercises', 'Break', 'Video Lectures', 'Review'],
            intermediate: ['Active Recall', 'Practice Sets', 'Lunch Break', 'Weak Area Drill', 'Self Test'],
            advanced: ['Mock Exam', 'Deep Analysis', 'Coffee Break', 'Advanced Problem Solving', 'Timed Sprint']
        };
        const slots = ['08:00 AM', '10:30 AM', '01:30 PM', '03:30 PM', '07:30 PM'];

        slots.forEach((time, i) => {
            const subject = subjects[i % subjects.length];
            const task = schedules[difficulty][i];
            timetableHTML += `
                <div class="schedule-item">
                    <span class="time">${time}</span>
                    <span class="subject-tag">${subject}</span>
                    <span class="task">${task}</span>
                </div>
            `;
        });
        timetableHTML += `</div></div>`;
        timetablePane.innerHTML = timetableHTML;

        // 2. Topics
        let topicsHTML = `<div class="result-card"><h3>Topic Weightage (${difficulty.toUpperCase()})</h3><ul class="topic-list">`;
        subjects.forEach(subject => {
            topicsHTML += `
                <li>
                    <strong>${subject}</strong>
                    <div class="sub-topics">
                        <span>High Yield (80/20 Rule)</span>
                        <span>Commonly Asked Questions</span>
                        <span>Complexity: ${difficulty === 'advanced' ? 'High' : 'Moderate'}</span>
                    </div>
                </li>
            `;
        });
        topicsHTML += `</ul></div>`;
        topicsPane.innerHTML = topicsHTML;

        // 3. Revision
        const strategy = difficulty === 'advanced' ? 'Intensive Mock-Centered' : 'Balanced Spaced Repetition';
        let revisionHTML = `<div class="result-card"><h3>Strategy: ${strategy}</h3><div class="revision-timeline">`;
        const m = [
            { d: `Day ${Math.floor(diffDays / 4)}`, f: 'First major review & full-length test' },
            { d: 'Final Week', f: 'Formula sheets & mental mapping' },
            { d: 'Every 3rd Day', f: 'Active recall for weakest topic' }
        ];
        m.forEach(item => {
            revisionHTML += `<div class="milestone"><span class="m-day">${item.d}</span><span class="m-focus">${item.f}</span></div>`;
        });
        revisionHTML += `</div></div>`;
        revisionPane.innerHTML = revisionHTML;

        // 4. AI Insights
        const insights = [
            "You perform better in the morning. Schedule hard subjects before 12 PM.",
            "Active recall sessions show 40% higher retention for you. Keep it up!",
            "Late night sessions seem to reduce focus. Try to wrap up by 10 PM.",
            "Visual aids (diagrams) are your strength. Use them for complex topics.",
            "You've shown consistency in subjects like AI. Focus more on Physics gaps."
        ];
        const randomInsight = insights[Math.floor(Math.random() * insights.length)];
        aiInsightMsg.innerHTML = randomInsight;
    }
});
