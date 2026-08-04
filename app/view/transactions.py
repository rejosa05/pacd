from django.contrib.auth.decorators import login_required
from ..models import AccountDetails
from ..utils.utils import *
from ..querries.fetchStatistics_ import *
from django.utils import timezone
from django.http import JsonResponse

def f_transactions(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        username = request.session.get('username')
        user = username
        account = AccountDetails.objects.filter(user__username=username).first() if username else None
        accUnit = account.unit.name if account and getattr(account.unit, 'name', None) else (str(account.unit) if account else '')
        accDiv = account.division.name if account and account.division else ''

        if not account:
            return JsonResponse({'message':'User not Found'}, status=404)
        
        transactionHistory  = transaction_history(today, accUnit)
        pendingTransaction = pending_transaction(today, accUnit)
        servingClientUnit = serving_client_unit_list(today, accUnit, account)
        total = transaction_status(today, accUnit)
        getServices = get_srvc_div(accDiv, accUnit)
        
        return JsonResponse({
            'pending_clients': pendingTransaction,
            'total':total, 
            'account': account.unit,
            'transactionHistory': transactionHistory,
            'servingClient' : servingClientUnit,
            'getServices' : getServices,
            })
        
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)