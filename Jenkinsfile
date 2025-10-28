@Library('my-shared-lib@main') _

pipeline {
    agent any

    options { 
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        PROJECT_NAME     = 'MUSE MUSIC'
        REPO_URL         = 'https://github.com/tikpoptv/MUSE-MUSIC.git'
        REPO_CREDENTIALS = 'github-token'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    notifyN8N("INFO", "Pipeline started. Checking out code... (branch=${env.BRANCH_NAME})")
                }
                checkout scm
            }
            post {
                failure {
                    script { notifyN8N("FAILURE", "Stage: Checkout failed") }
                }
            }
        }

        stage('Build & Lint Parallel') {
            parallel {
                stage('Frontend') {
                    stages {
                        stage('Install Frontend') {
                            steps {
                                dir('frontend') {
                                    nodejs('NodeJS_24') {
                                        sh 'npm install'
                                    }
                                }
                            }
                        }
                        stage('Lint Frontend') {
                            steps {
                                dir('frontend') {
                                    nodejs('NodeJS_24') {
                                        sh '''
                                          if npm run lint:ci; then
                                            echo "✅ Frontend lint passed"
                                          else
                                            echo "❌ Frontend lint failed"
                                            exit 1
                                          fi
                                        '''
                                    }
                                }
                            }
                        }
                        stage('Verify Test Structure') {
                            steps {
                                dir('frontend') {
                                    nodejs('NodeJS_24') {
                                        sh '''
                                          if npm run test:verify-structure; then
                                            echo "✅ Test structure verified"
                                          else
                                            echo "❌ Test structure verification failed"
                                            exit 1
                                          fi
                                        '''
                                    }
                                }
                            }
                        }
                    }
                }

                stage('Backend') {
                    stages {
                        stage('Install Backend') {
                            steps {
                                dir('backend') {
                                    nodejs('NodeJS_24') {
                                        sh 'npm install'
                                    }
                                }
                            }
                        }
                        stage('Lint Backend') {
                            steps {
                                dir('backend') {
                                    nodejs('NodeJS_24') {
                                        sh '''
                                          if npm run lint; then
                                            echo "✅ Backend lint passed"
                                          else
                                            echo "❌ Backend lint failed"
                                            exit 1
                                          fi
                                        '''
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Unit Tests') {
            parallel {
                stage('Frontend Unit Tests') {
                    steps {
                        dir('frontend') {
                            nodejs('NodeJS_24') {
                                sh '''
                                  echo "🧪 Running Frontend Unit Tests..."
                                  if npm run test:unit:ci; then
                                    echo "✅ Frontend unit tests passed"
                                  else
                                    echo "❌ Frontend unit tests failed"
                                    exit 1
                                  fi
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Unit Test Coverage'
                            ])
                        }
                        failure {
                            script { notifyN8N("FAILURE", "Frontend Unit Tests failed") }
                        }
                    }
                }

                stage('Backend Unit Tests') {
                    steps {
                        dir('backend') {
                            nodejs('NodeJS_24') {
                                sh '''
                                  echo "🧪 Running Backend Unit Tests..."
                                  if npm run test:unit:ci; then
                                    echo "✅ Backend unit tests passed"
                                  else
                                    echo "❌ Backend unit tests failed"
                                    exit 1
                                  fi
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'backend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Backend Unit Test Coverage'
                            ])
                        }
                        failure {
                            script { notifyN8N("FAILURE", "Backend Unit Tests failed") }
                        }
                    }
                }
            }
        }

        stage('Integration Tests') {
            when { 
                anyOf { 
                    branch 'main'
                    branch 'develop'
                    changeRequest()
                }
            }
            parallel {
                stage('Frontend Integration Tests') {
                    steps {
                        dir('frontend') {
                            nodejs('NodeJS_24') {
                                sh '''
                                  echo "🔗 Running Frontend Integration Tests..."
                                  if npm run test:integration:ci; then
                                    echo "✅ Frontend integration tests passed"
                                  else
                                    echo "❌ Frontend integration tests failed"
                                    exit 1
                                  fi
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Integration Test Coverage'
                            ])
                        }
                        failure {
                            script { notifyN8N("FAILURE", "Frontend Integration Tests failed") }
                        }
                    }
                }

                stage('Backend Integration Tests') {
                    environment {
                        DATABASE_URL = credentials('TEST_DATABASE_URL')
                        JWT_SECRET = credentials('TEST_JWT_SECRET')
                        JWT_REFRESH_SECRET = credentials('TEST_JWT_REFRESH_SECRET')
                    }
                    steps {
                        dir('backend') {
                            nodejs('NodeJS_24') {
                                sh '''
                                  echo "🔗 Running Backend Integration Tests..."
                                  if npm run test:integration:ci; then
                                    echo "✅ Backend integration tests passed"
                                  else
                                    echo "❌ Backend integration tests failed"
                                    exit 1
                                  fi
                                '''
                            }
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'backend/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Backend Integration Test Coverage'
                            ])
                        }
                        failure {
                            script { notifyN8N("FAILURE", "Backend Integration Tests failed") }
                        }
                    }
                }
            }
        }

        stage('E2E Tests') {
            when { 
                anyOf { 
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    notifyN8N("INFO", "Starting E2E Tests...")
                }
                dir('frontend') {
                    nodejs('NodeJS_24') {
                        sh '''
                          echo "🎭 Installing Playwright browsers..."
                          npx playwright install --with-deps chromium
                          
                          echo "🎭 Running E2E Tests..."
                          if npm run test:e2e; then
                            echo "✅ E2E tests passed"
                          else
                            echo "❌ E2E tests failed"
                            exit 1
                          fi
                        '''
                    }
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'frontend/playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright E2E Test Report'
                    ])
                }
                failure {
                    script { notifyN8N("FAILURE", "E2E Tests failed") }
                }
                success {
                    script { notifyN8N("SUCCESS", "E2E Tests passed") }
                }
            }
        }

        stage('Skip Deploy') {
            when { not { branch 'main' } }
            steps {
                script {
                    echo "⏭️ Skipping deploy: branch = ${env.BRANCH_NAME}, only main can deploy."
                    notifyN8N("INFO", "⏭️ Deploy skipped because branch is ${env.BRANCH_NAME}, only main can deploy.")
                }
            }
        }

        stage('Deploy to Coolify') {
            when { anyOf { branch 'main'; branch 'develop' } }
            steps {
                script {
                    notifyN8N("INFO", "Preparing deployment to Coolify...")

                    if (env.BRANCH_NAME == "main") {
                        deployToCoolify(
                            "MuseMusic",
                            "COOLIFY_UUID_MUSEMUSIC",
                            "COOLIFY_TOKEN",
                            "COOLIFY_BASEURL"
                        )
                    } else if (env.BRANCH_NAME == "develop") {
                        deployToCoolify(
                            "MuseMusic",
                            "COOLIFY_UUID_MUSEMUSIC_DEV",
                            "COOLIFY_TOKEN",
                            "COOLIFY_BASEURL"
                        )
                    }

                    notifyN8N("SUCCESS", "Deployment request has been successfully sent to Coolify.")
                }
            }
            post {
                failure {
                    script { notifyN8N("FAILURE", "Stage: Deploy to Coolify failed") }
                }
            }
        }

    }

    post {
        success {
            script { notifyN8N("SUCCESS", "✅ Build, Lint, Test, Deploy Success! (branch=${env.BRANCH_NAME})") }
        }
        failure {
            script { notifyN8N("FAILURE", "❌ Pipeline Failed, check logs!") }
        }
    }
}
