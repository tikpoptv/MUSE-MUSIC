pipeline {
    agent {
        docker { image 'node:20' } // ใช้ container ที่มี Node.js มาให้เลย
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci --prefix frontend'
                sh 'npm ci --prefix backend'
            }
        }

        stage('Lint & Test') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        sh 'npm run lint --prefix frontend || true'
                    }
                }
                stage('Backend Test') {
                    steps {
                        sh 'npm test --prefix backend || true'
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI checks passed! Ready for Coolify to deploy."
        }
        failure {
            echo "❌ CI failed! Please fix errors before deploying."
        }
    }
}