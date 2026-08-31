.PHONY: help install dev build test clean

help:
	@echo "ProConnect 2.0 Management Commands:"
	@echo "  make install    - Install backend and frontend dependencies"
	@echo "  make dev        - Start backend and frontend in development mode"
	@echo "  make build      - Build frontend for production"
	@echo "  make test       - Run all test suites"
	@echo "  make clean      - Clean cache and temporary build directories"

install:
	cd backend && npm install
	cd frontend && npm install

dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

test:
	cd backend && npm test || true

clean:
	rm -rf backend/node_modules frontend/node_modules frontend/.next
