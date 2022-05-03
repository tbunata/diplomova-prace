# Srovnání REST, GraphQL a gRPC API v Node.js
Cílem práce je vytvořit shodné API v REST, GraphQL a gRPC nad Node.js. Součástí práce bude rešeršní část o jednotlivých technologiích, ekosystému a jejich podpoře v Node.js. Navazovat bude implementační část API s použitím daných technologií. Dále budou jednotlivé technologie srovnány mezi sebou.

1. Popište technologie Node.js, REST, GraphQL a gRPC.
2. Implementujte shodné API v Node.js s použitím daných technologií (s testy).
3. Popište metodologii porovnání (dokumentace, rychlost a DX vývoje, výkonnostní testování, …).
4. Proveďte srovnání a zhodnoťte.

## Návrh API
https://app.swaggerhub.com/apis/tbunata/shop/1.0.0

## Instalační příručka

Spuštění projektů vyžaduje:
* Docker
* Docker-compose
* Node
* npm

### REST API

Projekt se dá spravovat následujícími příkazy
* `npm install` - instalace závislostí projektu.
* `make build` - sestavení potřebných Docker imagů.
* `make up` - spuštění projektu v Docker kontejnerech - databáze a server
* `make up-prod` - spuštění projektu v produkčním režimu.
* `make up-db` - spuštění samotné databáze v Docker kontejneru. Vhodné při lokálním spouštěním serveru.
* `make down` - zastavení Docker kontejnerů.
* `make test` - spuštění testů.
* `npm run start:dev` - spuštění serveru lokálně v development režimu

Samotné spuštění serveru a databáze by nemělo vyžadovat žádnou další konfiguraci. Je pouze nutný seed databáze - k tomu je potřeba se převtělit do Docker kontejneru s běžícím serverem a spustit příkaz `npx prisma migrate seed` nebo `npx prisma migrate reset`.

Při spouštění serveru lokálně je potřeba upravit v souboru `.env` proměnnou DATABASE_URL aby ukazovala na localhost - protože server nepřistupuje k databázi z Docker sítě.

Dokumentace REST API je pak popsána v souboru `src/shop-rest/shop-api.yml` nebo dostupná na https://app.swaggerhub.com/apis/tbunata/shop/1.0.0#/

### GraphQL API

Projekt se dá spravovat následujícími příkazy:
* `npm install` - instalace závislostí projektu.
* `make build` - sestavení potřebných Docker imagů.
* `make up` - spuštění projektu v Docker kontejnerech - databáze a server
* `make up-prod` - spuštění projektu v produkčním režimu.
* `make up-db` - spuštění samotné databáze v Docker kontejneru. Vhodné při lokálním spouštěním serveru.
* `make down` - zastavení Docker kontejnerů.
* `make test` - spuštění testů.
* `npm run start:dev` - spuštění serveru lokálně v development režimu

Samotné spuštění serveru a databáze by nemělo vyžadovat žádnou další konfiguraci. Je pouze nutný seed databáze - k tomu je potřeba se převtělit do Docker kontejneru s běžícím serverem a spustit příkaz `npx prisma migrate seed` nebo `npx prisma migrate reset`.

Při spouštění serveru lokálně je potřeba upravit v souboru `.env` proměnnou DATABASE_URL aby ukazovala na localhost - protože server nepřistupuje k databázi z Docker sítě.

Dokumentace GraphQL API je pak popsána v souboru `src/shop-graphql/schema.gql`. Pro vyzkoušení API je také v development režimu dostupný GraphQL Playground, stačí do prohlížeče zadat addresu GraphQL API - `http://localhost:3333/graphql`

### gRPC API

Projekt se dá spravovat následujícími příkazy:
* `npm install` - instalace závislostí projektu.
* `npm run build:grpc` - kompilace `.proto` souborů.
* `make build` - sestavení potřebných Docker imagů.
* `make up` - spuštění projektu v Docker kontejnerech - databáze a server
* `make up-prod` - spuštění projektu v produkčním režimu.
* `make up-db` - spuštění samotné databáze v Docker kontejneru. Vhodné při lokálním spouštěním serveru.
* `make down` - zastavení Docker kontejnerů.
* `make test` - spuštění testů.
* `npm run start:dev` - spuštění serveru lokálně v development režimu

Samotné spuštění serveru a databáze by nemělo vyžadovat žádnou další konfiguraci. Po spuštění je ještě nutný seed databáze - k tomu je potřeba se převtělit do Docker kontejneru s běžícím serverem a spustit příkaz `npx prisma migrate seed` nebo `npx prisma migrate reset`.

Při spouštění serveru lokálně je potřeba upravit v souboru `.env` proměnnou DATABASE_URL aby ukazovala na localhost - protože server nepřistupuje k databázi z Docker sítě.

Dokumentace gRPC API je dostupná v Protocol Buffer specifikaci v `src/shop-grpc/src/proto`. Pro snadné vyzkoušení gRPC API je vhodný nástroj BloomRPC, kam se `.proto` soubory naimportují. Stačí pak nastavit adresu serveru a je možné volat metody na serveru.
