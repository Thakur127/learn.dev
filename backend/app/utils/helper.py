def generate_username_from_email(email: str) -> str:
    return email.split("@")[0]