FROM node:22-alpine

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \
    && echo "America/Sao_Paulo" > /etc/timezone
ENV TZ="America/Sao_Paulo"

ENV NODE_OPTIONS=--max_old_space_size=800
RUN apk add --no-cache curl iputils

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

# Usa usuário não-root para maior segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["npm", "run", "start:prod"]