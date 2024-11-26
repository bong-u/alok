docker run -it --name fe -p 3000:3000 -v ./fe:/app --network alok-network node:alpine
docker run -it --name be -p 3001:3001 -v ./be:/app --network alok-network node:alpine 
docker run -d --name redis-token-store --network alok-network redis:alpine

docker run --rm -it --name sqlite-access -v ./be/db.sqlite3:/data/db.sqlite3 alpine

apk add --no-cache sqlite
sqlite3 /data/db.sqlite3

