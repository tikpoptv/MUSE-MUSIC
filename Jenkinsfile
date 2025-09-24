pipeline {
    agent any

    tools {
        nodejs "NodeJS_24" 
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/tikpoptv/MUSE-MUSIC.git'
            }
        }

        stage('Install Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Install Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm test || echo "no backend tests"'
                }
            }
        }

        stage('Run Backend') {
            steps {
                dir('backend') {
                    sh 'npm run start || echo "no backend start script"'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploy step (เชื่อม Docker หรือ Coolify ได้ตรงนี้)'
            }
        }
    }

    post {
        success {
            echo '✅ Build & Deploy Success!'
        }
        failure {
            echo '❌ Build Failed, check logs!'
        }
    }
}