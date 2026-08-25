from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from ..decorators import format_contact_number
from django.utils import timezone

from ..models import ClientDetails


def client_register_page(request):
    return render(request, "pages/client_kiosk.html")


@require_POST
def register_client(request):
    first_name = request.POST.get("first_name", "").strip()
    last_name = request.POST.get("last_name", "").strip()
    contact_number = request.POST.get("contact_number", "").strip()
    address = request.POST.get("address", "").strip()
    sex = request.POST.get("sex", "").strip()
    lane = request.POST.get("lane", "").strip()
    org = request.POST.get("client_org", "").strip()

    normalized_sex = {
        "male": "Male",
        "female": "Female",
    }.get(sex.lower(), sex.title())

    normalized_lane = {
        "priority": "Priority",
        "regular": "Regular",
    }.get(lane.lower(), lane.title())

    first_name = " ".join(first_name.split()).title()
    last_name = " ".join(last_name.split()).title()
    address = " ".join(address.split()).title()

    try:
        client = ClientDetails.objects.create(
            client_firstname=first_name,
            client_lastname=last_name,
            client_contact=format_contact_number(contact_number),
            client_address=address,
            client_gender=normalized_sex,
            client_lane_type=normalized_lane,
            client_org=org,
            client_status="Waiting",
        )

        if normalized_lane == "Priority":
            queue_number = f"P-{client.client_queue_no:03d}"
        else:
            queue_number = f"R-{client.client_queue_no:03d}"

        # =========================
        # SEND CHANNELS EVENT
        # =========================
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "queue_display",
            {
                "type": "queue_update",
                "event": "CLIENT_REGISTERED",
                "queue_number": queue_number,
                "lane": normalized_lane,
                "status": client.client_status,
                "client": {
                    "id": client.id,
                    "queue_no": queue_number,
                    "full_name": (
                        f"{client.client_firstname} " f"{client.client_lastname}"
                    ),
                    "contact_number": client.client_contact,
                    "lane": normalized_lane,
                    "status": client.client_status,
                    "organization": client.client_org,
                    "transaction_type": "---",
                },
            },
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Malampuson nga na-register.",
                "data": {
                    "queue_code": queue_number,
                    "queue_no": client.client_queue_no,
                    "lane_type": client.client_lane_type,
                    "full_name": f"{client.client_firstname} "
                    f"{client.client_lastname}",
                    "date_created": timezone.localtime(client.date_created).strftime(
                        "%B %d, %Y %I:%M %p"
                    ),
                },
            }
        )

    except Exception as e:

        return JsonResponse({"success": False, "error": str(e)}, status=500)
