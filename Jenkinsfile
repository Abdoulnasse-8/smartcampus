pipeline {
    agent any

    // Jenkins doit exposer un Node.js 22+ nommé "node-22" (Global Tool Configuration).
    // Adaptez le nom si votre installation utilise une autre convention.
    tools {
        nodejs 'node-22'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        CI = 'true'
        // Surcoût inutile dans le tableau des salles du front
        NEXT_TELEMETRY_DISABLED = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install (backend)') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Tests (backend)') {
            steps {
                dir('backend') {
                    // Pour simuler un echec CI volontaire, modifiez la ligne
                    // marquee [CI-FAIL] dans backend/tests/auth.test.js
                    // (ex: expect(res.status).toBe(500)).
                    sh 'npm test'
                }
            }
        }

        stage('Install (frontend)') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Build (frontend)') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts(
                artifacts: 'frontend/.next/**, backend/src/**, backend/package.json',
                allowEmptyArchive: true,
                fingerprint: true
            )
        }
        success {
            echo 'Pipeline SmartCampus : SUCCES.'
        }
        failure {
            echo 'Pipeline SmartCampus : ECHEC. Verifiez le test marque [CI-FAIL].'
        }
    }
}
