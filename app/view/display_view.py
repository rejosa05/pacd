from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from ..models import ClientDetails, DivisionLog
from ..forms import ClientDetailsForm
from ..utils.utils import *

def display_view(request):
    return render(request, 'app/display.html')
    
def client_details(request):
    if request.method == 'POST':
        form = ClientDetailsForm(request.POST)
        if form.is_valid():
            client = form.save()
            return redirect('client_ticket', client_id=client.id)
    else:
         form = ClientDetailsForm()
    return render(request, 'app/client.html', {'form': form})
    
def ticket_view(request, client_id):
    client = get_object_or_404(ClientDetails, id=client_id)
    return render(request, 'app/queue.html', {'client': client})

def que_view(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now()

        regular_lane = ClientDetails.objects.filter(
            client_lane_type='Regular',
            client_status='Pending',
            client_created_date__date=today
        ).order_by('client_queue_no').first()

        priority_lane = ClientDetails.objects.filter(
            client_lane_type='Priority',
            client_status='Pending',
            client_created_date__date=today
        ).order_by('client_queue_no').first()

        return JsonResponse({
            'regular_lane': { 'client_queue_no': regular_lane.client_queue_no if regular_lane else "00"},
            'priority_lane': {'client_queue_no': priority_lane.client_queue_no if priority_lane else "00"},
        })
    
def serving_client(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        today = timezone.now().date()
        
        user = 'Sys'

        serving_clients = serving_client_unit_list(today, user = user)

        return JsonResponse({'serving_clients': serving_clients})
    else:
        return JsonResponse({'message': 'Invalid request'}, status=400)
