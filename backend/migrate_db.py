from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        print("Starting migration...")
        
        # Add apply_link to jobs
        try:
            conn.execute(text("ALTER TABLE jobs ADD COLUMN apply_link VARCHAR(255)"))
            print("Successfully added 'apply_link' to 'jobs' table.")
        except Exception as e:
            print(f"Skipping 'apply_link': {e}")

        # Add type to posts
        try:
            conn.execute(text("ALTER TABLE posts ADD COLUMN type VARCHAR(50) DEFAULT 'general'"))
            print("Successfully added 'type' to 'posts' table.")
        except Exception as e:
            print(f"Skipping 'type': {e}")
        
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()
