"""
Idempotent PostgreSQL migration for Telegram user IDs.

Run this script once before deploying the shared models to an existing
PostgreSQL database that still has INTEGER user_id columns.
"""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import text

from backend_shared.database import SQLALCHEMY_DATABASE_URL, engine

TABLES = ("user_gifts", "transactions", "users")


def main() -> None:
    if not SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
        print("SQLite does not require this migration.")
        return

    with engine.begin() as conn:
        column_types = {
            table_name: data_type
            for table_name, data_type in conn.execute(
                text(
                    """
                    SELECT table_name, data_type
                    FROM information_schema.columns
                    WHERE table_schema = current_schema()
                      AND table_name IN ('users', 'user_gifts', 'transactions')
                      AND column_name = 'user_id'
                    """
                )
            )
        }
        missing = set(TABLES) - set(column_types)
        if missing:
            raise RuntimeError(f"Missing user_id columns: {', '.join(sorted(missing))}")

        tables_to_migrate = [
            table_name for table_name in TABLES if column_types[table_name] == "integer"
        ]
        if not tables_to_migrate:
            print("user_id columns are already BIGINT; no migration needed.")
            return

        for table_name in tables_to_migrate:
            conn.execute(
                text(
                    f"ALTER TABLE {table_name} "
                    "ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT"
                )
            )
            print(f"Updated {table_name}.user_id to BIGINT")

    print("Migration completed.")


if __name__ == "__main__":
    main()

