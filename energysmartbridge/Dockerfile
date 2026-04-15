FROM node:22-bullseye-slim AS build

WORKDIR /build
COPY . .

RUN npm install
RUN npm run build
RUN npm run blob
RUN cp $(command -v node) dist

RUN npx postject dist NODE_SEA_BLOB dist.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

# Build script now: tsc -> dist-ts/index.js, then esbuild bundles to dist.js

FROM nginx:1.24.0

RUN apt-get update && apt-get install -y openssl && apt-get install -y nodejs && apt-get install -y npm

COPY nginx.conf /etc/nginx/nginx.conf

RUN openssl req  -nodes -new -x509 -sha1 -subj '/CN=energysmartwaterheater.com' -keyout /etc/nginx/energysmartwaterheater.com.key -out /etc/nginx/energysmartwaterheater.com.crt -days 3650

COPY --from=build /build/dist ./app
COPY run.sh .

EXPOSE 443/tcp

CMD [ "sh", "run.sh" ]