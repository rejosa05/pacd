import json
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils import timezone

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from ..models import ClientDetails


@login_required
def client_transaction_page(request):
    """Ipakita ang HTML page — ang data mismo kuhaon sa JS via Fetch API."""
    return render(request, "pages/client_transaction.html")


def clients_list_api(request):
    """
    Return today's clients for the dashboard table.
    """
    today = timezone.localdate()
    clients = ClientDetails.objects.filter(date_created__date=today).order_by("-date_created")

    client_data = []

    for client in clients:

        # Queue display number
        if client.client_lane_type == "Priority":
            queue_number = f"P-{client.client_queue_no:03d}"
        else:
            queue_number = f"R-{client.client_queue_no:03d}"

        client_data.append(
            {
                "id": client.id,
                "queue_no": queue_number,
                "full_name": ( f"{client.client_firstname} " f"{client.client_lastname}").strip(),
                "contact_number": client.client_contact or "",
                "lane": client.client_lane_type or "Regular",
                "status": client.client_status or "Waiting",
                "organization": client.client_org or "",
                "address": client.client_address or "",
                "gender": client.client_gender or "",
                "date_created": client.date_created.strftime("%Y-%m-%d %I:%M %p"),
            }
        )
    return JsonResponse({"success": True, "clients": client_data})

