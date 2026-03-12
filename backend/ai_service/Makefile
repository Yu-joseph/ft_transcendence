DC = docker compose

all: start

start:
	@echo "Starting containers..."
	cd llm-studio && npm install && npm run build && cd ..
	cp -r llm-studio/dist/* static/llm-studio/
	$(DC) up --build -d
	@echo ""
	@echo "App running on:"
	@echo "   Game:    http://localhost:5000"
	@echo "   Studio:  http://localhost:5000/studio"
	@echo ""

stop:
	@echo "Stopping containers..."
	$(DC) down

clean:
	@echo "Cleaning containers & volumes..."
	$(DC) down -v
	docker system prune -f
	@rm -rf /Users/bouhammo/data/*


logs:
	$(DC) logs -f

build-react:
	@echo "Building React app..."
	cd llm-studio && npm install && npm run build
	@mkdir -p static/llm-studio
	@cp -r llm-studio/dist/* static/llm-studio/
	@echo "React build copied to static/llm-studio/"

dev:
	@echo "Starting dev mode..."
	@echo "   Flask:  http://localhost:5000"
	@echo "   React:  http://localhost:5173"
	@echo ""
	cd llm-studio && npm run dev

.PHONY: all start stop clean logs build-react dev