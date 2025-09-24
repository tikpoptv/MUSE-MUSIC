pipeline {
    agent any
    stages {
        stage('Install & Build Frontend') {
            agent {
                docker {
                    image 'node:18-alpine'   // ใช้ Node.js official image
                    args '-u root:root'     // ให้สิทธิ์ root ถ้าต้องติดตั้งเพิ่ม
                }
            }
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Install & Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }
    }
    post {
        failure {
            echo "❌ CI failed. Please fix before merging."
        }
    }
}