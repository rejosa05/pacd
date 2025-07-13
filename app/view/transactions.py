from django.contrib.auth.decorators import login_required
from ..models import ClientDetails, DivisionLog, AccountDetails
from ..utils.utils import *
from django.utils import timezone
from django.http import JsonResponse
from .helper import clean_text

def f_transactions(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        user = request.session.get('username')
        account = AccountDetails.objects.filter(user=user).first()
        accUnit = account.unit

        if not account:
            return JsonResponse({'message':'User not Found'}, status=404)
        
        transactionHistory  = transaction_history(today, accUnit)
        
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
                    'date_created': client.client_created_date.isoformat() if client.client_created_date else None,
                })

            total = {
                'totalTransaction': DivisionLog.objects.filter(date__date=today).count(),
                'totalCompleted': DivisionLog.objects.filter(status='Completed', date__date=today).count(),
                'totalSkipped': DivisionLog.objects.filter(status='Skipped', date__date=today).count()
            }

        else:
            pending_clients = DivisionLog.objects.filter(unit=account.unit, status='Processing', date__date=today)
            for client in pending_clients:
                pending_clients_count.append({
                    'id': client.id,
                    'client_id': client.client_id.id,
                    'client_queue_no': client.client_id.client_queue_no,
                    'client_fullname': client.client_id.client_firstname + ' ' + client.client_id.client_lastname,
                    'client_lane_type': client.client_id.client_lane_type,
                    'client_transaction_type': client.transaction_type,
                    'client_transaction_details': client.transaction_details,
                    'client_status': client.status,
                    'date_created': client.date.isoformat() if client.date else None,
                })
            
            total = {
                'totalTransaction': DivisionLog.objects.filter(unit=account.unit, date__date=today).count(),
                'totalCompleted': DivisionLog.objects.filter(unit=account.unit, status='Completed', date__date=today).count(),
                'totalSkipped': DivisionLog.objects.filter(unit=account.unit, status='Skipped', date__date=today).count()
            }
        
        
        return JsonResponse({
            'pending_clients': pending_clients_count,
            'total':total, 
            'account': account.unit,
            'transactionHistory': transactionHistory
            })
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)