# PookalBot 🌸

> AI-Powered Autonomous Pookalam Robot — ThinkerHub Onam Edition

PookalBot is a hackathon robot that autonomously dry-cleans an area, draws a Pookalam using a polar-plotter turret, and wet-cleans afterwards.

---

## Project Structure

```
├── ai/                  # AI design generation + SVG generator
├── cv/                  # Computer-vision image→path pipeline
├── esp32/               # ESP32 firmware (UART protocol + motor stubs)
├── pi/                  # Raspberry Pi serial link
├── server/              # FastAPI backend
├── web/static/          # Frontend dashboard (HTML/CSS/JS)
└── docs/                # Protocol spec + CV pipeline docs
```

---

## Quick Start

### Backend
```bash
# Set AI key (optional — falls back to local generator without it)
$env:AI_API_KEY = "your-key-here"

python -m uvicorn server.main:app --reload
# API docs → http://localhost:8000/docs
```

### Frontend (static)
```bash
python -m http.server 8080 --directory web/static
# Open → http://localhost:8080
```

### CV Pipeline
```bash
pip install -r requirements-cv.txt
python -m cv.cli samples/pookalam.jpg --debug
```

### Tests
```bash
python -m pytest cv/tests/ -v          # CV pipeline tests
python -m pytest server/tests/ -v      # API tests
python -m pytest ai/tests/ -v          # AI/SVG tests
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AI_API_KEY` | Cohere API key | No — uses local fallback |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health + AI status |
| POST | `/api/designs/generate` | Generate 3 design candidates |
| POST | `/api/designs/select` | Select a design |
| GET | `/api/designs/current` | Get selected design |
| GET | `/api/path/preview` | Path preview (next stage) |

---

## Tech Stack

- **Pi**: Python, FastAPI, OpenCV, NumPy
- **ESP32**: Arduino C++, ArduinoJson
- **Frontend**: Vanilla HTML/CSS/JS
- **AI**: Cohere (with deterministic local fallback)
- **Protocol**: Line-delimited JSON over UART
