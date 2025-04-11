from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout
from django.http import JsonResponse
from django.contrib import messages
from .models import ClientDetails, AccountDetails, DivisionLog
from .forms import ClientDetailsForm, AuthorizedPersonnelForm, LoginForm
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

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
                return redirect("dashboards")
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

def client_ticket(request, client_id):
    client = get_object_or_404(ClientDetails, id=client_id)
    return render(request, 'app/queue.html', {'client': client})

# condition of dashboard to PACD or Unit -- fixed
def dashboard(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if user.unit == 'PACD':
        return redirect('pacd_dashboard')
    else:
        return redirect('unit_dashboards')

# return number display on PACD dashboard only - fixed
def pacd_dashboard1(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not username:
        return redirect("login")
    
    return render(request, 'app/pacd_dashboard.html', {'user': user})

def pacd_dashboard(request):
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

        return JsonResponse({
            'regular_lane': {
                'client_queue_no': regular_lane.client_queue_no if regular_lane else "00",
            },
            'priority_lane': {
                'client_queue_no': priority_lane.client_queue_no if priority_lane else "00",
            },
        })

# ---- Fectch forwarded unit -- FIXED ----
def pacd_unit_dashboard(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now().date()
        forwarded_clients = DivisionLog.objects.filter(action_type='forwarded', date__date=today)

        forwarded_client_count = []
        for f_client in forwarded_clients:
            forwarded_client_count.append({
                'transaction_details': f_client.transaction_details,
                'client_fullname': f_client.client_id.client_fullname,
                'client_gender': f_client.client_id.client_gender,
                'client_lane_type': f_client.client_id.client_lane_type,
                'client_queue_no': f_client.client_id.client_queue_no,
                'client_transaction_type': f_client.client_id.client_transaction_type,
                'client_division':f_client.division,
                'client_a_type': f_client.action_type,
                'client_unit':f_client.unit,
                'client_id': f_client.client_id.id,
                'date_resolved': f_client.date_resolved.isoformat() if f_client.date_resolved else None,
            })
        return JsonResponse({'forwarded_clients': forwarded_client_count})

# ----- FIXED AREA -----
def unit_dashboard1(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not username:
        return redirect("login")
    
    return render(request, 'app/unit_dashboard.html', {'user': user})

def unit_dashboard(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now().date()
        username = request.session.get('username')
        users = AccountDetails.objects.filter(user=username).first()
        unit = users.unit
        forwarded_clients = DivisionLog.objects.filter(action_type='forwarded', date__date=today, unit=unit)

        forwarded_client_count = []
        for f_client in forwarded_clients:
            forwarded_client_count.append({
                'client_id': f_client.client_id.id,
                'client_queue_no': f_client.client_id.client_queue_no,
                'client_fullname': f_client.client_id.client_fullname,
                'client_lane_type': f_client.client_id.client_lane_type,
                'transaction_details': f_client.transaction_details,
                'client_gender': f_client.client_id.client_gender,
                'client_transaction_type': f_client.client_id.client_transaction_type,
                'date_resolved': f_client.date_resolved.isoformat() if f_client.date_resolved else None,
            })
        return JsonResponse({'forwarded_clients': forwarded_client_count})


def resolved_clients(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now().date()
        username = request.session.get('username')
        user = AccountDetails.objects.filter(user=username).first()
        unit = user.unit
        units = user.position
        resolved_clients = DivisionLog.objects.filter(action_type='resolved', date_resolved__date=today, unit=unit)
        
        serialized_clients = []
        for client in resolved_clients:
            serialized_clients.append({
                'client_id__client_queue_no': client.client_id.client_queue_no,
                'client_id__client_fullname': client.client_id.client_fullname,
                'client_id__client_gender': client.client_id.client_gender,
                'client_id__client_lane_type': client.client_id.client_lane_type,
                'remarks': client.remarks,
                'form': client.form,
                'unit_user': client.unit_user,
                'date_resolved': client.date_resolved.isoformat() if client.date_resolved else None,
            })
        
        return JsonResponse({'resolved_clients': serialized_clients})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)
    
# pacd_dashboard - pending clients fixed PACD dashboard only
def pending_clients(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now().date()
        username = request.session.get('username')
        user = AccountDetails.objects.filter(user=username).first()
        pending_clients = ClientDetails.objects.filter(client_status='Pending', client_created_date__date=today)[:3]
        pending_clients_count = []
        for client in pending_clients:
            pending_clients_count.append({
                'client_id': client.id,
                'client_queue_no': client.client_queue_no,
                'client_fullname': client.client_fullname,
                'client_lane_type': client.client_lane_type,
                'client_transaction_type': client.client_transaction_type,
                'client_status': client.client_status,
                'client_contact': client.client_contact,
                'client_gender': client.client_gender,
                'client_created_date': client.client_created_date.isoformat() if client.client_created_date else None,
            })

        return JsonResponse({'pending_clients': pending_clients_count})
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

# ----- FIXED AREA -----
@csrf_exempt
def update_division_log(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        client_id = request.POST.get('client_id')
        remarks = request.POST.get('remarks')
        resolution = request.POST.get('resolution')
        today = timezone.now()

        try:
            division_log = DivisionLog.objects.get(client_id=client_id)
            division_log.action_type = 'resolved'
            division_log.status = 'Done'
            division_log.remarks = remarks
            division_log.form = resolution
            division_log.unit_user = request.session.get('username')
            division_log.date_resolved = today
            division_log.save()
            return JsonResponse({'message': 'DivisionLog updated successfully'})

        except DivisionLog.DoesNotExist:
            print("DivisionLog not found for client_id:", client_id)
            return JsonResponse({'message': 'DivisionLog not found'}, status=404)
        except Exception as e:
            print("Unexpected error:", str(e))
            return JsonResponse({'message': str(e)}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)

# ----- FIXED AREA -----
@csrf_exempt
def update_client_status_served(request):
        if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            client_id = request.POST.get('client_id')
            client_status = request.POST.get('client_status')

            try:
                client = ClientDetails.objects.get(pk=client_id)
                client.client_status = client_status
                client.save()
                return JsonResponse({'message': 'Client status updated to Served'})

            except ClientDetails.DoesNotExist:
                return JsonResponse({'message': 'Client not found'}, status=404)
            except Exception as e:
                print(f"Error in update_client_status_served: {e}")  # Log the error
                return JsonResponse({'message': 'Internal Server Error'}, status=500)

        else:
            return JsonResponse({'message': 'Invalid request'}, status=400)
        
# forwarded client to the unit - fixed
def update_client_status_forwarded(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            print('test')
            client_id = request.POST.get('client_id')
            division = request.POST.get('division')
            action_type = request.POST.get('action_type')
            unit = request.POST.get('unit')
            transaction_details = request.POST.get('transaction_details')
            username = request.session.get('username')
            today = timezone.now().date()

            client = ClientDetails.objects.get(id=client_id)
            client.client_status = 'Forwarded'
            client.save()

            DivisionLog.objects.create(
                client_id_id=client_id,
                action_type = action_type,
                division=division,
                unit=unit,
                transaction_details=transaction_details,
                user=username,
                date=today
            )

            return JsonResponse({'message': 'Client forwarded successfully!', 'client_queue_no': client.client_queue_no})

        except ClientDetails.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
            print(f"Error in update_client_status_forwarded: {e}")
            return JsonResponse({'message': 'Internal Server Error'}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)