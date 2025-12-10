# 📋 GitHub Changelog Takip Sistemi | GitHub Changelog Tracker

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.18+-000000?style=for-the-badge&logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**GitHub kullanıcısının tüm repolarındaki commit geçmişini tek bir sayfada tarih bazlı görüntüleyen modern web uygulaması.**

*A modern web application that displays the commit history of all GitHub user repositories on a single page, grouped by date.*

[🇹🇷 Türkçe](#-türkçe) | [🇬🇧 English](#-english)

</div>

---

## 🇹🇷 Türkçe

### 🌟 Özellikler

- **📅 Tarih Bazlı Gruplandırma** - Tüm commitlerinizi tarih sırasına göre görüntüleyin
- **🔍 Gerçek Zamanlı Arama** - Commit mesajları ve repo isimleri arasında anlık arama
- **🌙 Karanlık Mod** - Göz yormayan karanlık tema desteği
- **📊 GitHub İstatistikleri** - Repo sayısı, yıldız, fork ve dil istatistikleri
- **🔐 Gizli Repo Desteği** - Private repolarınızı da görüntüleyebilirsiniz
- **🌐 Çoklu Dil** - Türkçe ve İngilizce dil desteği
- **🐳 Docker Ready** - Docker ile kolay kurulum

### 🚀 Hızlı Başlangıç

#### Gereksinimler
- Node.js 18+
- GitHub Personal Access Token ([buradan oluşturun](https://github.com/settings/tokens))

#### Kurulum

```bash
# Repoyu klonlayın
git clone https://github.com/fyildirim-debug/github-changelog-tracker.git
cd github-changelog-tracker

# Bağımlılıkları yükleyin
npm install

# .env dosyasını oluşturun
cp .env.example .env

# .env dosyasını düzenleyin ve uygulamayı başlatın
npm start
```

Tarayıcınızda `http://localhost:3000` adresine gidin.

#### 🐳 Docker ile Kurulum

```bash
docker-compose up -d
```

### ⚙️ Yapılandırma

`.env` dosyasını düzenleyin:

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | - |
| `GITHUB_USERNAME` | GitHub kullanıcı adı | - |
| `PORT` | Sunucu portu | 3000 |
| `SHOW_PRIVATE_REPOS` | Gizli repoları göster | false |
| `SHOW_API_BUTTON` | API butonunu göster | false |
| `DEFAULT_LANG` | Varsayılan dil | TR |

### 📡 API Endpointleri

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/user` | Kullanıcı bilgileri |
| `GET /api/repos` | Tüm repolar |
| `GET /api/changelog` | Tarih bazlı commit listesi |
| `GET /api/stats` | GitHub istatistikleri |
| `GET /api/config` | Uygulama yapılandırması |

---

## 🇬🇧 English

### 🌟 Features

- **📅 Date-Based Grouping** - View all your commits sorted by date
- **🔍 Real-Time Search** - Instant search through commit messages and repo names
- **🌙 Dark Mode** - Eye-friendly dark theme support
- **📊 GitHub Statistics** - Repo count, stars, forks and language statistics
- **🔐 Private Repo Support** - View your private repositories too
- **🌐 Multi-Language** - Turkish and English language support
- **🐳 Docker Ready** - Easy deployment with Docker

### 🚀 Quick Start

#### Requirements
- Node.js 18+
- GitHub Personal Access Token ([create here](https://github.com/settings/tokens))

#### Installation

```bash
# Clone the repository
git clone https://github.com/fyildirim-debug/github-changelog-tracker.git
cd github-changelog-tracker

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file and start the application
npm start
```

Open `http://localhost:3000` in your browser.

#### 🐳 Docker Installation

```bash
docker-compose up -d
```

### ⚙️ Configuration

Edit the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | - |
| `GITHUB_USERNAME` | GitHub username | - |
| `PORT` | Server port | 3000 |
| `SHOW_PRIVATE_REPOS` | Show private repos | false |
| `SHOW_API_BUTTON` | Show API button | false |
| `DEFAULT_LANG` | Default language | TR |

### 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/user` | User information |
| `GET /api/repos` | All repositories |
| `GET /api/changelog` | Date-based commit list |
| `GET /api/stats` | GitHub statistics |
| `GET /api/config` | Application configuration |

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** Vanilla JavaScript, CSS3
- **API:** GitHub REST API v3
- **Containerization:** Docker, Docker Compose

## 📁 Project Structure

```
github-changelog-tracker/
├── server.js           # Express.js server
├── package.json        # Dependencies
├── .env.example        # Environment template
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose config
└── public/
    ├── index.html      # Main HTML
    ├── app.js          # Frontend JavaScript
    └── style.css       # Styles
```

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

<div align="center">

**Furkan YILDIRIM**

[![GitHub](https://img.shields.io/badge/GitHub-fyildirim--debug-181717?style=for-the-badge&logo=github)](https://github.com/fyildirim-debug)
[![Website](https://img.shields.io/badge/Website-furkanyildirim.com-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://furkanyildirim.com)

</div>

---

<div align="center">

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! | Don't forget to star if you like this project! ⭐

</div>
