from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from ..models import AccountDetails
from ..form.loginForm import LoginForm


def loginView(request):

    form = LoginForm(request.POST or None)

    if request.method == "POST":
        if form.is_valid():

            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]

            user = authenticate(request, username=username, password=password)

            if user is not None:

                # Get AccountDetails
                try:
                    profile = AccountDetails.objects.get(user=user)
                except AccountDetails.DoesNotExist:
                    messages.error(request, "Wala nakit-i ang account profile.")
                    return render(request, "index.html", {"form": form})

                # =====================================
                # CHECK ACCOUNT STATUS
                # =====================================
                if profile.status != "Active":
                    messages.error(
                        request, "Kining account inactive na. Palihug contact sa admin."
                    )
                    return render(request, "index.html", {"form": form})

                # =====================================
                # DJANGO USER STATUS
                # =====================================
                if not user.is_active:
                    messages.error(
                        request, "Kining account disabled. Palihug contact sa admin."
                    )
                    return render(request, "index.html", {"form": form})

                # =====================================
                # LOGIN
                # =====================================
                login(request, user)

                next_url = request.GET.get("next", "dashboard_")

                return redirect(next_url)

            else:
                messages.error(request, "Sayop ang username o password.")

        else:
            messages.error(request, "Palihug e-check ang imong gi-input.")

    return render(request, "index.html", {"form": form})


@login_required
def logout_view(request):
    logout(request)
    messages.success(request, "Malampuson ka nga na-logout.")
    return redirect("login_")
