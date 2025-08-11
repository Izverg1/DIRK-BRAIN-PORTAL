#!/bin/bash

# This script is a placeholder for deploying a project to Docker.
# It assumes a Dockerfile is present in the project directory.

PROJECT_PATH=$1
IMAGE_NAME=$2
CONTAINER_NAME=$3
PORTS=$4 # Comma-separated list of port mappings (e.g., "80:80,443:443")

if [ -z "$PROJECT_PATH" ] || [ -z "$IMAGE_NAME" ] || [ -z "$CONTAINER_NAME" ]; then
  echo "Usage: $0 <project_path> <image_name> <container_name> [ports]"
  exit 1
fi

echo "--- Building Docker image: $IMAGE_NAME ---"
docker build -t $IMAGE_NAME $PROJECT_PATH || { echo "Docker image build failed."; exit 1; }

echo "--- Stopping and removing existing container (if any): $CONTAINER_NAME ---"
docker stop $CONTAINER_NAME > /dev/null 2>&1
docker rm $CONTAINER_NAME > /dev/null 2>&1

PORT_ARGS=""
if [ -n "$PORTS" ]; then
  IFS=',' read -ra ADDR <<< "$PORTS"
  for i in "${ADDR[@]}"; do
    PORT_ARGS+=" -p $i"
  done
fi

echo "--- Running Docker container: $CONTAINER_NAME ---"
docker run -d --name $CONTAINER_NAME $PORT_ARGS $IMAGE_NAME || { echo "Docker container run failed."; exit 1; }

echo "Docker deployment successful for $CONTAINER_NAME."
