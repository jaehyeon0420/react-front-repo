FROM node:20.15.1 AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json만 먼저 복사
COPY package*.json ./

# 의존성 설치 (npm ci는 lock파일 기반으로 빠르고 일관된 설치)
RUN npm install --force

# 모든 소스 복사
COPY . .

# React 앱 빌드
RUN npm run build

# 빌드된 정적 파일을 Nginx로 서비스
FROM nginx:stable-alpine

# 기본 Nginx 정적 리소스 위치에 React 빌드 결과 복사
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx 포트 설정
EXPOSE 80

# 기본 Nginx 실행
CMD ["nginx", "-g", "daemon off;"]