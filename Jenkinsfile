pipeline {
    agent any
  
    environment {
// Docker Hub 사용자 이름
        DOCKERHUB_USERNAME = 'baejaehyeon'
        // Docker Hub에 업로드할 이미지 이름
        DOCKER_IMAGE_NAME = "react-app"
        // 젠킨스 Credential ID (Docker Hub 로그인 정보)
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'

//        IMAGE_NAME = "baejaehyeon/react-app"    // Docker Hub에 업로드할 이미지 이름
//        IMAGE_TAG = "v${BUILD_NUMBER}"     // Jenkins 빌드 넘버 기반 태그 
//        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials' // Jenkins에 등록된 Docker Hub 자격증명 ID
    }

    stages {
       stage('Clean NPM Cache') {
            steps {
	   // 빌드 이전에 캐시 제거
               bat 'npm cache clean --force'
            }  
       }
       stage('Cleanup Workspace') {
            steps {
                // 빌드마다 이전 빌드의 모든 파일을 삭제
                cleanWs()
            }
        }
        stage('Checkout') {
            steps {
                // GitHub에서 소스코드 가져오기
                checkout scm
            }
        }
        stage('Build React App') {
            steps {
                // Node 버전 확인 (디버깅용)
                bat 'node -v'
                // npm 설치 및 빌드
                bat '''
                    npm install --force
                    npm run build || { echo "Build failed"; exit 1; }
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
//                script {
//                    docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
//                }
script {
                    def imageTag = "${env.DOCKERHUB_USERNAME}/${env.DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    bat "docker build -t ${imageTag} ."
                    env.DOCKER_IMAGE_TAG = imageTag
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
                    bat '''
                        docker login -u ${DOCKERHUB_USER} -p ${DOCKERHUB_PASS}
                        docker push ${env.DOCKER_IMAGE_TAG}
                    '''
                }
            }
        }
    }
}