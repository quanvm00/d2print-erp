# Stage 1: Build môi trường React với Vite
FROM node:20-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /build

# Khởi tạo một dự án Vite React trắng
RUN npx create-vite@latest app --template react

# Chuyển vào thư mục dự án vừa tạo
WORKDIR /build/app

# Cài đặt các thư viện cơ bản (react, react-dom)
RUN npm install

# Copy file mã nguồn của bạn vào làm file App chính
# Bước này thay thế App.jsx mặc định của Vite bằng file của bạn
COPY d2print-erp.jsx ./src/App.jsx

# Ghi đè file main.jsx để loại bỏ index.css mặc định của Vite (tránh vỡ layout)
RUN echo "import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App.jsx'; ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);" > ./src/main.jsx

# Build dự án ra static files
RUN npm run build

# Stage 2: Triển khai web server với Nginx
FROM nginx:alpine

# Copy file tĩnh đã build từ bước 1 sang thư mục html của Nginx
COPY --from=builder /build/app/dist /usr/share/nginx/html

# Mở port 80
EXPOSE 80

# Chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
