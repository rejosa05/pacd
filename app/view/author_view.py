from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib import messages
from ..models import AccountDetails
from ..forms import LoginForm, AuthorizedPersonnelForm

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

def user_type(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if user.unit == 'PACD':
        return redirect('pacd-dashboard')
    else:
        return redirect('unit-dashboard')
    
def pacd_dashboard(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()
    return render(request, "app/pacd_dashboard.html", {"user": user})

def unit_dashboard(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()
    return render(request, "app/unit_dashboard.html", {"user": user})

    
def add_account(request):
    if request.method == 'POST':
        form = AuthorizedPersonnelForm(request.POST)
        
        if form.is_valid():
            username = form.cleaned_data.get("user")
            
            if AccountDetails.objects.filter(user=username).exists():
                messages.error(request, "User already exists!")
            else:
                account = form.save(commit=False)
                account.set_password(form.cleaned_data["password"]) 
                account.save()
                messages.success(request, "Account created successfully!")
                return redirect("account")
        else:
            messages.error(request, "User already exists!")
    else:
        form = AuthorizedPersonnelForm()
    
    username = request.session.get('username')
    
    if not username:
        return redirect("login")
    user = AccountDetails.objects.filter(user=username).first()
    
    return render(request, 'app/account.html', {'form': form, 'user': user})

def reports_page(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()
    return render(request, "app/reports.html", {"user": user})


def logout_view(request):
    logout(request)
    return redirect('login')