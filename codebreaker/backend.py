from flask import Flask, request, jsonify, g
from flask_cors import CORS
import sqlite3
import time
import os

DB_PATH = os.environ.get("SCORES_DB", "scores.db")
PORT = int(os.environ.get("BACKEND_PORT", 5001))

app = Flask(__name__)
CORS(app)

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = sqlite3.connect(DB_PATH)
    cur = db.cursor()
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        attempts INTEGER NOT NULL,
        duration_ms INTEGER DEFAULT 0,
        timestamp INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_scores_attempts ON scores(attempts);
    """)
    db.commit()
    db.close()

init_db()


@app.route("/score", methods=["POST"])
def score():
    """
    Erwartet JSON:
    {
      "attempts": 3,
      "timestamp": 1670000000000,
      "duration_ms": 12345,
      "initData": "..."
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"ok": False, "error": "invalid json"}), 400

    attempts = data.get("attempts")
    timestamp = data.get("timestamp", int(time.time() * 1000))
    duration_ms = data.get("duration_ms", 0)
    init_data = data.get("initData", None)

    user_id = data.get("user_id", None)
    username = data.get("username", None)

    if attempts is None:
        return jsonify({"ok": False, "error": "missing attempts"}), 400

    db = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO scores (user_id, username, attempts, duration_ms, timestamp) VALUES (?, ?, ?, ?, ?)",
        (user_id, username, int(attempts), int(duration_ms), int(timestamp))
    )
    db.commit()
    row_id = cur.lastrowid

    print(f"[SCORE] id={row_id} user_id={user_id} username={username} attempts={attempts} duration_ms={duration_ms} ts={timestamp} initData_present={bool(init_data)}")

    return jsonify({"ok": True, "id": row_id})

@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    """
    Liefert Top N. Standardmäßig: beste Score pro user (MIN attempts).
    Optionales Query: ?limit=10
    """
    limit = int(request.args.get("limit", 10))

    db = get_db()

    rows = db.execute("""
    SELECT
      COALESCE(username, 'anonymous') AS name,
      COALESCE(user_id, 0) AS user_id,
      MIN(attempts) AS best_attempts,
      MIN(duration_ms) AS best_duration,
      MIN(timestamp) AS first_seen_ts
    FROM scores
    GROUP BY COALESCE(user_id, id)  -- wenn user_id NULL wird jede Zeile eigenständig behandelt
    ORDER BY best_attempts ASC, best_duration ASC, first_seen_ts ASC
    LIMIT ?
    """, (limit,)).fetchall()

    result = []
    for r in rows:
        result.append({
            "name": r["name"],
            "user_id": r["user_id"],
            "best_attempts": r["best_attempts"],
            "best_duration": r["best_duration"],
            "first_seen_ts": r["first_seen_ts"]
        })

    return jsonify({"ok": True, "rows": result})

@app.route("/all", methods=["GET"])
def all_scores():
    """Nur für Debug: gibt alle Scores zurück (nicht für Produktion)."""
    db = get_db()
    rows = db.execute("SELECT * FROM scores ORDER BY timestamp DESC LIMIT 200").fetchall()
    out = [dict(r) for r in rows]
    return jsonify({"ok": True, "rows": out})

if __name__ == "__main__":
    print(f"Starting backend on http://127.0.0.1:{PORT}  (DB: {DB_PATH})")
    app.run(host="0.0.0.0", port=PORT, debug=True)
