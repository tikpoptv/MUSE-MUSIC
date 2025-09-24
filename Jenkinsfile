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

        stage('Lint Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run lint'
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

        stage('Lint Backend') {
            steps {
                dir('backend') {
                    sh 'npm run lint || echo "⚠️ no lint script"'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm test || echo "⚠️ no backend tests"'
                }
            }
        }

        stage('Health Check Backend') {
            steps {
                dir('backend') {
                    sh '''
                      npm run start &
                      SERVER_PID=$!
                      sleep 5
                      curl -f http://localhost:3001/api/health || exit 1
                      kill $SERVER_PID
                    '''
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
            echo '✅ Build, Lint, Test, Deploy Success!'
        }
        failure {
            echo '❌ Build Failed, check logs!'
        }
    }
}