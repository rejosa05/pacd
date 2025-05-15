from django.shortcuts import redirect
from ..models import AccountDetails, DivisionLog
from django.utils import timezone
from django.http import JsonResponse
from .helper import clean_text

def user_type(request):
    username = request.session.get('username')

    if not username:
        return redirect("login")
    
    user = AccountDetails.objects.filter(user=username).first()

    if user.unit == 'PACD':
        return redirect('pacd_dashboard')
    else:
        return redirect('unit_dashboards')

def pacd_unit_dashboard(request):
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