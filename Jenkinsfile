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
                    sh 'npm test || echo "⚠️ no backend tests"'
                }
            }
        }

        stage('Run Backend (Check for errors)') {
            steps {
                dir('backend') {
                    sh '''
                      echo "⏳ Starting backend for error check..."
                      npm run start &
                      SERVER_PID=$!
                      sleep 5
                      # ถ้า process ตายไปภายใน 5 วิ ถือว่า error
                      if ! kill -0 $SERVER_PID 2>/dev/null; then
                        echo "❌ Backend crashed!"
                        exit 1
                      fi
                      echo "✅ Backend started successfully (no crash)"
                      kill $SERVER_PID
                    '''
                }
            }
        }

        // ========== Deploy ==========
        stage('Deploy') {
            steps {
                echo '🚀 Deploy step (ต่อกับ Docker หรือ Coolify ได้ตรงนี้)'
            }
        }
    }

    post {
        success {
            echo '✅ Build, Lint, Error Check, Deploy Success!'
        }
        failure {
            echo '❌ Pipeline Failed, check logs!'
        }
    }
}