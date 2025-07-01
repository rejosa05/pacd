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
        accUnit = account.unit
        
        getClients = get_clients(accUnit)
        total = get_totals(today, accUnit)
        percentage = get_percentage(total)

        return JsonResponse({
            'total':total, 
            'percentage':percentage,
            'getClients': getClients,
            'account': account.unit
            })
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
    
    