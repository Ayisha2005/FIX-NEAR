import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def mask_phone(phone: str) -> str:
    if not phone or len(phone) < 4:
        return "*******"
    return phone[:3] + " " + "*" * (len(phone) - 5) + phone[-2:]

def mask_email(email: str) -> str:
    if not email or "@" not in email:
        return "*****@***.com"
    name, domain = email.split("@", 1)
    masked_name = name[0] + "***" if len(name) > 1 else "*"
    return f"{masked_name}@{domain}"
