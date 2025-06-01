from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib import messages
from .models import ClientDetails, AccountDetails, DivisionLog
from .forms import ClientDetailsForm, AuthorizedPersonnelForm
from django.utils import timezone


    

# ----- FIXED AREA -----

        
# forwarded client to the unit - fixed

    
# fetch all data of resolved client -- per unit


def accountList(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        account = AccountDetails.objects.filter().order_by('-date_created')  # Optional: order by latest

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

def reports(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if user.unit == 'PACD':
        return redirect('pacd_dashboard')
    else:
        return redirect('unit_dashboards')

def reports_pacd(request):
    username = request.session.get('username')
    user = AccountDetails.objects.filter(user=username).first()

    if not username:
        return redirect("login")
    
    today = timezone.now()

    # Fetch the division count data (you may adjust the model and field names)
    division_counts = {
        'MSD': DivisionLog.objects.filter(division='MSD').count(),
        'ARD': DivisionLog.objects.filter(division='ARD').count(),
        'RLED': DivisionLog.objects.filter(division='RLED').count(),
        'LHSD': DivisionLog.objects.filter(division='LHSD').count(),
    }

    return render(request, 'app/reports.html', {
        'division_counts': division_counts,
        'user': user
    })

def transactionsTotal(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        resolved_clients = DivisionLog.objects.filter().order_by('-date_resolved')  # Optional: order by latest

        resolved_client_all = [
            {
                'client_id': client.client_id.id,
                'client_queue_no': client.client_id.client_queue_no,
                'client_fullname': client.client_id.client_fullname,
                'client_gender': client.client_id.client_gender,
                'client_lane_type': client.client_id.client_lane_type,
                'divisions': client.division,
                'unit': client.unit,
                'remarks': client.remarks,
                'form': client.form,
                'unit_user': str(client.unit_user),
                'action_type': client.action_type,
                'status': client.status,
                'date_resolved': client.date_resolved.isoformat() if client.date_resolved else None,
            }
            for client in resolved_clients
        ]
        return JsonResponse({'resolved_clients': resolved_client_all})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)
    
# edit functions update the forwarded unit
def  save_update_forwarded_client(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            client_id = request.POST.get('client_id')
            division = request.POST.get('division')
            unit = request.POST.get('unit')
            transaction_details = request.POST.get('transaction_details')
            today = timezone.now()

            client = DivisionLog.objects.get(client_id_id=client_id)
            client.division = division
            client.unit = unit
            client.transaction_details = transaction_details
            client.date = today
            client.save()

            print(client.client_id_id)
            return JsonResponse({'message': 'UPDATE successfully!'})

        except DivisionLog.DoesNotExist:
            return JsonResponse({'message': 'Client not found'}, status=404)
        except Exception as e:
            print(f"Error in update_client_status_forwarded: {e}")
            return JsonResponse({'message': 'Internal Server Error'}, status=500)

    return JsonResponse({'message': 'Invalid request'}, status=400)

# skipped function if the client not be around
# edit functions for the unit  
# count the pending clients per days and user online to put on nitification bell and user
# 