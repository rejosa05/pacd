from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import ClientDetails
from .forms import ClientDetailsForm, AuthorizedPersonnelForm
from django.utils import timezone

def home(request):
    print('hello world')
    return render(request, 'app/base.html')

def login_view(request):
    if request.method  == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username = username, password = password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'app/login.html', {'error': 'Invalid Credentials'})
    return render(request, 'app/login.html')

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

@login_required
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

    return render(request, 'app/dashboard.html')

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
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])  # Hash the password
            user.is_staff = True  # Mark the user as staff
            user.save()
            return redirect('dashboard')  # Redirect to the dashboard after creation
    else:
        form = AuthorizedPersonnelForm()
    return render(request, 'app/account.html', {'form': form})
