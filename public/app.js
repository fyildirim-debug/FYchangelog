let config = {
    showPrivateRepos: true,
    showApiButton: true,
    defaultLang: 'TR'
};

const translations = {
    TR: {
        title: 'Geliştirici Günlüğü',
        subtitle: 'Geliştirme Geçmişi',
        totalCommits: 'Toplam {0} commit',
        apiBtn: 'API',
        loading: 'Yükleniyor...',
        errorTitle: 'Veriler yüklenemedi!',
        retryBtn: 'Tekrar Dene',
        noCommits: 'Henüz commit bulunmuyor.',
        privateBadge: 'Gizli',
        yearsAgo: 'yıl önce',
        monthsAgo: 'ay önce',
        daysAgo: 'gün önce',
        hoursAgo: 'saat önce',
        minutesAgo: 'dakika önce',
        justNow: 'az önce'
    },
    EN: {
        title: 'Developer Changelog',
        subtitle: 'Development History',
        totalCommits: 'Total {0} commits',
        apiBtn: 'API',
        loading: 'Loading...',
        errorTitle: 'Failed to load data!',
        retryBtn: 'Retry',
        noCommits: 'No commits yet.',
        privateBadge: 'Private',
        yearsAgo: 'years ago',
        monthsAgo: 'months ago',
        daysAgo: 'days ago',
        hoursAgo: 'hours ago',
        minutesAgo: 'minutes ago',
        justNow: 'just now'
    }
};

const colors = {
    JavaScript: '#f7df1e',
    TypeScript: '#3178c6',
    Python: '#3776ab',
    PHP: '#777bb4',
    Java: '#b07219',
    Go: '#00add8',
    Ruby: '#701516',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    React: '#61dafb',
    Dart: '#0175c2',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600'
};

function t(key, ...args) {
    let text = translations[config.defaultLang][key] || key;
    args.forEach((arg, i) => {
        text = text.replace(`{${i}}`, arg);
    });
    return text;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const locale = config.defaultLang === 'TR' ? 'tr-TR' : 'en-US';
    return d.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " " + t('yearsAgo');
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " " + t('monthsAgo');
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " " + t('daysAgo');
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " " + t('hoursAgo');
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " " + t('minutesAgo');
    return t('justNow');
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

async function initApp() {
    try {
        // 1. Config'i yükle
        const configRes = await fetch('/api/config');
        config = await configRes.json();

        // 2. UI Ayarlarını Uygula
        if (!config.showApiButton) {
            const btn = document.getElementById('api-btn');
            if (btn) btn.style.display = 'none';
        }

        // Dil metinlerini güncelle
        document.querySelector('h1').textContent = t('title');
        document.querySelector('.title p').textContent = t('subtitle');
        const apiBtn = document.getElementById('api-btn');
        if (apiBtn) apiBtn.innerHTML = `<i class="fas fa-database"></i> ${t('apiBtn')}`;

        // 3. Changelog'u yükle
        loadChangelog();

    } catch (e) {
        console.error("Config yüklenemedi", e);
        loadChangelog(); // Config yüklenemese de varsayılanlarla devam et
    }
}

async function loadChangelog() {
    const container = document.getElementById('changelog');

    try {
        const res = await fetch('/api/changelog?limit=200');
        const data = await res.json();

        document.getElementById('total-commits').textContent = t('totalCommits', data.total);

        const dates = Object.keys(data.grouped).sort((a, b) => new Date(b) - new Date(a));

        if (dates.length === 0) {
            container.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 40px;">${t('noCommits')}</p>`;
            return;
        }

        let html = '<div class="timeline-line"></div>';

        for (const date of dates) {
            const commits = data.grouped[date];
            const dateLabel = formatDate(date);

            html += `
                <div class="date-group">
                    <div class="date-header">
                        <div class="date-dot"></div>
                        <span class="date-label">${dateLabel}</span>
                    </div>
                    
                    <div class="commits-list">
            `;

            for (const c of commits) {
                const color = colors[c.repo.language] || '#94a3b8';
                const msg = escapeHtml(c.commit.message.split('\n')[0]);
                const sha = c.sha.substring(0, 7);
                const author = c.commit.author.name;
                const avatar = (c.author && c.author.avatar_url) ? c.author.avatar_url : 'https://github.com/ghost.png';
                const isPrivate = c.repo.private;
                const repoName = c.repo.name;
                const commitDate = new Date(c.commit.author.date);
                const timeAgoStr = timeAgo(commitDate);
                const repoUrl = c.repo.html_url;
                const commitUrl = c.html_url;

                html += `
                    <div class="commit-item">
                        <div class="commit-card ${isPrivate ? 'private-repo' : ''}">
                            <div class="card-header">
                                <div class="commit-message">${msg}</div>
                                <div class="commit-meta">
                                    ${isPrivate ?
                        `<span class="private-badge"><i class="fas fa-lock"></i> ${t('privateBadge')}</span>` :
                        `<a href="${commitUrl}" target="_blank" class="sha-badge">${sha}</a>`
                    }
                                </div>
                            </div>
                            
                            <div class="card-footer">
                                <div class="repo-info">
                                    <div class="repo-lang-dot" style="background-color: ${color}"></div>
                                    <a href="${isPrivate ? '#' : repoUrl}" target="${isPrivate ? '' : '_blank'}" 
                                       class="repo-name" style="text-decoration:none; color:inherit;">
                                       ${repoName}
                                    </a>
                                </div>
                                
                                <div class="author-info">
                                    <img src="${avatar}" class="author-avatar" alt="${author}">
                                    <span class="time-ago">${timeAgoStr}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;

    } catch (error) {
        console.error('Yükleme hatası:', error);
        container.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <p style="color: #ef4444; margin-bottom: 20px;">${t('errorTitle')}</p>
                <button onclick="loadChangelog()" class="api-btn" style="margin: 0 auto;">${t('retryBtn')}</button>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initApp);
setInterval(loadChangelog, 300000); // 5 dakikada bir yenile
