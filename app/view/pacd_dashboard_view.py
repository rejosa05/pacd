from django.contrib.auth.decorators import login_required
from ..models import ClientDetails, DivisionLog
from django.utils import timezone
from django.http import JsonResponse
from .helper import clean_text

def pending_clients(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
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
    
def forwarded_clients(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        forwarded_clients = DivisionLog.objects.filter(action_type='forwarded', date__date=today)

        forwarded_client_count = []
        for f_client in forwarded_clients:
            forwarded_client_count.append({
                'client_transaction_details': clean_text(f_client.transaction_details),
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

def resolved_client(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        resolved_clients = DivisionLog.objects.filter(action_type='resolved', date_resolved__date=today)
        
        resolved_client_all = []
        for client in resolved_clients:
            resolved_client_all.append({
                'client_id': client.client_id.id,
                'client_queue_no': client.client_id.client_queue_no,
                'client_fullname': client.client_id.client_fullname,
                'client_gender': client.client_id.client_gender,
                'client_lane_type': client.client_id.client_lane_type,
                'client_transaction_type': client.client_id.client_transaction_type,
                'remarks': client.remarks,
                'form': client.form,
                'unit_user': client.unit_user,
                'action_type': client.action_type,
                'status': client.status,
                'date_resolved': client.date_resolved.isoformat() if client.date_resolved else None,
            })
        return JsonResponse({'resolved_clients': resolved_client_all})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)