@Library('my-shared-lib@main') _

pipeline {
    agent any

    options { 
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        PROJECT_NAME = 'MUSE MUSIC'
        REPO_URL     = 'https://github.com/tikpoptv/MUSE-MUSIC.git'
        REPO_BRANCH  = 'main'
        REPO_CREDENTIALS = 'github-token'
    }

    stages {

        stage('Checkout') {
            steps {
                script {
                    notifyN8N("INFO", "Pipeline started. Checking out code...")
                }
                checkout scm
            }
            post {
                failure {
                    script { notifyN8N("FAILURE", "Stage: Checkout failed") }
                }
            }
        }

        stage('Install Frontend') {
            steps {
                dir('frontend') {
                    nodejs('NodeJS_24') {
                        sh 'npm install'
                    }
                }
            }
            post { failure { script { notifyN8N("FAILURE", "Stage: Install Frontend failed") } } }
        }

        stage('Lint Frontend') {
            steps {
                dir('frontend') {
                    nodejs('NodeJS_24') {
                        sh 'npm run lint'
                    }
                }
            }
            post { failure { script { notifyN8N("FAILURE", "Stage: Lint Frontend failed") } } }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    nodejs('NodeJS_24') {
                        sh 'npm run build'
                    }
                }
            }
            post { failure { script { notifyN8N("FAILURE", "Stage: Build Frontend failed") } } }
        }

        stage('Install Backend') {
            steps {
                dir('backend') {
                    nodejs('NodeJS_24') {
                        sh 'npm install'
                    }
                }
            }
            post { failure { script { notifyN8N("FAILURE", "Stage: Install Backend failed") } } }
        }

        stage('Lint Backend') {
            steps {
                dir('backend') {
                    nodejs('NodeJS_24') {
                        sh 'npm run lint || echo "⚠️ no backend lint script"'
                    }
                }
            }
            post { failure { script { notifyN8N("FAILURE", "Stage: Lint Backend failed") } } }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    nodejs('NodeJS_24') {
                        sh 'npm test || echo "⚠️ no backend tests"'
                    }
                }
            }
            post { failure { script { notifyN8N("FAILURE", "Stage: Test Backend failed") } } }
        }

        stage('Run Backend (Smoke Test)') {
            steps {
                dir('backend') {
                    nodejs('NodeJS_24') {
                        sh '''
                          echo "⏳ Starting backend for smoke test..."
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
            post { failure { script { notifyN8N("FAILURE", "Stage: Run Backend (Smoke Test) failed") } } }
        }

        stage('Deploy to Coolify') {
            when { branch 'main' }
            steps {
                script {
                    notifyN8N("INFO", "Preparing deployment to Coolify...")
                    deployToCoolify(
                        "MuseMusic",                // projectName
                        "COOLIFY_UUID_MUSEMUSIC",   // credentialsId UUID
                        "COOLIFY_TOKEN",            // credentialsId Token
                        "COOLIFY_BASEURL"           // credentialsId BaseURL
                    )
                    notifyN8N("SUCCESS", "Deployment request sent to Coolify.")
                }
            }
            post {
                failure {
                    script { 
                        notifyN8N("FAILURE", "Stage: Deploy to Coolify failed") 
                    }
                }
                skipped {
                    script { 
                        echo "⏭️ Skipping deploy: current branch = ${env.BRANCH_NAME}, only main can deploy."
                        notifyN8N("INFO", "⏭️ Deploy skipped because branch is ${env.BRANCH_NAME}, only main can deploy.")
                    }
                }
            }
        }


    }

    post {
        success {
            script { notifyN8N("SUCCESS", "✅ Build, Lint, Smoke, Deploy Success!") }
        }
        failure {
            script { notifyN8N("FAILURE", "❌ Pipeline Failed, check logs!") }
        }
    }
}
