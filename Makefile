up :
	bash ip.sh
	cd docker && docker compose up 
build :
	bash ip.sh
	cd docker && docker compose up --build

start :
	bash ip.sh
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
	@docker volume ls -q | xargs -r docker volume rm

fclean :
	rm -rf docker/vault/data/*
	rm -rf docker/vault/userconfig/tls/*
	rm -rf docker/vault/userconfig/*.json
	rm -rf backend/auth/myauth/authentication/migrations/0*.py