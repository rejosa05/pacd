from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout
from django.contrib import messages
from ..models import AccountDetails, SessionHistory, DivisionLog, ClientDetails
from ..forms import LoginForm, ClientDetailsForm
from django.utils import timezone

def display_view(request):
    return render(request, 'app/display.html')

def client_details(request):
    if request.method == 'POST':
        form = ClientDetailsForm(request.POST)
        if form.is_valid():
            client = form.save()
            return redirect('client_ticket', client_id=client.id)
    else:
         form = ClientDetailsForm()
    return render(request, 'app/client.html', {'form': form})

def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            user = AccountDetails.objects.filter(user=username, status='Active').first()
            if user:

                request.session.flush()
                request.session.cycle_key()
                
                request.session['username'] = user.user

                session_key = request.session.session_key or request.session._get_or_create_session_key()
                SessionHistory.objects.create(user=user.user, login_time=timezone.now(), session_key=session_key)
                return redirect("transactions")
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


def transaction(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not user:
        return redirect('login')
    return render(request, 'app/transaction.html', {'user':user})

def dashboard(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not user:
        return redirect('login')
    
    return render(request, 'app/dashboard.html', {'user':user})

def reports_page(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not username:
        return redirect("login")

    return render(request, "app/reports.html", {'user':user})

def services_page(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not username:
        return redirect("login")

    return render(request, "app/services.html", {'user':user})

def acknowledgement(request, pk):
    today = timezone.now().strftime("%B. %d, %Y %I:%M %p")
    divisionLog = get_object_or_404(DivisionLog, id=pk)
    clientDetails = divisionLog.client_id
    print(clientDetails)
    return render(request, "app/acknowledgement.html",
                   {
                    'clientDetails': clientDetails,
                    'divisionLog': divisionLog,
                    'today': today})