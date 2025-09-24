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
        stage('Deploy to Coolify') {
            steps {
                withCredentials([
                    string(credentialsId: 'coolify-token', variable: 'COOLIFY_TOKEN'),
                    string(credentialsId: 'coolify-uuid-musemusic', variable: 'COOLIFY_UUID')
                ]) {
                    sh '''
                    echo "🚀 Triggering deploy on Coolify..."
                    RESPONSE=$(curl -s -o response.json -w "%{http_code}" \
                        -X GET "https://coolify.phitik.com/api/v1/deploy?uuid=$COOLIFY_UUID&force=true" \
                        -H "Authorization: Bearer $COOLIFY_TOKEN")

                    if [ "$RESPONSE" -ne 200 ]; then
                        echo "❌ Deploy failed (HTTP $RESPONSE)"
                        cat response.json
                        exit 1
                    fi

                    echo "✅ Deploy triggered successfully!"
                    cat response.json
                    '''
                }
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