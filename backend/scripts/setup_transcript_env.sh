#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="$ROOT_DIR/.transcript-venv"
REQUIREMENTS_FILE="$ROOT_DIR/python/requirements.txt"
PYTHON_BIN="${PYTHON_BIN:-python3}"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Error: cannot find python interpreter '$PYTHON_BIN'. Set PYTHON_BIN before running." >&2
  exit 1
fi

echo "🔧 Using python: $PYTHON_BIN"
echo "📁 Backend root: $ROOT_DIR"
echo "📦 Requirements: $REQUIREMENTS_FILE"

if [ ! -f "$REQUIREMENTS_FILE" ]; then
  echo "Error: requirements file not found at $REQUIREMENTS_FILE" >&2
  exit 1
fi

if [ ! -d "$VENV_DIR" ]; then
  echo "✨ Creating virtualenv at $VENV_DIR"
  "$PYTHON_BIN" -m venv "$VENV_DIR"
else
  echo "✅ Reusing existing virtualenv at $VENV_DIR"
fi

if [ -f "$VENV_DIR/bin/activate" ]; then
  # shellcheck disable=SC1090
  source "$VENV_DIR/bin/activate"
elif [ -f "$VENV_DIR/Scripts/activate" ]; then
  # shellcheck disable=SC1090
  source "$VENV_DIR/Scripts/activate"
else
  echo "Error: cannot locate activate script inside $VENV_DIR" >&2
  exit 1
fi

echo "⬆️  Upgrading pip"
pip install --upgrade pip >/dev/null

echo "📥 Installing transcript dependencies"
pip install -r "$REQUIREMENTS_FILE"

if [ -n "${VIRTUAL_ENV:-}" ]; then
  PY_BIN_PATH="$VIRTUAL_ENV/bin/python"
  if [ ! -x "$PY_BIN_PATH" ]; then
    PY_BIN_PATH="$VIRTUAL_ENV/Scripts/python.exe"
  fi
else
  PY_BIN_PATH="$VENV_DIR/bin/python"
fi

echo ""
echo "🎉 Done!"
echo "Set this in your .env:"
echo "  YT_TRANSCRIPT_PYTHON=$PY_BIN_PATH"

