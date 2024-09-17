import bcrypt


def get_password_hash(password: str) -> str:
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_password.decode("utf-8")  # Convert from bytes to string


def verify_password(raw_password: str, hashed_password: str) -> bool:
    # Verify the raw password against the hashed password
    return bcrypt.checkpw(raw_password.encode("utf-8"), hashed_password.encode("utf-8"))
