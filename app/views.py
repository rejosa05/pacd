from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from .models import ClientDetails
from .forms import ClientDetailsForm
from django.utils import timezone

def home(request):
    print('hello world')
    return render(request, 'app/base.html')

def login_view(request):
    return render(request, 'app/login.html')

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
        waiting_clients = ClientDetails.objects.filter(client_status='Pending', client_created_date__date=today)
        return render(request, 'app/display.html', {'waiting_clients': waiting_clients})

def success(request):
    return render(request, 'app/display.html', {'message': 'Data saved successfully!'})

# Client paghtag ug detayle -- fixed/need comment
def client_details(request):
    if request.method == 'POST':
        form = ClientDetailsForm(request.POST)
        if form.is_valid():
            form.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'message': 'Data saved successfully!'})
            return redirect('display_page')
    else:
         form = ClientDetailsForm()
    return render(request, 'app/client.html', {'form': form})

def account_user(request):
    return render(request, 'app/account.html')

def dashboard(request):
    today = timezone.now().date()
    regular_lane = ClientDetails.objects.filter(client_lane_type='Regular', client_status='Pending', client_created_date__date=today).first()
    priority_lane = ClientDetails.objects.filter(client_lane_type='Priority', client_status='Pending', client_created_date__date=today).first() 
    client_details = ClientDetails.objects.filter(client_status='Pending', client_created_date__date=today).all()[:10]
    print(client_details)
    context = {
        'client_details': client_details,
        'regular_lane': regular_lane,
        'priority_lane': priority_lane
    }
    return render(request, 'app/dashboard.html', context = context)

def update_client_status(request, client_queue_no):
    try:
        client = ClientDetails.objects.get(client_queue_no=client_queue_no)
        client.client_status = 'Served'
        client.save()
        return redirect('dashboard_page')
    except ClientDetails.DoesNotExist:
        return JsonResponse({'message': 'Client not found!'}, status=404)