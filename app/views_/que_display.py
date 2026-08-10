from django.http import JsonResponse
from django.shortcuts import render
from ..models import ClientDetails
from django.utils import timezone


def que_display_page(request):
    return render(request, "pages/que_display.html")


def display_queue_api(request):

    today = timezone.now().date()

    # Get ONLY today's Waiting clients
    clients = ClientDetails.objects.filter(
        client_status="Waiting", date_created__date=today
    ).order_by("date_created")

    priority = []
    regular = []

    for client in clients:

        queue_code = (
            f"P-{client.client_queue_no:03d}"
            if client.client_lane_type == "Priority"
            else f"R-{client.client_queue_no:03d}"
        )

        if client.client_lane_type == "Priority":
            priority.append(queue_code)

        elif client.client_lane_type == "Regular":
            regular.append(queue_code)

    return JsonResponse(
        {
            "priority": priority,
            "regular": regular,
        }
    )
