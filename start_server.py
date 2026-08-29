"""
start_server.py — PookalBot launcher (run from the Mosaic root directory)

Usage:
    python start_server.py

Sets GEMINI_API_KEY and starts pi/ai_server.py as a subprocess so that
__file__ inside ai_server.py resolves correctly to pi/ai_server.py.
"""
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
SERVER = ROOT / "pi" / "ai_server.py"

env = os.environ.copy()
env["GEMINI_API_KEY"] = os.environ.get("GEMINI_API_KEY", "")  # set via env var, never hardcode
if not env["GEMINI_API_KEY"]:
    print("ERROR: GEMINI_API_KEY environment variable is not set.")
    print("Run:  $env:GEMINI_API_KEY='your-key-here'  then try again.")
    sys.exit(1)

print(f"Starting PookalBot AI Server...")
print(f"Open http://localhost:5000 in your browser")

subprocess.run([sys.executable, str(SERVER)], env=env)
