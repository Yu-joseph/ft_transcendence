up :
	cd docker && docker compose up 
build :
	bash ip.sh
	cd docker && docker compose up --build

start :
	cd docker && docker compose start

stop :
	cd docker && docker compose stop

down:
	cd docker && docker compose down

clean:
	cd docker && docker compose down -v

ps :
	docker ps 

rm_vol:
	@docker volume prune -f

fclean :
	cd docker && docker compose down -v
	rm -rf docker/vault/data/*
	rm -rf docker/vault/userconfig/tls/*
	rm -rf docker/vault/userconfig/*.json
re : fclean rm_vol  build