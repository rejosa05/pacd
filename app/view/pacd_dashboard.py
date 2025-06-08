from django.http import JsonResponse
from ..models import  DivisionLog
from django.utils import timezone

def transaction_history_all(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        resolved_clients = DivisionLog.objects.filter().order_by('status', 'date_resolved')
        
        resolved_client_all = []
        for client in resolved_clients:
            resolved_client_all.append({
                'id': client.id,
                'client_id': client.client_id.id,
                'client_queue_no': client.client_id.client_queue_no,
                'client_fullname': client.client_id.client_fullname,
                'client_lane_type': client.client_id.client_lane_type,
                'client_transaction_type': client.client_id.client_transaction_type,
                'client_division': client.division,
                'client_unit': client.unit,
                'remarks': client.remarks,
                'form': client.form,
                'user': client.user,
                'action_type': client.action_type,
                'date_served': client.date.isoformat() if client.date else None,
                'status': client.status,
            })

        return JsonResponse({'resolved_clients': resolved_client_all})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)