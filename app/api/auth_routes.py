from flask import Blueprint, request
from app.models import User, db
from app.forms import LoginForm
from app.forms import SignUpForm
from flask_login import current_user, login_user, logout_user, login_required

auth_routes = Blueprint("auth", __name__)


@auth_routes.route("/")
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {"errors": {"message": "Unauthorized"}}, 401


@auth_routes.route("/login", methods=["POST"])
def login():
    """
    Logs a user in
    """
    form = LoginForm()
    # Get the csrf_token from the request cookie and put it into the
    # form manually to validate_on_submit can be used
    form["csrf_token"].data = request.cookies["csrf_token"]
    print("\n FORM DATA: ", form.data, "\n")
    if form.validate_on_submit():
        # Add the user to the session, we are logged in!
        if form.data["email"]:
            user = User.query.filter(User.email == form.data["email"]).first()
            login_user(user)
            return user.to_dict()
        elif form.data["phone_number"]:
            user = User.query.filter(User.phone_number == form.data["phone_number"]).first()
            login_user(user)
            return user.to_dict()
    return form.errors, 401
"""
    { "email": "k@user.io",
    "password": "password"}
"""


@auth_routes.route("/logout")
def logout():
    """
    Logs a user out
    """
    logout_user()
    return {"message": "User logged out"}


@auth_routes.route("/signup", methods=["POST"])
def sign_up():
    """
    Creates a new user and logs them in
    """
    form = SignUpForm()
    form["csrf_token"].data = request.cookies["csrf_token"]
    print("\n FORM DATA: ", form.data, "\n")
    if form.validate_on_submit():
        user = User(
            first_name=form.data["first_name"],
            last_name=form.data["last_name"],
            phone_number=form.data["phone_number"],
            email=form.data["email"],
            password=form.data["password"],
            wallet=form.wallet.data
        )
        print(user)
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return user.to_dict()
    return form.errors, 401
"""
{
    "address": [
        "232 bob court"
    ],
    "city": [
        "oakland"
    ],
    "email": [
        "bob@aa.io"
    ],
    "first_name": [
        "bob"
    ],
    "last_name": [
        "bobber"
    ],
    "phone_number": [
        "15102930299"
    ],
    "state": [
        "ca"
    ],
    "zip": [
        "94603"
    ],
    "password": "password"
}
"""


@auth_routes.route("/unauthorized")
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    return {"errors": {"message": "Unauthorized"}}, 401
