import json
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from ..decorators import role_required

from ..models import ClientDetails, TransactionLog, AccountDetails, Division, Unit


@login_required
@role_required("SUPER_ADMIN", "SUB_ADMIN", "STAFF")
def client_transaction_page(request):
    """Ipakita ang HTML page — ang data mismo kuhaon sa JS via Fetch API."""

    return render(request, "pages/client_transaction.html")


@login_required
def clients_list_api(request):
    """
    Return today's clients and transactions based on user role.
    """

    today = timezone.localdate()

    # Get logged-in user's AccountDetails
    profile = request.user.account_profile

    # --------------------------------------------------
    # CLIENTS
    # --------------------------------------------------
    clients = ClientDetails.objects.filter(date_created__date=today).order_by(
        "-client_queue_no", "client_lane_type", "date_created"
    )

    # --------------------------------------------------
    # TRANSACTIONS
    # --------------------------------------------------
    transactions = TransactionLog.objects.select_related(
        "forwarded_unit",
        "forwarded_division",
        "client",
        "handled_by",
    ).filter(created_at__date=today)

    # --------------------------------------------------
    # ROLE-BASED FILTER
    # --------------------------------------------------

    if profile.role.lower() == "staff":

        transactions = transactions.filter(
            forwarded_division=profile.division,
            forwarded_unit=profile.unit,
        )

        client_ids = transactions.values_list(
            "client_id",
            flat=True
        )

        clients = clients.filter(
            id__in=client_ids
        )
    # super_admin and sub-admin
    # → no filter, therefore ALL transactions

    client_data = []
    transaction_data = []

    # --------------------------------------------------
    # CLIENT DATA
    # --------------------------------------------------

    for client in clients:

        if client.client_lane_type == "Priority":
            queue_number = f"P-{client.client_queue_no:03d}"
        else:
            queue_number = f"R-{client.client_queue_no:03d}"

        client_data.append(
            {
                "id": client.id,
                "queue_no": queue_number,
                "full_name": (
                    f"{client.client_firstname} " f"{client.client_lastname}"
                ).strip(),
                "contact_number": client.client_contact or "",
                "lane": (client.client_lane_type or "Regular"),
                "status": (client.client_status or "Waiting"),
                "organization": client.client_org or "",
                "address": client.client_address or "",
                "gender": client.client_gender or "",
                "date_created": client.date_created.strftime("%Y-%m-%d %I:%M %p"),
            }
        )

    # --------------------------------------------------
    # TRANSACTION DATA
    # --------------------------------------------------

    for transaction in transactions:

        transaction_data.append(
            {
                "id": transaction.id,
                "client_id": transaction.client_id,
                "action": transaction.action or "",
                "details": transaction.details or "",
                "type": transaction.transaction_type or "",
                "unit": (
                    transaction.forwarded_unit.name
                    if transaction.forwarded_unit
                    else ""
                ),
                "division": (
                    transaction.forwarded_division.name
                    if transaction.forwarded_division
                    else ""
                ),
                "remarks": transaction.remarks or "",
                "handled_by": (
                    transaction.handled_by.username if transaction.handled_by else ""
                ),
            }
        )

    return JsonResponse(
        {
            "success": True,
            "clients": client_data,
            "transactions": transaction_data,
        }
    )


def _serialize_profile(profile):
    lane = profile.client_lane_type

    if lane == "Priority":
        prefix = "P"
    else:
        prefix = "R"

    queue = f"{prefix}-{int(profile.client_queue_no):03d}"

    return {
        "id": profile.id,
        "queue_no": queue,
        "que": profile.client_queue_no,
        "lane": profile.client_lane_type,
        "full_name": (
            f"{profile.client_firstname} " f"{profile.client_lastname}"
        ).strip(),
        "first_name": profile.client_firstname,
        "last_name": profile.client_lastname,
        "contact": profile.client_contact,
        "address": profile.client_address,
    }


@login_required
@require_http_methods(["GET"])
def get_client(request, client_id):
    try:
        profile = ClientDetails.objects.get(pk=client_id)
        return JsonResponse({"success": True, "data": _serialize_profile(profile)})
    except ClientDetails.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Wala nakit-i ang user."}, status=404
        )


def _parse_json(request):
    """Small helper — returns (payload, error_response_or_None)."""
    try:
        return json.loads(request.body or "{}"), None
    except json.JSONDecodeError:
        return None, JsonResponse(
            {"success": False, "error": "Invalid request body."}, status=400
        )


