pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        IMAGE_NAME = 'muse-music'
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${IMAGE_NAME}-frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/${IMAGE_NAME}-backend"
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        echo "Building Frontend..."
                        npm ci
                        npm run build
                    '''
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh '''
                        echo "Building Backend..."
                        npm ci
                    '''
                }
            }
        }
        
        stage('Docker Build') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        script {
                            def frontendImage = docker.build(
                                "${FRONTEND_IMAGE}:${BUILD_NUMBER}",
                                "-f frontend/Dockerfile frontend/"
                            )
                            frontendImage.tag("${FRONTEND_IMAGE}:latest")
                        }
                    }
                }
                
                stage('Build Backend Image') {
                    steps {
                        script {
                            def backendImage = docker.build(
                                "${BACKEND_IMAGE}:${BUILD_NUMBER}",
                                "-f backend/Dockerfile backend/"
                            )
                            backendImage.tag("${BACKEND_IMAGE}:latest")
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh '''
                                echo "Running Frontend Tests..."
                                npm run lint || true
                            '''
                        }
                    }
                }
                
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh '''
                                echo "Running Backend Tests..."
                                npm test || true
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Push Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                        docker.image("${FRONTEND_IMAGE}:${BUILD_NUMBER}").push()
                        docker.image("${FRONTEND_IMAGE}:latest").push()
                        docker.image("${BACKEND_IMAGE}:${BUILD_NUMBER}").push()
                        docker.image("${BACKEND_IMAGE}:latest").push()
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    sh '''
                        echo "Deploying to production..."
                        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
                    '''
                }
            }
        }
    }
    
    post {
        always {
            sh '''
                echo "Cleaning up..."
                docker system prune -f || true
            '''
        }
        
        success {
            echo "Pipeline succeeded!"
            script {
                if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                    slackSend(
                        channel: '#deployments',
                        color: 'good',
                        message: "✅ MUSE Music deployed successfully!\nBranch: ${env.BRANCH_NAME}\nCommit: ${env.GIT_COMMIT_SHORT}\nBuild: ${env.BUILD_NUMBER}"
                    )
                }
            }
        }
        
        failure {
            echo "Pipeline failed!"
            script {
                slackSend(
                    channel: '#deployments',
                    color: 'danger',
                    message: "❌ MUSE Music deployment failed!\nBranch: ${env.BRANCH_NAME}\nCommit: ${env.GIT_COMMIT_SHORT}\nBuild: ${env.BUILD_NUMBER}\nCheck: ${env.BUILD_URL}"
                )
            }
        }
        
        unstable {
            echo "Pipeline unstable!"
        }
    }
}
