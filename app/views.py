from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout, login as django_login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib import messages
from .models import ClientDetails, AccountDetails
from .forms import ClientDetailsForm, AuthorizedPersonnelForm, LoginForm
from django.utils import timezone
from django.contrib.auth.hashers import check_password

def home(request):
    print('hello world')
    return render(request, 'app/base.html')
def login_view(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get("username")
            user = AccountDetails.objects.filter(user=username).first()
            if user:
                request.session['username'] = user.user
                return redirect("dashboard")  # Redirect to home page or dashboard
            else:
                messages.error(request, "Invalid credentials. Please try again.")
        else:
            messages.error(request, "Invalid credentials. Please try again.")
    else:
        form = LoginForm()
    
    return render(request, "app/login.html", {"form": form})
        
#def login_view(request):
    #if request.method  == 'POST':
       # username = request.POST.get('username')
       # password = request.POST.get('password')
       # user = authenticate(request, username = username, password = password)
       # if user is not None:
       #     login(request, user)
       #     return redirect('dashboard')
       # else:
       #     return render(request, 'app/login.html', {'error': 'Invalid Credentials'})
    #return render(request, 'app/login.html')

def logout_view(request):
    logout(request)
    return redirect('login')

# Pag display sa number on the screen -- fixed/need comment
def display(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest': 
        today = timezone.now().date()
        regular_lane = ClientDetails.objects.filter(client_lane_type='Regular', client_status='Pending', client_created_date__date=today).first()
        priority_lane = ClientDetails.objects.filter(client_lane_type='Priority', client_status='Pending', client_created_date__date=today).first()
        waiting_clients = ClientDetails.objects.filter(client_status='Pending', client_created_date__date=today).values_list('client_queue_no', flat=True)
        data = {
            'regular_lane': {
                'client_queue_no': regular_lane.client_queue_no if regular_lane else "00"
            },
            'priority_lane': {
                'client_queue_no': priority_lane.client_queue_no if priority_lane else "00"
            }, 
            'waiting_clients': list(waiting_clients)
        }
        return JsonResponse(data)
    else:
        today = timezone.now().date()
        waiting_clients = ClientDetails.objects.filter(client_status='P nding', client_created_date__date=today)
        return render(request, 'app/display.html', {'waiting_clients': waiting_clients})

def success(request):
    return render(request, 'app/display.html', {'message': 'Data saved successfully!'})

# Client paghtag ug detayle -- fixed/need comment
def client_details(request):
    if request.method == 'POST':
        form = ClientDetailsForm(request.POST)
        if form.is_valid():
            client = form.save()
            return redirect('client_ticket', client_id=client.id)
    else:
         form = ClientDetailsForm()
    return render(request, 'app/client.html', {'form': form})

# Client pg display sa ticket to verify his/her number -- fixed/need comment
def client_ticket(request, client_id):
    client = get_object_or_404(ClientDetails, id=client_id)
    return render(request, 'app/queue.html', {'client': client})

def update_client_status(request, client_queue_no):
    try:
        client = ClientDetails.objects.get(client_queue_no=client_queue_no)
        client.client_status = 'Served'
        client.save()
        return redirect('dashboard_page')
    except ClientDetails.DoesNotExist:
        return JsonResponse({'message': 'Client not found!'}, status=404)

def dashboard(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':  # Check if it's an AJAX request
        today = timezone.now().date()

        regular_lane = ClientDetails.objects.filter(
            client_lane_type='Regular',
            client_status='Pending',
            client_created_date__date=today
        ).order_by('client_queue_no').first()

        priority_lane = ClientDetails.objects.filter(
            client_lane_type='Priority',
            client_status='Pending',
            client_created_date__date=today
        ).order_by('client_queue_no').first()

        client_details = ClientDetails.objects.filter(client_created_date__date=today, client_status='Pending').values(
            'client_queue_no',
            'client_fullname',
            'client_lane_type',
            'client_transaction_type',
            'client_status',
            'client_created_date'
        )

        return JsonResponse({
            'regular_lane': {
                'client_queue_no': regular_lane.client_queue_no if regular_lane else "00",
                'waiting_count': ClientDetails.objects.filter(
                    client_lane_type='Regular',
                    client_status='Pending',
                    client_created_date__date=today
                ).count()
            },
            'priority_lane': {
                'client_queue_no': priority_lane.client_queue_no if priority_lane else "00",
                'waiting_count': ClientDetails.objects.filter(
                    client_lane_type='Priority',
                    client_status='Pending',
                    client_created_date__date=today
                ).count()
            },
            'client_details': list(client_details)
        })

    username = request.session.get('username')
    
    if not username:
        return redirect("login")
    user = AccountDetails.objects.filter(user=username).first()

    return render(request, 'app/dashboard.html', {'user': user})

def update_client_status(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        lane_type = request.POST.get('lane_type')
        action = request.POST.get('action')
        today = timezone.now().date()

        client = ClientDetails.objects.filter(
            client_lane_type = lane_type.capitalize(),
            client_status = 'Pending',
            client_created_date__date = today
        ).order_by('client_queue_no').first()

        if client:
            if action == 'served':
                client.client_status = 'Served'
            elif action == 'skipped':
                client.client_status = 'Skipped'
            client.save()

            return JsonResponse({'message': 'Success', 'client_queue_no' : client.client_queue_no})
        else:
            return JsonResponse({'message': 'NO pending client in this lane'}, status = 404)
    else:
        return JsonResponse({'message': 'success', 'client_queue_no': client.client_queue_no})
    
def create_authorized_personnel(request):
    if request.method == 'POST':
        form = AuthorizedPersonnelForm(request.POST)
        
        # Check if form is valid before accessing cleaned_data
        if form.is_valid():
            username = form.cleaned_data.get("user")  # Access cleaned_data after this check
            
            # Check if the user already exists
            if AccountDetails.objects.filter(user=username).exists():
                messages.error(request, "User already exists!")
            else:
                account = form.save(commit=False)
                account.set_password(form.cleaned_data["password"])  # Save hashed password
                account.save()
                messages.success(request, "Account created successfully!")
                return redirect("account")  # Redirect to avoid duplicate POST on refresh
        else:
            print(form.errors)
            messages.error(request, "User already exists!")
    else:
        form = AuthorizedPersonnelForm()
    return render(request, 'app/account.html', {'form': form})
