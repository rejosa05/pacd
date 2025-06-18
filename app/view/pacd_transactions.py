from django.contrib.auth.decorators import login_required
from ..models import ClientDetails, DivisionLog
from django.utils import timezone
from django.http import JsonResponse
from .helper import clean_text

def pending_clients(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        pending_clients = ClientDetails.objects.filter(client_status='Pending', client_created_date__date=today)
        pending_clients_count = []
        for client in pending_clients:
            pending_clients_count.append({
                'client_id': client.id,
                'client_queue_no': client.client_queue_no,
                'client_fullname': client.client_firstname + ' ' + client.client_lastname,
                'client_lane_type': client.client_lane_type,
                'client_status': client.client_status,
                'client_gender': client.client_gender,
                'client_created_date': client.client_created_date.isoformat() if client.client_created_date else None,
            })

        return JsonResponse({'pending_clients': pending_clients_count})
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
    