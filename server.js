/**
 * GitHub Changelog Takip Sistemi
 * Tüm repolarınızdaki commit geçmişini tarih bazlı görüntüleyin
 * @author Furkan YILDIRIM
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GitHub API konfigürasyonu
const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'fyildirim-debug';

// GitHub API header'ları
const getHeaders = () => {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Changelog-App'
    };
    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    return headers;
};

// Kullanıcı bilgilerini getir
app.get('/api/user', async (req, res) => {
    try {
        const response = await axios.get(`${GITHUB_API}/users/${GITHUB_USERNAME}`, {
            headers: getHeaders()
        });
        res.json(response.data);
    } catch (error) {
        console.error('Kullanıcı bilgisi alınamadı:', error.message);
        res.status(500).json({ error: 'Kullanıcı bilgisi alınamadı' });
    }
});

// Tüm repoları getir (private dahil - token gerekli)
app.get('/api/repos', async (req, res) => {
    try {
        // Token varsa /user/repos kullan (private repolar dahil)
        // Token yoksa /users/{username}/repos kullan (sadece public)
        const endpoint = GITHUB_TOKEN
            ? `${GITHUB_API}/user/repos`
            : `${GITHUB_API}/users/${GITHUB_USERNAME}/repos`;

        const response = await axios.get(endpoint, {
            headers: getHeaders(),
            params: {
                sort: 'updated',
                direction: 'desc',
                per_page: 100,
                affiliation: 'owner' // Sadece sahip olduğu repolar
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Repolar alınamadı:', error.message);
        res.status(500).json({ error: 'Repolar alınamadı' });
    }
});

// Belirli bir reponun commitlerini getir
app.get('/api/repos/:repo/commits', async (req, res) => {
    try {
        const { repo } = req.params;
        const { per_page = 30, page = 1 } = req.query;

        const response = await axios.get(`${GITHUB_API}/repos/${GITHUB_USERNAME}/${repo}/commits`, {
            headers: getHeaders(),
            params: {
                per_page: parseInt(per_page),
                page: parseInt(page)
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(`${req.params.repo} commitlari alınamadı:`, error.message);
        res.status(500).json({ error: 'Commitler alınamadı' });
    }
});

// Konfigürasyonu getir
app.get('/api/config', (req, res) => {
    res.json({
        showPrivateRepos: process.env.SHOW_PRIVATE_REPOS === 'true',
        showApiButton: process.env.SHOW_API_BUTTON === 'true',
        defaultLang: process.env.DEFAULT_LANG || 'TR'
    });
});

// Tüm repoların commitlerini birleştirip tarih sıralı getir
app.get('/api/changelog', async (req, res) => {
    try {
        const { limit = 100 } = req.query;
        const showPrivate = process.env.SHOW_PRIVATE_REPOS === 'true';

        // Önce tüm repoları al
        const endpoint = GITHUB_TOKEN
            ? `${GITHUB_API}/user/repos`
            : `${GITHUB_API}/users/${GITHUB_USERNAME}/repos`;

        const reposResponse = await axios.get(endpoint, {
            headers: getHeaders(),
            params: {
                sort: 'updated',
                direction: 'desc',
                per_page: 100,
                affiliation: 'owner'
            }
        });

        let repos = reposResponse.data;

        // EĞER ENV'de GİZLİ REPO KAPALIYSA server tarafında filtrele
        if (!showPrivate) {
            repos = repos.filter(repo => !repo.private);
        }

        const allCommits = [];

        // Her repodan son commitleri al
        const commitPromises = repos.map(async (repo) => {
            try {
                const commitsResponse = await axios.get(
                    `${GITHUB_API}/repos/${GITHUB_USERNAME}/${repo.name}/commits`,
                    {
                        headers: getHeaders(),
                        params: { per_page: 20 }
                    }
                );

                return commitsResponse.data.map(commit => ({
                    ...commit,
                    repo: {
                        name: repo.name,
                        full_name: repo.full_name,
                        html_url: repo.html_url,
                        language: repo.language,
                        description: repo.description,
                        private: repo.private
                    }
                }));
            } catch (error) {
                // Boş repolar için hata vermemesi için
                // console.log(`${repo.name} için commit alınamadı:`, error.message);
                return [];
            }
        });

        const commitsArrays = await Promise.all(commitPromises);
        commitsArrays.forEach(commits => allCommits.push(...commits));

        // Tarihe göre sırala
        allCommits.sort((a, b) => {
            const dateA = new Date(a.commit.author.date);
            const dateB = new Date(b.commit.author.date);
            return dateB - dateA;
        });

        // Tarih bazlı grupla
        const groupedByDate = {};
        allCommits.slice(0, parseInt(limit)).forEach(commit => {
            const date = new Date(commit.commit.author.date).toISOString().split('T')[0];
            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }
            groupedByDate[date].push(commit);
        });

        res.json({
            total: allCommits.length,
            grouped: groupedByDate,
            commits: allCommits.slice(0, parseInt(limit))
        });

    } catch (error) {
        console.error('Changelog oluşturulamadı:', error.message);
        res.status(500).json({ error: 'Changelog oluşturulamadı' });
    }
});

// İstatistikleri getir
app.get('/api/stats', async (req, res) => {
    try {
        // Kullanıcı bilgisi
        const userResponse = await axios.get(`${GITHUB_API}/users/${GITHUB_USERNAME}`, {
            headers: getHeaders()
        });

        // Repolar
        const reposResponse = await axios.get(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos`, {
            headers: getHeaders(),
            params: { per_page: 100 }
        });

        let repos = reposResponse.data;
        const showPrivate = process.env.SHOW_PRIVATE_REPOS === 'true';
        if (!showPrivate) {
            repos = repos.filter(repo => !repo.private);
        }

        // Dil istatistikleri
        const languageStats = {};
        repos.forEach(repo => {
            if (repo.language) {
                languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
            }
        });

        // Toplam yıldız
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

        // Toplam fork
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

        res.json({
            user: userResponse.data,
            repoCount: repos.length,
            totalStars,
            totalForks,
            languageStats,
            recentRepos: repos.slice(0, 5)
        });

    } catch (error) {
        console.error('İstatistikler alınamadı:', error.message);
        res.status(500).json({ error: 'İstatistikler alınamadı' });
    }
});

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║       🚀 GitHub Changelog Takip Sistemi                    ║
║       Sunucu başlatıldı: http://localhost:${PORT}             ║
║       Kullanıcı: ${GITHUB_USERNAME.padEnd(35)}    ║
║       Gizli Repo: ${process.env.SHOW_PRIVATE_REPOS}                      ║
╚════════════════════════════════════════════════════════════╝
    `);
});
