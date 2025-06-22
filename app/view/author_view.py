from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib import messages
from ..models import AccountDetails, SessionHistory
from ..forms import LoginForm, AuthorizedPersonnelForm
from django.http import HttpResponseForbidden
from django.http import JsonResponse
from django.utils import timezone

def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            user = AccountDetails.objects.filter(user=username).first()
            if user:

                request.session.flush()
                request.session.cycle_key()
                
                request.session['username'] = user.user

                session_key = request.session.session_key or request.session._get_or_create_session_key()
                SessionHistory.objects.create(user=user.user, login_time=timezone.now(), session_key=session_key)
                return redirect("user-type")
            else:
                messages.error(request, "Invalid credentials. Please try again.")
        else:
            messages.error(request, "Invalid credentials. Please try again.")
    else:
        form = LoginForm()
    
    return render(request, "app/login.html", {"form": form})

def logout_view(request):
    username = request.session.get('username')
    session_key = request.session.session_key

    SessionHistory.objects.filter(user=username, session_key=session_key, logout_time__isnull=True).update(
        logout_time=timezone.now()
    )

    request.session.flush()
    logout(request)
    return redirect('login')

def user_type(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if user.unit == 'PACD':
        return redirect('pacd-transactions')
    else:
        return redirect('unit-transactions')
    
def pacd_transactions(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if not user or user.unit != "PACD":
        return HttpResponseForbidden("Access denied. PACD users only.")

    return render(request, "app/pacd_transactions.html", {"user": user})

def pacd_dashboard(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if not user or user.unit != "PACD":
        return HttpResponseForbidden("Access denied. PACD users only.")

    return render(request, "app/pacd_dashboard.html", {"user": user})
def unit_transactions(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if user.unit == "PACD":
        return redirect("pacd-dashboard")
    
    return render(request, "app/unit_transactions.html", {"user": user})

def unit_dashboard(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if user.unit == "PACD":
        return HttpResponseForbidden("Access denied. PACD users only.")

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
                account.created_by = request.session.get('username')
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

    if not user or user.unit != "PACD":
        return HttpResponseForbidden("Access denied. PACD users only.")
    
    return render(request, 'app/account.html', {'form': form, 'user': user})

def accountList(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        account = AccountDetails.objects.filter().order_by('-date_created')
        accountList = [
            {
                'id': accounts.id,
                'first_name': accounts.first_name,
                'last_name': accounts.last_name,
                'position': accounts.position,
                'divisions': accounts.divisions,
                'unit': accounts.unit,
                'email': accounts.email,
                'contact': accounts.contact,
                'user': accounts.user,
                'password': accounts.password,
                'status': accounts.status,
                'date_created': accounts.date_created.isoformat() if accounts.date_created else None,
            }
            for accounts in account
        ]
        return JsonResponse({'accountList': accountList})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)

def reports_page(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not username:
        return redirect("login")

    return render(request, "app/reports.html", {'user':user})
