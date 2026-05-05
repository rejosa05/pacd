from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout
from django.contrib import messages
from ..models import AccountDetails, SessionHistory, DivisionLog, ClientDetails, ServicesDetails
from ..forms import LoginForm, ClientDetailsForm
from django.utils import timezone
from ..utils.utils import *

def display_view(request):
    return render(request, 'app/pages/display.html')

def client_details(request):
    if request.method == 'POST':
        form = ClientDetailsForm(request.POST)
        if form.is_valid():
            client = form.save()
            return redirect('client_ticket', client_id=client.id)
    else:
         form = ClientDetailsForm()
    return render(request, 'app/pages/kiosk.html', {'form': form})

from django.shortcuts import render, redirect
from django.contrib import messages
from django.utils import timezone
from django.contrib.auth.hashers import check_password

def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)

        if form.is_valid():
            username = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")
            user = AccountDetails.objects.filter(user=username, status='Active').first()

            if user and check_password(password, user.password):

                request.session.flush()
                request.session.cycle_key()

                request.session['username'] = user.user

                session_key = request.session.session_key or request.session._get_or_create_session_key()

                SessionHistory.objects.create(
                    user=user.user,
                    login_time=timezone.now(),
                    session_key=session_key
                )

                return redirect("transactions")

            else:
                messages.error(request, "Invalid credentials. Please try again.")

        else:
            messages.error(request, "Invalid form input.")

    else:
        form = LoginForm()

    return render(request, "app/pages/login.html", {"form": form})

def logout_view(request):
    username = request.session.get('username')
    session_key = request.session.session_key

    SessionHistory.objects.filter(user=username, session_key=session_key, logout_time__isnull=True).update(
        logout_time=timezone.now()
    )

    request.session.flush()
    logout(request)
    return redirect('login')


def transaction(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not user:
        return redirect('login')
    return render(request, 'app/pages/transaction.html', {'user':user, 'page_title': 'Clients'})

def dashboard(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not user:
        return redirect('login')
    
    return render(request, 'app/pages/dashboard.html', {'user':user , 'page_title': 'Dashboard'})

def reports_page(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not username:
        return redirect("login")

    return render(request, "app/pages/reports.html", {'user':user, 'page_title': 'Transactions'})

def services_page(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not username:
        return redirect("login")

    return render(request, "app/pages/services.html", {'user':user, 'page_title': 'Services'})

def acknowledgement(request, transaction_no):
    context = client_context(transaction_no, request)

    if context is None:
        return redirect('login')
    
    return render(request, "app/pages/acknowledgement.html", context)

def client_transaction(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    print("test")

    if not username:
        return redirect("login")

    return render(request, "app/clients.html", {'user':user})