# ============================================================
# EDIT
# ============================================================
@login_required
@require_http_methods(["POST"])
def update_client(request, client_id):
    try:
        client = ClientDetails.objects.get(pk=client_id)
    except ClientDetails.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Wala nakit-i ang client."}, status=404
        )

    payload, error = _parse_json(request)
    if error:
        return error

    client.client_firstname = payload.get("first_name", client.client_firstname)
    client.client_lastname = payload.get("last_name", client.client_lastname)
    client.client_contact = payload.get("contact", client.client_contact)
    client.client_address = payload.get("address", client.client_address)
    client.client_gender = payload.get("gender", client.client_gender)
    client.client_lane_type = payload.get("lane", client.client_lane_type)

    # only touch this field if your ClientDetails model actually has it
    if hasattr(client, "client_transaction_type") and payload.get("transaction_type"):
        client.client_transaction_type = payload.get("transaction_type")

    client.save()

    return JsonResponse({"success": True, "message": "Client updated successfully."})


# ============================================================
# SERVE  -> writes to TransactionLog
# ============================================================
@login_required
@require_http_methods(["POST"])
def serve_client(request, client_id):
    try:
        client = ClientDetails.objects.get(pk=client_id)
    except ClientDetails.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Wala nakit-i ang client."}, status=404
        )

    payload, error = _parse_json(request)
    if error:
        return error

    TransactionLog.objects.create(
        client=client,
        action="Served",
        description=payload.get("description"),
        citizen_charter=payload.get("citizen_charter"),
        service=payload.get("service"),
        has_deficiency=payload.get("has_deficiency"),
        deficiency_details=payload.get("deficiency_details"),
        resolved=payload.get("resolved"),
        csm_rating=payload.get("csm_rating"),
        deficiency_status=payload.get("deficiency_status"),
        css_rating=payload.get("css_rating"),
        handled_by=request.user,
    )

    # Reflect the outcome back on the client's live status
    client.client_status = "Approved" if payload.get("resolved") == "Yes" else "Serving"
    client.save()

    return JsonResponse({"success": True, "message": "Transaction served and logged."})


# ============================================================
# FORWARD  -> writes to TransactionLog
# ============================================================
@login_required
@require_http_methods(["POST"])
def forward_client(request, client_id):
    try:
        client = ClientDetails.objects.get(pk=client_id)
    except ClientDetails.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Wala nakit-i ang client."}, status=404
        )

    payload, error = _parse_json(request)

    if error:
        return error
    print(client.id)
    division_id = payload.get("division_id")
    unit_id = payload.get("unit_id")
    details = payload.get("details")
    type = payload.get("type")

    if not division_id or not unit_id:
        return JsonResponse(
            {"success": False, "error": "Division and unit are required."}, status=400
        )

    TransactionLog.objects.create(
        client=client,
        action="Forwarded",
        transaction_type=type,
        details=details,
        forwarded_division_id=division_id,
        forwarded_unit_id=unit_id,
        handled_by=request.user,
    )

    client.client_status = "Forwarded"
    client.save()

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        "queue_display",
        {
            "type": "queue_update",
            "event": "QUEUE_UPDATED",
            "queue_number": client.id,
        },
    )
    return JsonResponse({"success": True, "message": "Client forwarded successfully."})


# ============================================================
# SKIP  -> writes to TransactionLog
# ============================================================
@login_required
@require_http_methods(["POST"])
def skip_client(request, client_id):
    try:
        client = ClientDetails.objects.get(pk=client_id)
    except ClientDetails.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Wala nakit-i ang client."}, status=404
        )

    TransactionLog.objects.create(
        client=client,
        action="Skipped",
        handled_by=request.user,
    )

    client.client_status = "Skipped"
    client.save()

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        "queue_display",
        {
            "type": "queue_update",
            "event": "QUEUE_UPDATED",
            "queue_number": client.id,
        },
    )

    return JsonResponse({"success": True, "message": "Client marked as skipped."})


@login_required
def divisions_api(request):
    """
    Divisions that have at least one active registered account.
    Used to populate the first (Division) dropdown in the Forward modal.
    """
    division_ids = (
        AccountDetails.objects.filter(status="Active", division__isnull=False)
        .values_list("division_id", flat=True)
        .distinct()
    )

    divisions = Division.objects.filter(id__in=division_ids).order_by("name")

    data = [{"id": d.id, "name": d.name} for d in divisions]
    return JsonResponse({"success": True, "divisions": data})


@login_required
def units_api(request):
    """
    Units under a given division that have at least one active registered
    account. Used to populate the second (Unit) dropdown once a Division
    has been chosen.

    Called as: GET api/units/?division_id=<id>
    """
    division_id = request.GET.get("division_id")
    if not division_id:
        return JsonResponse(
            {"success": False, "error": "division_id is required."}, status=400
        )

    unit_ids = (
        AccountDetails.objects.filter(
            status="Active", division_id=division_id, unit__isnull=False
        )
        .values_list("unit_id", flat=True)
        .distinct()
    )

    units = Unit.objects.filter(id__in=unit_ids).order_by("name")

    data = [{"id": u.id, "name": u.name} for u in units]
    return JsonResponse({"success": True, "units": data})
