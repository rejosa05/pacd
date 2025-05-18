from django.http import JsonResponse
from ..models import ClientDetails
from django.utils import timezone

def notifications_pacd(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()
        notifications = ClientDetails.objects.filter(client_status='Pending', client_created_date__date=today).count()

        print(1)

        return JsonResponse({'notifications': notifications})