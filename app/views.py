from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout
from django.http import JsonResponse
from django.contrib import messages
from .models import ClientDetails, AccountDetails, DivisionLog
from .forms import ClientDetailsForm, AuthorizedPersonnelForm, LoginForm
from django.utils import timezone

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
                return redirect("dashboard")
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

def dashboard(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if user.unit == 'PACD':
        return pacd_dashboard(request, user)
    else:
        return unit_dashboard(request, user)

def pacd_dashboard(request, user):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
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
            'client_gender',
            'client_lane_type',
            'client_transaction_type',
            'client_status',
            'client_created_date'
        )

        return JsonResponse({
            'regular_lane': {
                'client_queue_no': regular_lane.client_queue_no if regular_lane else "00",
                'client_fullname': regular_lane.client_fullname if regular_lane else "No client",
                'client_transaction_type': regular_lane.client_transaction_type if regular_lane else "No client",
                'client_created_date': regular_lane.client_created_date.isoformat() if regular_lane else "No client",
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

    return render(request,'app/pacd_dashboard.html', {'user': user})

def unit_dashboard(request, user):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now().date()

        regular_lane = DivisionLog.objects.filter(
            unit=user.unit,
            client_id__client_lane_type='Regular',
            action_type='forwarded',
            client_id__client_created_date__date=today
        ).order_by('client_id__client_queue_no').first()

        priority_lane = DivisionLog.objects.filter(
            unit=user.unit,
            client_id__client_lane_type='Priority',
            action_type='forwarded',
            client_id__client_created_date__date=today
        ).order_by('client_id__client_queue_no').first()

        client_details = DivisionLog.objects.filter(
            unit=user.unit,
            client_id__client_created_date__date=today,
            action_type='forwarded'
        ).values(
            'transaction_details',
            'client_id__client_queue_no',
            'client_id__client_fullname',
        )

        return JsonResponse({
            'regular_lane': {
                'client_queue_no': regular_lane.client_id.client_queue_no if regular_lane else "00",
                'client_fullname': regular_lane.client_id.client_fullname if regular_lane else "No client",
                'transaction_details': regular_lane.transaction_details if regular_lane else "No transaction details",
            },
            'priority_lane': {
                'client_queue_no': priority_lane.client_id.client_queue_no if priority_lane else "00",
                'transaction_details': priority_lane.transaction_details if priority_lane else "No transaction details",
            },
            'client_details': list(client_details)
        })

    return render(request,'app/unit_dashboard.html', {'user': user})
def update_client_status(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        username = request.session.get('username')
        lane_type = request.POST.get('lane_type')
        action = request.POST.get('action')
        division = request.POST.get('division')  # Division from the frontend
        unit = request.POST.get('unit')  # Unit from the frontend
        transaction_details = request.POST.get('remarks', '')  # Optional remarks
        today = timezone.now().date()

        # Get the current client in the specified lane
        client = ClientDetails.objects.filter(
            client_lane_type=lane_type.capitalize(),
            client_status='Pending',
            client_created_date__date=today
        ).order_by('client_queue_no').first()


        if client:
            if action == 'forwarded':
                client.client_status = 'Forwarded'
            elif action == 'Served':
                client.client_status = 'Served'
            elif action == 'Skipped':
                client.client_status = 'Skipped'
            # Save to DivisionLog
            client.save()
            DivisionLog.objects.create(
                client_id = client,
                division = division,
                unit = unit,
                transaction_details = transaction_details,
                action_type = action,
                user = username
            )

            return JsonResponse({'message': 'Client forwarded successfully!', 'client_queue_no': client.client_queue_no})
        else:
            return JsonResponse({'message': 'No pending client in this lane'}, status=404)
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)
    
def create_authorized_personnel(request):
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
            print(form.errors)
            messages.error(request, "User already exists!")
    else:
        form = AuthorizedPersonnelForm()
    
    username = request.session.get('username')
    
    if not username:
        return redirect("login")
    user = AccountDetails.objects.filter(user=username).first()
    
    return render(request, 'app/account.html', {'form': form, 'user': user})