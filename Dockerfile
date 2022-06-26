# cf. https://github.com/napi-rs/package-template/blob/0e2b015e97aa8b9aac9cdad5b8e2e375273f0981/.github/workflows/CI.yml#L41
FROM ghcr.io/napi-rs/napi-rs/nodejs-rust:lts-debian

WORKDIR /app

COPY ./ ./

RUN npm ci
RUN npm run napi:release
