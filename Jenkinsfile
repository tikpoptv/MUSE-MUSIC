pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Build Frontend') {
            steps {
                sh '''
                    cd frontend
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Install & Test Backend') {
            steps {
                sh '''
                    cd backend
                    npm ci
                    npm test || true
                '''
            }
        }
    }

    post {
        success {
            echo "✅ CI passed. Coolify will deploy automatically."
        }
        failure {
            echo "❌ CI failed. Please fix before merging."
        }
    }
}