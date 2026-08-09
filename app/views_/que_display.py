from django.http import JsonResponse
from django.shortcuts import render
from ..models import ClientDetails
from django.utils import timezone

def que_display_page(request):
    return render(request, 'pages/que_display.html')

def display_queue_api(request):
    today = timezone.now().date()

    clients = ClientDetails.objects.filter(client_status="Waiting", date_created__date= today).order_by('date_created')


    regular = []
    priority = []

    for client in clients:

        if client.client_lane_type == "Regular":

            regular.append(
                f"R-{client.client_queue_no:03d}"
            )


        elif client.client_lane_type == "Priority":

            priority.append(
                f"P-{client.client_queue_no:03d}"
            )


    return JsonResponse({

        "regular": regular,

        "priority": priority,

    })
