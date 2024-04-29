#!/bin/bash

echo "Initiate end to end testing..."
echo

# Check if cURL command is available (required), abort if it does not exist
if ! type curl >/dev/null 2>&1; then
    echo >&2 "Required curl but it's not installed. Aborting."
    exit 1
fi
echo

# Perform GET Request
response=$(curl -s 'http://104.236.196.52:9000/api/v1/e2e')

# Check if the response contains "Success"
if [[ "$response" == *"Success"* ]]; then
    message="Success"
else
    message="Failed"
fi

# Print Response in Jenkins Console
echo "Test Result: $message"
