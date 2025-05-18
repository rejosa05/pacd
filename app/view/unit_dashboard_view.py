from django.http import JsonResponse
from ..models import AccountDetails, DivisionLog
from django.utils import timezone

def unit_pending(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
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
    
def unit_resolved_client(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        user = request.session.get('username')
        users = AccountDetails.objects.filter(user=user).first()
        today = timezone.now()
        unit = users.unit
        name = users.first_name
        resolved_clients = DivisionLog.objects.filter(action_type='resolved', date_resolved__date=today, unit=unit)
        
        resolved_client_all = []
        for client in resolved_clients:
            resolved_client_all.append({
                'client_id': client.client_id.id,
                'client_queue_no': client.client_id.client_queue_no,
                'client_fullname': client.client_id.client_fullname,
                'client_gender': client.client_id.client_gender,
                'client_lane_type': client.client_id.client_lane_type,
                'remarks': client.remarks,
                'form': client.form,
                'unit_user': client.unit_user,
                'action_type': client.action_type,
                'status': client.status,
                'unit': unit,
                'date_resolved': client.date_resolved.isoformat() if client.date_resolved else None,
            })
        return JsonResponse({'resolved_clients': resolved_client_all})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)