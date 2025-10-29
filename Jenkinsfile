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
                                  export USE_TS_JEST=true
                                  if npm run test:unit -- --passWithNoTests; then
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
                                  if npm run test:unit -- --passWithNoTests; then
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
                                  export USE_TS_JEST=true
                                  if npm run test:integration -- --passWithNoTests; then
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
                        failure {
                            script { notifyN8N("FAILURE", "Frontend Integration Tests failed") }
                        }
                    }
                }

                stage('Backend Integration Tests') {
                    environment {
                        NODE_ENV = 'test'
                        DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db'
                        JWT_SECRET = 'test_jwt_secret_key_for_jenkins'
                        JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_jenkins'
                    }
                    steps {
                        dir('backend') {
                            nodejs('NodeJS_24') {
                                sh '''#!/bin/bash
                                  set +e  # Don't exit on error for checks
                                  echo "🔗 Running Backend Integration Tests..."
                                  
                                  # Check if PostgreSQL is available
                                  echo "Checking PostgreSQL availability..."
                                  HAS_POSTGRES=false
                                  
                                  if command -v pg_isready > /dev/null 2>&1; then
                                    if pg_isready -h localhost -p 5432 -U test_user > /dev/null 2>&1; then
                                      echo "✅ PostgreSQL is ready (pg_isready)"
                                      HAS_POSTGRES=true
                                    else
                                      echo "⚠️  PostgreSQL is not responding (pg_isready check failed)"
                                    fi
                                  else
                                    echo "⚠️  pg_isready command not found, trying psql..."
                                    if command -v psql > /dev/null 2>&1; then
                                      if PGPASSWORD=test_password psql -h localhost -p 5432 -U test_user -d test_db -c "SELECT 1" > /dev/null 2>&1; then
                                        echo "✅ PostgreSQL is ready (psql)"
                                        HAS_POSTGRES=true
                                      else
                                        echo "⚠️  PostgreSQL connection failed (psql check failed)"
                                      fi
                                    else
                                      echo "⚠️  PostgreSQL client tools not found"
                                    fi
                                  fi
                                  
                                  if [ "$HAS_POSTGRES" = "true" ]; then
                                    set -e  # Exit on error for actual tests
                                    echo "Environment Check:"
                                    echo "NODE_ENV: ${NODE_ENV}"
                                    echo "DATABASE_URL: $(echo $DATABASE_URL | cut -c1-25)..."
                                    echo "JWT_SECRET: $(echo $JWT_SECRET | cut -c1-10)..."
                                    echo "JWT_REFRESH_SECRET: $(echo $JWT_REFRESH_SECRET | cut -c1-10)..."
                                    
                                    # Run migrations first (like in GitHub Actions)
                                    echo "Running database migrations..."
                                    npm run migrate || echo "⚠️  Migration warning (continuing...)"
                                    
                                    echo "Running integration tests..."
                                    if npm run test:integration -- --passWithNoTests; then
                                      echo "✅ Backend integration tests passed"
                                    else
                                      echo "❌ Backend integration tests failed"
                                      exit 1
                                    fi
                                  else
                                    echo "⏭️  Skipping backend integration tests (PostgreSQL not available)"
                                    echo "ℹ️  Backend integration tests will run in GitHub Actions workflow instead"
                                    echo "✅ Backend integration tests skipped"
                                  fi
                                '''
                            }
                        }
                    }
                    post {
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
                    notifyN8N("INFO", "Checking E2E Tests environment...")
                }
                dir('frontend') {
                    nodejs('NodeJS_24') {
                        sh '''#!/bin/bash
                          echo "🎭 E2E Tests..."
                          
                          # Check if running in environment that supports Playwright
                          if [ "$USER" = "root" ] || groups 2>/dev/null | grep -q sudo; then
                            echo "✅ Environment supports Playwright installation"
                            
                            echo "🎭 Installing Playwright browsers..."
                            npx playwright install --with-deps chromium
                            
                            echo "🎭 Running E2E Tests..."
                            if npm run test:e2e; then
                              echo "✅ E2E tests passed"
                            else
                              echo "❌ E2E tests failed"
                              exit 1
                            fi
                          else
                            echo "⏭️  Skipping E2E tests (requires root/sudo for browser installation)"
                            echo "ℹ️  E2E tests will run in GitHub Actions workflow instead"
                            echo "✅ E2E tests skipped"
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
                    script { notifyN8N("SUCCESS", "E2E Tests passed/skipped") }
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
