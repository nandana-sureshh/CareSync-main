# ─── Stage 1: Build React app ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass build-time env args for React
ARG REACT_APP_AUTH_URL=http://100.52.219.209:4001
ARG REACT_APP_PATIENT_URL=http://100.52.219.209:4002
ARG REACT_APP_DOCTOR_URL=http://100.52.219.209:4003
ARG REACT_APP_APPOINTMENT_URL=http://100.52.219.209:4004

ENV REACT_APP_AUTH_URL=$REACT_APP_AUTH_URL
ENV REACT_APP_PATIENT_URL=$REACT_APP_PATIENT_URL
ENV REACT_APP_DOCTOR_URL=$REACT_APP_DOCTOR_URL
ENV REACT_APP_APPOINTMENT_URL=$REACT_APP_APPOINTMENT_URL

RUN npm run build

# ─── Stage 2: Serve with nginx ────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config for React Router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
