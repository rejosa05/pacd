from django.utils import timezone
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from ..models import ClientDetails
from ..utils.utils import *    
    
def ticket_view(request, client_id):
    client = get_object_or_404(ClientDetails, id=client_id)
    return render(request, 'app/pages/queue.html', {'client': client})

def que_view(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()

        regular_lane = ClientDetails.objects.filter(
            client_lane_type='Regular',
            client_status='Waiting',
            date_created__date=today
        ).order_by('client_queue_no').first()

        priority_lane = ClientDetails.objects.filter(
            client_lane_type='Priority',
            client_status='Waiting',
            date_created__date=today
        ).order_by('client_queue_no').first()

        return JsonResponse({
            'regular_lane': { 'client_queue_no': f"CLIENT: {str(regular_lane.client_queue_no).zfill(2)}" if regular_lane else "00"},
            'priority_lane': {'client_queue_no': f"CLIENT: {str(priority_lane.client_queue_no).zfill(2)}" if priority_lane else "00"},
        })
    
def serving_client(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now().date()

        serving_clients = []
        
        serving = DivisionLog.objects.filter(date__date=today, status='Serving').order_by('-date')

        for client in serving:
            serving_clients.append({
                'id': client.id,
                'client_id': client.client_id.id,
                'client_queue_no': str(client.client_id.client_queue_no).zfill(2),
                'client_division': client.division,
                'client_unit': client.unit,
            })

        print (serving_clients)

        return JsonResponse({'serving_clients': serving_clients})
