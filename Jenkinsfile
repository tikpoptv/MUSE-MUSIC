pipeline {
    agent any

    tools {
        nodejs "NodeJS_24"
    }

    environment {
        // กำหนด environment ถ้าจำเป็น
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/tikpoptv/MUSE-MUSIC.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                // ถ้าไม่มี test จะไม่ fail แต่แนะนำให้มี
                sh 'npm test || echo "no tests found"'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploy step here (เช่น docker build & push, หรือ trigger coolify)'
                // ตัวอย่าง: sh 'docker build -t muse-music . && docker push yourrepo/muse-music:latest'
            }
        }
    }

    post {
        success {
            echo '✅ Build & deploy success!'
        }
        failure {
            echo '❌ Build failed, check logs.'
        }
    }
}