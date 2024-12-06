docker run -it --name fe -p 3000:3000 -v ./fe:/app --network alok-network node:alpine
docker run -it --name be -p 3001:3001 -v ./be:/app --network alok-network node:alpine 
docker run -d --name redis-token-store --network alok-network redis:alpine
docker run --name alok_db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=<password> -e POSTGRES_DB=alok --network alok-network -d postgres

/* sqlite 접근 */
docker run --rm -it --name sqlite-access -v ./be/db.sqlite3:/data/db.sqlite3 alpine
apk add --no-cache sqlite
sqlite3 /data/db.sqlite3

/* redis 접근 */
docker exec -it redis-token-store redis-cli

/* postgres 접근 */
docker exec -it alok_db psql -U admin -d alok

