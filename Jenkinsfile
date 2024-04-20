def getCommitSha() {
    return sh(returnStdout: true, script: "git rev-parse HEAD | tr -d '\n'")
}

pipeline {
    agent any
    environment {
        version = getCommitSha() // '1.1'
        containerName = 'capstone-auth'
    }

    stages {
        stage("login") {
            steps {
                echo 'authenticating into Digital Ocean repository...'
                sh 'docker login registry.digitalocean.com'
                
                // note you need to manually add token for capstone-ccsu once 
                // in Jenkins conatiner that is in the droplet
                // Refer to "API" tab in Digital Ocean
                sh 'doctl auth init --context capstone-ccsu'  
            }
        }

        stage("build") {
            steps {
                echo 'building the application...'
                sh 'doctl registry repo list-v2'
                sh "docker build -t capstone-auth:${version} ."
                sh "docker tag capstone-auth:${version} registry.digitalocean.com/capstone-ccsu/capstone-auth:${version}"
                sh "docker push registry.digitalocean.com/capstone-ccsu/capstone-auth:${version}"
                sh 'doctl registry repo list-v2'
            }
        }

        stage("test") {
            steps {
                echo 'testing the application...'    
            }
        }

        stage("production approval") {
            steps {
                echo 'getting approval to go to production...'
        
                APPROVER_EMAIL = credentials('approver_email')

                emailext mimeType: 'text/html',
                        subject: '''APPROVAL REQUIRED: ${currentBuild.fullDisplayName}''',
                        to: '''${APPROVER_EMAIL}''', // "infantformulafinder@gmail.com",
                        body: '''<a href=”${BUILD_URL}input”>click to approve</a>'''
            }
        }

        stage("deploy") {
            steps {
                echo 'deploying the application...' 

                withCredentials([
                    string(credentialsId: 'website', variable: 'WEBSITE'),
                ]) {
                    script {
                        // Use SSH to check if the container exists. If not exist, then catch error
                        // so Jenkins pipeline can continue.
                        def containerExists = sh(script: 'ssh -i /var/jenkins_home/.ssh/website_deploy_rsa_key "${WEBSITE}" docker stop "${containerName}"', returnStatus: true)

                        echo "containerExists: $containerExists"
                    }
                }

                // Use the withCredentials block to access the credentials
                // Note: need --rm when docker run.. so that docker stop can kill it cleanly
                withCredentials([
                    string(credentialsId: 'website', variable: 'WEBSITE'),
                    string(credentialsId: 'mongodb_user', variable: 'MONGODB_USER'),
                ]) {
                    sh '''
                        ssh -i /var/jenkins_home/.ssh/website_deploy_rsa_key ${WEBSITE} "docker run -d \
                        -p 5400:5400 \
                        -e DATABASE_URL=${MONGODB_USER} \
                        --name capstone-auth \
                        --network helpmybabies \
                        registry.digitalocean.com/capstone-ccsu/capstone-auth:${version}

                        docker ps
                        "
                    '''                    
                }
            }
        }
    }

    post {
        always {
            echo "Release finished and start clean up"
            deleteDir() // the actual folder with the downloaded project code is deleted from build server
        }
        success {
            echo "Release Success"
        }
        failure {
            echo "Release Failed"
        }
        cleanup {
            echo "Clean up in post workspace" 
            cleanWs() // any reference this particular build is deleted from the agent
        }
    }

}