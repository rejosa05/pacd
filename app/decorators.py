from functools import wraps

from django.contrib.auth.views import redirect_to_login
from django.http import HttpResponseForbidden
from django.conf import settings

def role_required(*allowed_roles):
    def decorator(view_func):

        @wraps(view_func)
        def wrapper(request, *args, **kwargs):

            # Not logged in → redirect to login page
            if not request.user.is_authenticated:
                return redirect_to_login(
                    request.get_full_path(),
                    settings.LOGIN_URL,
                )

            # Check user's account profile
            try:
                role = request.user.account_profile.role
            except AttributeError:
                return HttpResponseForbidden("Account profile not found.")

            # Check allowed role
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
