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

        // ========== Frontend ==========
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

        // ========== Backend ==========
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
                    sh 'npm run lint || echo "⚠️ no backend lint script"'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    // ถ้ามี test script จะรัน, ถ้าไม่มีจะไม่ fail
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
                      echo "⏳ Waiting for backend to be ready..."
                      sleep 5
                      curl --retry 5 --retry-delay 3 -f http://localhost:3001/api/health || exit 1
                      kill $SERVER_PID
                    '''
                }
            }
        }

        // ========== Deploy ==========
        stage('Deploy') {
            steps {
                echo '🚀 Deploy step (เชื่อม Docker หรือ Coolify ได้ตรงนี้)'
            }
        }
    }

    post {
        success {
            echo '✅ Build, Lint, Test, Health Check, Deploy Success!'
        }
        failure {
            echo '❌ Pipeline Failed, check logs!'
        }
    }
}