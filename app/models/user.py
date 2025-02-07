from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from sqlalchemy import Numeric
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(40), nullable=False)
    last_name = db.Column(db.String(40), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False, unique=True)
    restarauntOwner = db.Column(db.Boolean, nullable=False)
    address = db.Column(db.String(40), nullable=False)
    city = db.Column(db.String(40), nullable=False)
    state = db.Column(db.String(40), nullable=False)
    zip = db.Column(db.Integer, nullable=False)
    wallet = db.Column(Numeric(10, 2), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    hashed_password = db.Column(db.String(255), nullable=False)

<<<<<<< Updated upstream
    # posts = db.relationship('Post', back_populates='users')
    # restaraunts = db.relationship('Restaraunt', back_populates='users')
=======
>>>>>>> Stashed changes

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }
