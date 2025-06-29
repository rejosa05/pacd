from ..models import ClientDetails, DivisionLog, AccountDetails
from ..utils.utils import *
from django.utils import timezone
from django.http import JsonResponse
from .helper import clean_text

def f_dashboard(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        user = request.session.get('username')
        account = AccountDetails.objects.filter(user=user).first()

        if not account:
            return JsonResponse({'message':'User not Found'}, status=404)
        
        pending_clients_count = []
        
        if account.unit == 'PACD':
            pending_clients = ClientDetails.objects.filter(client_status='Pending', client_created_date__date=today)
            for client in pending_clients:
                pending_clients_count.append({
                    'client_id': client.id,
                    'client_queue_no': client.client_queue_no,
                    'client_fullname': client.client_firstname + ' ' + client.client_lastname,
                    'client_lane_type': client.client_lane_type,
                    'client_transaction_type': 'Screening',
                    'client_status': client.client_status,
                    'client_gender': client.client_gender,
                })

            total = get_pacd_totals(today)
            percentage = get_percentage(total)

        else:
            pending_clients = DivisionLog.objects.filter(unit=account.unit, status='Processing', date__date=today)
            for client in pending_clients:
                pending_clients_count.append({
                    'client_id': client.client_id.id,
                    'client_queue_no': client.client_id.client_queue_no,
                    'client_fullname': client.client_id.client_firstname + ' ' + client.client_id.client_lastname,
                    'client_lane_type': client.client_id.client_lane_type,
                    'client_transaction_type': client.transaction_type,
                    'client_status': client.status
                })
            
            total = {
                'totalTransaction': DivisionLog.objects.filter(unit=account.unit, date__date=today).count(),
                'totalCompleted': DivisionLog.objects.filter(unit=account.unit, status='Completed', date__date=today).count(),
                'totalSkipped': DivisionLog.objects.filter(unit=account.unit, status='Skipped', date__date=today).count()
            }
        
        
        return JsonResponse({'pending_clients': pending_clients_count, 'total':total, 'percentage':percentage})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)

def transaction_history(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        resolved_clients = DivisionLog.objects.filter(date__date=today).order_by('-status', '-date')
        
        resolved_client_all = []
        for client in resolved_clients:
            resolved_client_all.append({
                'id': client.id,
                'client_id': client.client_id.id,
                'client_queue_no': client.client_id.client_queue_no,
                'client_fullname': client.client_id.client_firstname + ' ' + client.client_id.client_lastname,
                'client_division': client.division,
                'client_unit': client.unit,
                'action_type': client.action_type,
                'status': client.status,
            })

        return JsonResponse({'resolved_clients': resolved_client_all})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)
    
    