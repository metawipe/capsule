"""
Скрипт для инициализации базы данных
Запустите этот скрипт один раз для создания таблиц
"""
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend_shared.database import init_db

if __name__ == "__main__":
    print("Инициализация базы данных...")
    init_db()
    print("База данных успешно инициализирована!")
    print(f"Файл БД: db.sqlite3")

