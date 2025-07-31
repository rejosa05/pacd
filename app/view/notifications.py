from django.http import JsonResponse
from ..models import DivisionLog, AccountDetails
from django.utils import timezone
from ..utils.utils import notify

def notifications(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        user = request.session.get('username')
        today = timezone.now()
        
        notifications = notify(user, today)

        return JsonResponse({'notifications': notifications})


def count_type_transaction(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        type_count = {
            'Inquiry': DivisionLog.objects.filter(transaction_type='Inquiry', date__date=today).count(),
            'Request': DivisionLog.objects.filter(transaction_type='Request', date__date=today).count(),
            'Submit Documents': DivisionLog.objects.filter(transaction_type='Submit Documents', date__date=today).count(),
            'Others': DivisionLog.objects.filter(transaction_type='Others', date__date=today).count(),
            'Pending': DivisionLog.objects.filter(status='Pending', date__date=today).count(),
            'Completed': DivisionLog.objects.filter(status='Completed', date__date=today).count(),
        }

        return JsonResponse({'type_count': type_count})
