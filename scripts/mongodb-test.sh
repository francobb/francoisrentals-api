#!/bin/bash

# Function to check if MongoDB is running
is_mongodb_running() {
  if pgrep mongod >/dev/null || lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null; then
    return 0  # MongoDB is running
  else
    return 1  # MongoDB is not running
  fi
}

# Check if the script is running in a CI environment
if [[ "$CI" == "true" ]]; then
  # In CI environment, just wait for MongoDB to be up and running via Docker
  echo "Waiting for MongoDB to start via Docker..."
  while ! docker ps | grep -q "fr-db"; do
    sleep 2
  done
  echo "MongoDB is up and running."
else
  # If not in CI environment, use regular MongoDB config and start with mongod
  # Start MongoDB if it's not running
  if ! is_mongodb_running; then
    echo "Starting MongoDB..."
    mongod --dbpath data --port 27017 --fork --config "$MONGO_CONFIG"
  fi

  # Wait for MongoDB to be up and running
  while ! is_mongodb_running; do
    echo "Waiting for MongoDB to start..."
    sleep 1
  done

  # Check if MongoDB started successfully
  if [ $? -eq 0 ]; then
    echo "MongoDB started successfully."
  else
    echo "Failed to start MongoDB."
  fi
fi
