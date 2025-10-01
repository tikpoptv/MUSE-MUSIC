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
                        sh '''
                          if npm run lint; then
                            echo "✅ Frontend lint passed"
                          else
                            echo "❌ Frontend lint failed"
                            exit 1
                          fi
                        '''
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
                        sh '''
                          if npm run lint; then
                            echo "✅ Backend lint passed"
                          else
                            echo "⚠️ No lint script or lint failed"
                            exit 1
                          fi
                        '''
                    }
                }
            }
            post { failure { script { notifyN8N("FAILURE", "Stage: Lint Backend failed") } } }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    nodejs('NodeJS_24') {
                        sh '''
                          if npm test; then
                            echo "✅ Backend tests passed"
                          else
                            echo "⚠️ No backend tests or tests failed"
                            exit 1
                          fi
                        '''
                    }
                }
            }
            post { failure { script { notifyN8N("FAILURE", "Stage: Test Backend failed") } } }
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
            when { branch 'main' }
            steps {
                withCredentials([
                    string(credentialsId: 'COOLIFY_TOKEN', variable: 'COOLIFY_TOKEN'),
                    string(credentialsId: 'COOLIFY_UUID_MUSEMUSIC', variable: 'COOLIFY_UUID_MUSEMUSIC'),
                    string(credentialsId: 'COOLIFY_BASEURL', variable: 'COOLIFY_BASEURL')
                ]) {
                    script {
                        notifyN8N("INFO", "Preparing deployment to Coolify...")
                        deployToCoolify(
                            "MuseMusic",
                            env.COOLIFY_UUID_MUSEMUSIC,
                            env.COOLIFY_TOKEN,
                            env.COOLIFY_BASEURL
                        )
                        notifyN8N("SUCCESS", "Deployment request sent to Coolify.")
                    }
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
