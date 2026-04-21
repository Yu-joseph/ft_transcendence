#!/bin/bash
set -e

ENV_PATH="/Users/bouhammo/goinfre/myenv"

echo "Creating virtual environment at: $ENV_PATH"
python3 -m venv "$ENV_PATH"

echo "Activating virtual environment..."
source "$ENV_PATH/bin/activate"

echo "Upgrading pip..."
pip install --upgrade pip

echo "Installing requirements..."
pip install -r requirements.txt

echo "Done!"
echo "Activate later using:"
echo "source $ENV_PATH/bin/activate"