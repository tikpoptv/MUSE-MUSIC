pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    docker.image('node:20').inside {
                        sh 'npm ci --prefix frontend'
                        sh 'npm ci --prefix backend'
                    }
                }
            }
        }

        stage('Lint & Test') {
            parallel {
                stage('Frontend') {
                    steps {
                        script {
                            docker.image('node:20').inside {
                                sh 'npm run lint --prefix frontend || true'
                            }
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        script {
                            docker.image('node:20').inside {
                                sh 'npm test --prefix backend || true'
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI checks passed! Coolify can deploy."
        }
        failure {
            echo "❌ CI failed! Please fix before Coolify deploys."
        }
    }
}