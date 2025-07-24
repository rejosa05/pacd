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
        pendingTransaction = pending_transaction(today, accUnit)
        servingClient = serving_client(today, user)
        total = transaction_status(today, accUnit)
             
        return JsonResponse({
            'pending_clients': pendingTransaction,
            'total':total, 
            'account': account.unit,
            'transactionHistory': transactionHistory,
            'servingClient' : servingClient
            })
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)