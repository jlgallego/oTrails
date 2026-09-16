# Imagen base oficial de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /backend

# Copia los archivos de dependencias para instalar
COPY package*.json ./
RUN npm install

# Copia el resto del código fuente al contenedor
COPY . .

# Copia certificados de PRE
COPY certs/pre.crt /backend/certs/pre.crt
COPY certs/pre.key /backend/certs/pre.key
ENV SSL_CERT_PATH=/backend/certs/pre.crt
ENV SSL_KEY_PATH=/backend/certs/pre.key
ENV HTTPS=true
ENV PORT=443

EXPOSE 443

CMD ["node", "index.js"]
