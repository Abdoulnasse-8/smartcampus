pipeline {
    agent any

    // Node.js 22 est installé dans ~/tools. On l'ajoute au PATH de l'agent
    // (solution portable, sans dépendre d'un outil configuré dans Jenkins).
    environment {
        PATH = "/home/abdoulnasser/tools/node-v22.12.0-linux-x64/bin:${env.PATH}"
        CI = 'true'
        NEXT_TELEMETRY_DISABLED = '1'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'node --version && git log -1 --oneline'
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
                // Artefact de la phase CI (analogue du .jar Maven), point
                // d'entree du futur TP Docker.
                sh 'tar --exclude=node_modules -czf smartcampus-build.tar.gz backend frontend'
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    // Pour simuler un echec CI volontaire, modifiez la ligne
                    // marquee [CI-FAIL] dans backend/tests/auth.test.js
                    // (ex: expect(res.status).toBe(500)).
                    sh 'npm test'
                }
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'smartcampus-build.tar.gz', fingerprint: true
        }
        always {
            echo "Pipeline SmartCampus : ${currentBuild.currentResult}"
        }
        failure {
            echo 'Pipeline SmartCampus : ECHEC. Verifiez le test marque [CI-FAIL].'
        }
    }
}
