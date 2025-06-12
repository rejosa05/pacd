from django.http import JsonResponse
from ..models import  DivisionLog
from django.utils import timezone

def transaction_history_all(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        resolved_clients = DivisionLog.objects.filter().order_by('-status', 'date_resolved')
        
        resolved_client_all = []
        for client in resolved_clients:
            resolved_client_all.append({
                'id': client.id,
                'client_id': client.client_id.id,
                'client_fullname': client.client_id.client_firstname + ' ' + client.client_id.client_lastname,
                'client_lane_type': client.client_id.client_lane_type,
                'client_transaction_type': client.transaction_type,
                'client_division': client.division,
                'client_unit': client.unit,
                'remarks': client.remarks,
                'date_served': client.date.isoformat() if client.date else None,
                'status': client.status,
            })

        return JsonResponse({'resolved_clients': resolved_client_all})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)


def total_counts(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        total = {
            'Total': DivisionLog.objects.filter().count(),
            'Completed': DivisionLog.objects.filter(status='Completed').count(),
            'CSM': DivisionLog.objects.filter(form='CSM').count(),
            'CSS': DivisionLog.objects.filter(form='CSS').count(),
        }

        return JsonResponse({'total': total})
