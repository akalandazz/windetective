from sqlalchemy.orm import Session
from models import User

# Create a new user
def create_user(db: Session, email: str, password: str, name: str, phone: str):
    user = User(email=email, password=password, name=name, phone=phone)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Get a user by email
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()