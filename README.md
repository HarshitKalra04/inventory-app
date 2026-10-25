# Inventory & Order Management System

A full-stack Inventory & Order Management System built with **FastAPI**, **React**, and **PostgreSQL**, fully containerized with **Docker**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Pydantic |
| Frontend | React 18, Vite, React Router |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |

---

## Features

- **Products** — CRUD with unique SKU enforcement, price & quantity validation
- **Customers** — Create/list/delete with unique email enforcement
- **Orders** — Create multi-item orders; auto stock deduction; cancel restores stock
- **Dashboard** — Live stats: total products, customers, orders, low-stock alerts
- **Business rules** — Cannot place order if stock is insufficient; total calculated by backend

---

## Local Development with Docker

### 1. Clone and configure

```bash
git clone https://github.com/HarshitKalra04/inventory-app.git
cd inventory-app
cp .env.example .env
# Edit .env if you want different DB credentials
```

### 2. Start all services

```bash
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 3. Stop

```bash
docker compose down
# To also remove the database volume:
docker compose down -v
```

---

## Project Structure

```
inventory-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, startup
│   │   ├── config.py        # Settings via env vars
│   │   ├── database.py      # SQLAlchemy engine & session
│   │   ├── models.py        # DB models (Product, Customer, Order, OrderItem)
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       ├── orders.py
│   │       └── dashboard.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/index.js     # Axios API client
│   │   ├── pages/           # Dashboard, Products, Customers, Orders, OrderDetail
│   │   ├── App.jsx          # Router & Sidebar layout
│   │   └── main.jsx
│   ├── Dockerfile           # Multi-stage: build + nginx
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
└── .env.example
```

---

## API Endpoints

### Products
| Method | Path | Description |
|--------|------|-------------|
| GET | /products | List all |
| POST | /products | Create (unique SKU) |
| GET | /products/{id} | Get one |
| PUT | /products/{id} | Update |
| DELETE | /products/{id} | Delete |

### Customers
| Method | Path | Description |
|--------|------|-------------|
| GET | /customers | List all |
| POST | /customers | Create (unique email) |
| GET | /customers/{id} | Get one |
| DELETE | /customers/{id} | Delete |

### Orders
| Method | Path | Description |
|--------|------|-------------|
| GET | /orders | List all |
| POST | /orders | Create (validates stock, auto-deducts) |
| GET | /orders/{id} | Get details |
| DELETE | /orders/{id} | Cancel (restores stock) |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | /dashboard | Summary stats + low-stock list |

Interactive docs at `/docs` (Swagger UI).

---

## Deployment

### Backend — Render (free tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, set root directory to `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `DATABASE_URL` — your PostgreSQL connection string (Render provides a free Postgres)
   - `ALLOWED_ORIGINS` — your Vercel frontend URL

### Frontend — Vercel (free tier)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your repo, set root to `frontend/`
3. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://your-app.onrender.com`)
4. Deploy — Vercel auto-detects Vite

### Docker Hub — Backend Image

```bash
docker build -t yourdockerhubuser/inventory-backend:latest ./backend
docker push yourdockerhubuser/inventory-backend:latest
```

---

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://postgres:postgres@db:5432/inventory_db | Full Postgres URL |
| ALLOWED_ORIGINS | http://localhost:3000 | Comma-separated CORS origins |

### Frontend (build-time)
| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:8000 | Backend API base URL |
