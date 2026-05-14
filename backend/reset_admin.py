from app import models, database, utils
from sqlalchemy.orm import Session

def reset_admin():
    db = database.SessionLocal()
    try:
        email = "admin@collegehub.com"
        password = "password" # Changed to simple 'password' to match verify_admin.py attempt if I change it, or stick to admin123
        
        # Let's use 'admin123' as per seed, but ensure hash is fresh
        password = "admin123"
        
        print(f"Resetting Admin {email} with password '{password}'...")
        
        admin = db.query(models.Admin).filter(models.Admin.email == email).first()
        if not admin:
            print("Admin not found, creating...")
            admin = models.Admin(
                email=email,
                name="System Admin",
                password=utils.get_password_hash(password)
            )
            db.add(admin)
        else:
            print("Admin found, updating password...")
            admin.password = utils.get_password_hash(password)
            
        db.commit()
        print("✅ Admin reset successfully.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin()
