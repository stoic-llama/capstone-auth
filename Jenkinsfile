def getCommitSha() {
    return sh(returnStdout: true, script: "git rev-parse HEAD | tr -d '\n'")
}

def getPrevCommitShaForRollback(int count) {
    return sh(returnStdout: true, script: "git rev-parse HEAD~$count | tr -d '\n'")
}

pipeline {
    agent any
    environment {
        version = getCommitSha() 
        containerName = 'capstone-auth'
        
        // Get the SHA of the previous commit
        previousVersion = getPrevCommitShaForRollback(1)
    }

    stages {
        stage("build application") {
            steps {
                echo '#####################'
                echo '# Build Application #'
                echo '#####################'

                /******************************************
                 ********** Login to Digital Ocean ********
                 ******************************************/
                echo 'authenticating into Digital Ocean repository...'
                sh 'docker login registry.digitalocean.com'
                
                // note you need to manually add token for capstone-ccsu once 
                // in Jenkins conatiner that is in the droplet
                // Refer to "API" tab in Digital Ocean
                sh 'doctl auth init --context capstone-ccsu'  


                /******************************************
                 ************ Compile and Build ***********
                 ******************************************/
                echo 'building application...'
                sh 'doctl registry repo list-v2'
                sh "docker build -t capstone-auth:${version} ."
                sh "docker tag capstone-auth:${version} registry.digitalocean.com/capstone-ccsu/capstone-auth:${version}"
                sh "docker push registry.digitalocean.com/capstone-ccsu/capstone-auth:${version}"
                sh 'doctl registry repo list-v2'
            }
        }

        stage("deploy to quality") {
            steps {
                echo '#################################'
                echo '# Deploy to Quality Environment #'
                echo '#################################'
                script {
                    // Check if the container exists 
                        // --> If yes, stop and remove it
                        // --> If no, display result true for both stop and rm command, no harm done 
                    // Then let Jenkins continue
                    def containerStopped = sh(script: 'docker stop ${containerName}', returnStatus: true) == 0

                    echo "docker stop command was finished successfully: $containerStopped"

                    def containerRemoved = sh(script: 'docker rm ${containerName}', returnStatus: true) == 0

                    echo "docker rm command was finished successfully: $containerRemoved"
                }
            
                // Use the withCredentials block to access the credentials
                // Note: need --rm when docker run.. so that docker stop can kill it cleanly
                withCredentials([
                    string(credentialsId: 'mongodb_user', variable: 'MONGODB_USER'),
                ]) {
                    sh '''
                        docker run -d \
                        -p 5400:5400 \
                        -e DATABASE_URL=${MONGODB_USER} \
                        --name capstone-auth \
                        --network helpmybabies \
                        registry.digitalocean.com/capstone-ccsu/capstone-auth:${version}

                        docker ps
                    '''                    
                }
            }
        }

        stage("test") {
            steps {
                echo '############################'
                echo '# Code Review - Complexity #'
                echo '# Source Lines of Code     #'    
                echo '############################'
                script {
                    // Code Review - Code Complexity
                    // Source Lines of Code
                    sh '''
                        docker exec -u root capstone-auth sh -c '
                            #!/bin/bash
                            
                            # Check if curl is installed
                            if ! command -v curl &> /dev/null
                            then
                                echo "curl is not installed. Installing..."
                                apt-get update && apt-get install curl
                            else
                                echo "curl is already installed."
                            fi
                            
                            # Check if Perl is installed
                            if ! command -v perl &> /dev/null
                            then
                                echo "Perl is not installed. Installing..."
                                apt-get update && apt-get install perl
                            else
                                echo "Perl is already installed."
                            fi
                        '
                    '''

                    sh '''
                        docker exec capstone-auth sh -c "
                            echo 'Initiating cloc from kent c dodds...'

                            npx cloc . --by-file --exclude-dir=.vscode,archive_DELETE,coverage,node_modules,test --include-lang=JavaScript
                        "
                    '''

                    echo '############################'
                    echo '# Code Review - Complexity #'
                    echo '# McCabes Cyclomatic Cycle #'    
                    echo '############################'
                    sh '''
                        docker exec capstone-auth sh -c "npm run eslint"
                    '''      
                    
                    echo '##############'
                    echo '# Unit Tests #'
                    echo '##############'                    
                    sh '''
                        docker exec capstone-auth sh -c "npm run coverage"
                    '''
                }
            }
        }

        stage("production approval") {
            steps {
                echo '##########################'
                echo '# Approval to Production #'
                echo '##########################'

                emailext (
                    subject: "APPROVAL REQUIRED: ${JOB_NAME} build ${BUILD_DISPLAY_NAME}",
                    body:   '''     
                                    <html>
                                        <body>
                                            <a href="${BUILD_URL}console">Go to approval page</a>
                                        </body>
                                    </html>
                            ''',
                    to: 'infantformulafinder+approvers@gmail.com',
                    mimeType: 'text/html'
                )    

                input (
                    message: 'Approve to go to production?', 
                    ok: 'Approve'
                )
            }
        }

        stage("deploy to production") {
            steps {
                echo '########################'
                echo '# Deploy to Production #'
                echo '########################' 
                
                withCredentials([
                    string(credentialsId: 'website', variable: 'WEBSITE'),
                ]) {
                    script {
                        // Use SSH to check if the container exists 
                            // --> If yes, stop and remove it
                            // --> If no, display result true for both stop and rm command, no harm done 
                        // Then let Jenkins continue
                        def containerStopped = sh(script: 'ssh -i /var/jenkins_home/.ssh/website_deploy_rsa_key "${WEBSITE}" docker stop ${containerName}', returnStatus: true) == 0

                        echo "docker stop command was finished successfully: $containerStopped"

                        def containerRemoved = sh(script: 'ssh -i /var/jenkins_home/.ssh/website_deploy_rsa_key "${WEBSITE}" docker rm ${containerName}', returnStatus: true) == 0

                        echo "docker rm command was finished successfully: $containerRemoved"
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
            script {
                echo "Release Failed, rolling back to the version of container prior to this release"
                
                // Check if the container exists 
                    // --> If yes, stop and remove it
                    // --> If no, display result true for both stop and rm command, no harm done 
                // Then let Jenkins continue
                def containerStopped = sh(script: 'docker stop ${containerName}', returnStatus: true) == 0
                echo "docker stop command was finished successfully: $containerStopped"
                def containerRemoved = sh(script: 'docker rm ${containerName}', returnStatus: true) == 0
                echo "docker rm command was finished successfully: $containerRemoved"
            
                // Use the withCredentials block to access the credentials
                // Note: need --rm when docker run.. so that docker stop can kill it cleanly
                withCredentials([
                    string(credentialsId: 'mongodb_user', variable: 'MONGODB_USER'),
                ]) {
                    sh '''
                        docker run -d \
                        -p 5400:5400 \
                        -e DATABASE_URL=${MONGODB_USER} \
                        --name capstone-auth \
                        --network helpmybabies \
                        registry.digitalocean.com/capstone-ccsu/capstone-auth:${previousVersion}

                        docker ps
                    '''                    
                }
            }
        }
        cleanup {
            echo "Clean up in post workspace" 
            cleanWs() // any reference this particular build is deleted from the agent
        }
    }

}