let config = {
    showPrivateRepos: true,
    showApiButton: true,
    defaultLang: 'TR'
};

// Sayfalama değişkenleri
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let allDates = {};

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
        justNow: 'az önce',
        loadingMore: 'Daha fazla yükleniyor...',
        noMoreData: 'Tüm commitler yüklendi'
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
        justNow: 'just now',
        loadingMore: 'Loading more...',
        noMoreData: 'All commits loaded'
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

        // 4. Infinite scroll event listener
        window.addEventListener('scroll', handleScroll);

    } catch (e) {
        console.error("Config yüklenemedi", e);
        loadChangelog(); // Config yüklenemese de varsayılanlarla devam et
    }
}

// Infinite scroll handler
function handleScroll() {
    if (isLoading || !hasMore) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 500;

    if (scrollPosition >= threshold) {
        loadMoreCommits();
    }
}

// İlk yükleme
async function loadChangelog() {
    const container = document.getElementById('changelog');
    currentPage = 1;
    allDates = {};
    hasMore = true;

    try {
        const res = await fetch('/api/changelog?limit=20&page=1');
        const data = await res.json();

        document.getElementById('total-commits').textContent = t('totalCommits', data.total);
        hasMore = data.hasMore;

        // Tarihleri birleştir
        Object.keys(data.grouped).forEach(date => {
            if (!allDates[date]) {
                allDates[date] = [];
            }
            allDates[date].push(...data.grouped[date]);
        });

        renderChangelog();

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

// Daha fazla commit yükle
async function loadMoreCommits() {
    if (isLoading || !hasMore) return;

    isLoading = true;
    currentPage++;

    // Loading göstergesi ekle
    const loadingEl = document.getElementById('scroll-loading');
    if (loadingEl) {
        loadingEl.style.display = 'block';
        loadingEl.textContent = t('loadingMore');
    }

    try {
        const res = await fetch(`/api/changelog?limit=20&page=${currentPage}`);
        const data = await res.json();

        hasMore = data.hasMore;

        // Yeni tarihleri birleştir
        Object.keys(data.grouped).forEach(date => {
            if (!allDates[date]) {
                allDates[date] = [];
            }
            allDates[date].push(...data.grouped[date]);
        });

        renderChangelog();

    } catch (error) {
        console.error('Daha fazla yükleme hatası:', error);
        currentPage--; // Başarısız olursa sayfa numarasını geri al
    } finally {
        isLoading = false;
        const loadingEl = document.getElementById('scroll-loading');
        if (loadingEl) {
            loadingEl.style.display = hasMore ? 'none' : 'block';
            if (!hasMore) {
                loadingEl.textContent = t('noMoreData');
                loadingEl.classList.add('no-more');
            }
        }
    }
}

// Changelog'u render et
function renderChangelog() {
    const container = document.getElementById('changelog');
    const dates = Object.keys(allDates).sort((a, b) => new Date(b) - new Date(a));

    if (dates.length === 0) {
        container.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 40px;">${t('noCommits')}</p>`;
        return;
    }

    let html = '<div class="timeline-line"></div>';

    for (const date of dates) {
        const commits = allDates[date];
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

    // Scroll loading göstergesi
    html += `<div id="scroll-loading" class="scroll-loading" style="display: none;"></div>`;

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', initApp);
// 5 dakikada bir yenile - ilk sayfadan başla
setInterval(() => {
    currentPage = 1;
    allDates = {};
    hasMore = true;
    loadChangelog();
}, 300000);
