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
        accDiv = account.divisions

        if not account:
            return JsonResponse({'message':'User not Found'}, status=404)
        
        transactionHistory  = transaction_history(today, accUnit)
        pendingTransaction = pending_transaction(today, accUnit)
        servingClientUnit = serving_client_unit_list(today, user)
        total = transaction_status(today, accUnit)
        getServices = get_srvc_div(accDiv)
        
        return JsonResponse({
            'pending_clients': pendingTransaction,
            'total':total, 
            'account': account.unit,
            'transactionHistory': transactionHistory,
            'servingClient' : servingClientUnit,
            'getServices' : getServices
            })
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)
    
# def get_services_by_division(request):
#     division_name = request.GET.get('division')

#     try:
#         division = DivisionLog.objects.get(name=division_name)
#         services = ServicesDetails.objects.filter(division=division).values_list('name', flat=True)
#         return JsonResponse({'services': list(services)})
#     except DivisionLog.DoesNotExist:
#         return JsonResponse({'services': []})