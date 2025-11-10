# 🎮 GameLy — Gaming Social Media Platform (Express.js + TypeScript)

GameLy is a **multilingual, full-featured social media platform for gamers**, built with **Express.js**, **TypeScript**, and **MongoDB**.  
Originally started as a gaming blog, it evolved into a **complete social network for gamers**, featuring authentication, posts, follows, reports, moderation, and much more.

---

## 🚀 Tech Stack

**Backend:** Node.js, Express.js, TypeScript  
**Database:** MongoDB (Mongoose)  
**Testing:** Vitest, Supertest, Mongo Memory Server  
**Validation:** class-validator, class-transformer  
**Logging:** Winston, Morgan  
**Security:** Helmet, HPP, express-mongo-sanitize, rate-limiting  
**Internationalization:** i18n (multi-language support for both backend & frontend)  
**Dependency Injection:** tsyringe  
**Environment Management:** Config package (per environment setup)

---

## 🧩 Features Overview

### 🧑‍💻 Authentication & Authorization

- JWT-based authentication (Access + Refresh tokens)
- Multiple active sessions per user
- Password recovery with token-based email verification
- Role system: **Super Admin**, **Admin**, **Writer**, **User**

### 🕹️ Core Features

- Full CRUD for **Posts**, **Tags**, **Categories**, **Games**, and much more
- Filter posts by tags, categories, or games
- Comment & reply system under posts
- Like and favorite system for games
- Multi-language content (fully i18n ready)
- Follow/unfollow system
- User notifications system
- File upload management
- Dynamic dashboard for managing users, posts, reports, and more

### 🚫 Moderation & Reporting

- Report system for posts, comments, and users (handled by admins)
- Ban system (temporary or permanent) with reason & expiration
- Block system for users (both by admins and by other users)
- Rate-limiting for sensitive endpoints
- Sanitized and safe inputs with proper validation

### ⚙️ Infrastructure & Architecture

- Clean layered architecture:  
```
Request → Middleware → Controller → Service → Mapper (DTO) → Response
```
- Base Service class for reusable CRUD logic
- Strong separation of modules:
```
src/
├── core/
├── features/
│   ├── client/
│   │   └── post/
│   ├── management/
│   │   └── report/
│   └── shared/
│       └── auth/
└── locales/
```

### 🧠 Design Patterns

- **Dependency Injection** (tsyringe)
- **Repository-Service-Controller** architecture
- **DTO + Mapper** pattern for response formatting
- **Custom Error Classes** for unified error handling

---

## 🧪 Testing

All main features are covered with **integration tests** using `vitest`, `supertest`, and `mongo-memory-server`.  
Fake data generation with `faker`.

**Coverage Report:**
```
Test Files  41 passed (41)
Tests       296 passed (296)
Duration    217.47s
Code Coverage:
  Statements   74.09%
  Branches     51.24%
  Functions    70.25%
  Lines        74.71%
```

✅ Strong focus on integration-level coverage rather than isolated units.  
✅ Full test suite runs in-memory (no external DB required).

---

## 📊 Admin Dashboard

- Manage posts, comments, users, reports, games, tags, and categories
- Ban / unban users
- Review user reports and comments
- Monitor user activity

---

## 🌍 Frontend

The frontend is built with **React.js** — fully multilingual, and integrated with the backend APIs.

🖥️ [Frontend Repository (GameLy-User)](https://github.com/iamPedram1/gamely-front)  
🧩 [Backend Repository (GameLy-API)](https://github.com/iamPedram1/gamely-back)

---

## 🧱 Example Collections

You can test API endpoints using this Postman collection:  
📦 [GameLy API Postman Collection](https://www.postman.com/pm9999/workspace/gamely-api/collection/20997982-88ee4296-56ba-44ed-a253-99b749d311a5?action=share&creator=20997982&active-environment=20997982-1f0b0a00-df69-424f-a0f2-017311f5e2f5)

---

## 📁 Folder Structure

```
src/
├── core/
│   ├── utilities/
│   └── middlewares/
│   └── types/
│   └── dto/
│   └── mappers/
│   └── services/
│   └── startup/
├── features/
│   ├── client/
│   │   ├── post/
│   │   └── game/
│   │   └── .../
│   ├── management/
│   │   ├── report/
│   │   └── user/
│   │   └── .../
│   └── shared/
│       ├── auth/
│       ├── comment/
│       ├── follow/
│       └── notification/
│       └── .../
└── locales/
```

---

## 🛡️ Security Highlights

- Rate limiting on sensitive routes
- Sanitized requests (`express-mongo-sanitize`, `hpp`)
- Custom error handling for security-sensitive responses
- Environment-based config management

---

## 📈 Performance Optimizations

- `.lean()` used in read operations for speed
- Caching strategies prepared for future Redis integration
- Lightweight validation middleware chain

---

## 🧰 Development & Setup

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run development
npm run dev

# Run tests
npm run test
```

---

## 🧑‍💻 Author

**Pedram Alizadeh — Fullstack Developer**  
Passionate about clean architecture, scalability, and creating impactful fullstack apps.  
🚀 [LinkedIn](https://linkedin.com/in/your-profile) | [Portfolio](https://your-portfolio-link)

---

## 🏁 TL;DR

✔️ Full-featured Express.js + TypeScript backend  
✔️ Clean architecture with dependency injection  
✔️ 74%+ integration test coverage  
✔️ i18n multilingual support  
✔️ Secure, scalable, production-ready  
✔️ Built by one developer, end-to-end
