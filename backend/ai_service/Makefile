DC = docker compose

all: start

start:
	@echo "Building React app..."
	docker run --rm \
		-v $(PWD)/llm-studio:/app \
		-w /app \
		node:20-alpine \
		sh -c "rm -rf node_modules && npm install && npm run build"
	@mkdir -p static/llm-studio
	@cp -r llm-studio/dist/. static/llm-studio/
	@echo "Starting containers..."
	$(DC) up --build -d
	@echo ""
	@echo "App running on:"
	@echo "   Game:    http://localhost:5000/game"
	@echo "   Studio:  http://localhost:5000/studio"
	@echo ""

stop:
	$(DC) down

clean:
	$(DC) down -v
	docker system prune -f

logs:
	$(DC) logs -f

logs-chat:
	$(DC) logs -f chat-api

logs-game:
	$(DC) logs -f game-api

dev-react:
	@echo "React dev server → http://localhost:5173"
	cd llm-studio && npm run dev

dev-flask:
	@echo "Flask dev server → http://localhost:5000"
	cd services/chat_api && python app.py

ps:
	$(DC) ps

restart:
	$(DC) restart

.PHONY: all start stop clean logs logs-chat logs-game dev-react dev-flask ps restart