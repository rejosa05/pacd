from functools import wraps

from django.contrib.auth.views import redirect_to_login
from django.http import HttpResponseForbidden


def role_required(*allowed_roles):

    def decorator(view_func):

        @wraps(view_func)
        def wrapper(request, *args, **kwargs):

            if not request.user.is_authenticated:
                return redirect_to_login(request.get_full_path())

            try:
                role = request.user.account_profile.role
            except Exception:
                return HttpResponseForbidden("Account profile not found.")

            if role not in allowed_roles:
                return HttpResponseForbidden(
                    "You do not have permission to access this page."
                )

            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator


def format_contact_number(value):
    digits = "".join(filter(str.isdigit, value or ""))

    if len(digits) == 11:
        return f"{digits[:4]}-{digits[4:8]}-{digits[8:]}"

    return value.strip()