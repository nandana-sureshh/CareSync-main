# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Injected at build time via docker-compose build.args (or --build-arg in CI)
ARG REACT_APP_AUTH_URL
ARG REACT_APP_PATIENT_URL
ARG REACT_APP_DOCTOR_URL
ARG REACT_APP_APPOINTMENT_URL

ENV REACT_APP_AUTH_URL=$REACT_APP_AUTH_URL \
    REACT_APP_PATIENT_URL=$REACT_APP_PATIENT_URL \
    REACT_APP_DOCTOR_URL=$REACT_APP_DOCTOR_URL \
    REACT_APP_APPOINTMENT_URL=$REACT_APP_APPOINTMENT_URL \
    CI=false

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
