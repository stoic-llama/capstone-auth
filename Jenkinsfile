pipeline {
    agent any
    environment {
        version = '1.1'
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

        stage("deploy") {
            steps {
                echo 'deploying the application...' 

                // Use the withCredentials block to access the credentials
                // Note: need --rm when docker run.. so that docker stop can kill it cleanly
                withCredentials([
                    string(credentialsId: 'website', variable: 'WEBSITE'),
                    string(credentialsId: 'mongodb_user', variable: 'MONGODB_USER'),
                ]) {
                    sh 'ssh -i /var/jenkins_home/.ssh/website_deploy_rsa_key ${WEBSITE} "docker stop capstone-auth"'

                    sh '''
                        ssh -i /var/jenkins_home/.ssh/website_deploy_rsa_key ${WEBSITE} "docker run -d \
                        -p 5400:5400 \
                        -e DATABASE_URL=${MONGODB_USER} \
                        --rm \
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