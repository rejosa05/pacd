from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib import messages
from ..models import AccountDetails
from ..forms import LoginForm

def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            user = AccountDetails.objects.filter(user=username).first()
            if user:
                request.session['username'] = user.user
                return redirect("user-type")
            else:
                messages.error(request, "Invalid credentials. Please try again.")
        else:
            messages.error(request, "Invalid credentials. Please try again.")
    else:
        form = LoginForm()
    
    return render(request, "app/login.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect('login')