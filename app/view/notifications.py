from django.http import JsonResponse
from ..models import ClientDetails, DivisionLog, AccountDetails
from django.utils import timezone

def notifications_pacd(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        notifications = ClientDetails.objects.filter(client_status='Pending', client_created_date__date=today).count()

        return JsonResponse({'notifications': notifications})
    
def notifications_unit(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        user = request.session.get('username')
        today = timezone.now()

        unit = AccountDetails.objects.filter(user=user).first()
        unit = unit.unit
        notifications = DivisionLog.objects.filter(action_type='forwarded', unit=unit, date__date=today).count()

        return JsonResponse({'notifications': notifications})

def count_type_transaction(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        type_count = {
            'Inquiry': ClientDetails.objects.filter(client_transaction_type='Inquiry', client_created_date__date=today).count(),
            'Request': ClientDetails.objects.filter(client_transaction_type='Request', client_created_date__date=today).count(),
            'Submit Documents': ClientDetails.objects.filter(client_transaction_type='Submit Documents', client_created_date=today).count(),
            'Others': ClientDetails.objects.filter(client_transaction_type='Others', client_created_date=today).count(),
            'Pending': DivisionLog.objects.filter(status='Pending', date__date=today).count(),
            'Completed': DivisionLog.objects.filter(status='Completed', date__date=today).count(),
        }

        return JsonResponse({'type_count': type_count})
