#!/usr/bin/env python3
"""Konverterer eksisterende PROGRESS-LOG.md til PROGRESS-LOG.jsonl.

Best-effort parser: leter etter linjer som matcher pattern
'ts=HH:MM event=TYPE op=OPNAME path="PATH" desc="DESC"'.
Linjer som ikke matches lagres som "raw"-event.
"""

import re
import json
import sys
import argparse
from datetime import datetime
from pathlib import Path

PATTERN = re.compile(
    r'ts=(\S+)\s+event=(\S+)(?:\s+op=(\S+))?(?:\s+path="([^"]+)")?(?:\s+desc="([^"]+)")?'
)


def convert(md_path: Path, jsonl_path: Path):
    with md_path.open(encoding='utf-8') as f:
        lines = f.readlines()

    out = []
    for ln in lines:
        ln = ln.strip()
        if not ln or ln.startswith('#'):
            continue
        m = PATTERN.search(ln)
        if m:
            ts, event, op, path, desc = m.groups()
            out.append({
                "ts": ts,
                "event": event,
                "op": op,
                "path": path,
                "desc": desc,
                "schemaVersion": 1,
            })
        else:
            out.append({
                "ts": "unknown",
                "event": "RAW",
                "raw": ln,
                "schemaVersion": 1,
            })

    with jsonl_path.open('w', encoding='utf-8') as f:
        for e in out:
            f.write(json.dumps(e, ensure_ascii=False) + '\n')

    print(f"Konvertert {len(out)} events til {jsonl_path}")


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('md', type=Path)
    p.add_argument('jsonl', type=Path)
    args = p.parse_args()
    convert(args.md, args.jsonl)
