build:
	docker-compose -p shop-api build

up:
	docker-compose -p shop-api up

up-prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml -p shop-api up

down:
	docker-compose -p shop-api down

db-up:
	docker-compose -f docker-compose.db.yml -p shop-api up -d

test:
	npm run test