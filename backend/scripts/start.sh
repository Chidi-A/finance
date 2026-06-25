#!/usr/bin/env bash
set -e
bash scripts/prestart.sh
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-10000}"