FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build
EXPOSE 5731
ENV TZ=America/Sao_Paulo
CMD ["sh", "-c", "npm run start:prod"]

