import json
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from ..decorators import role_required

from ..models import (
    ClientDetails,
    TransactionLog,
    AccountDetails,
    Division,
    Unit,
    ServicesDetails,
)


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
    profile = request.user.account_profile

    clients = ClientDetails.objects.filter(date_created__date=today).order_by(
        "-client_queue_no", "client_lane_type", "date_created"
    )

    transactions = TransactionLog.objects.select_related(
        "forwarded_unit",
        "forwarded_division",
        "client",
        "process_owner",
    ).filter(created_at__date=today)

    if profile.role.lower() == "staff":

        transactions = transactions.filter(
            forwarded_division=profile.division,
            forwarded_unit=profile.unit,
        )

        client_ids = transactions.values_list("client_id", flat=True)

        clients = clients.filter(id__in=client_ids)
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
                "transaction_id": transaction.id,
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
                "process_owner": (
                    transaction.process_owner.username
                    if transaction.process_owner
                    else ""
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

    profile = request.user.account_profile
    role = profile.role.lower()

    # Only Sub-admin / Super Admin
    if role not in [
        "sub-admin",
        "sub_admin",
        "super-admin",
        "super_admin",
    ]:
        return JsonResponse(
            {
                "success": False,
                "error": "You are not authorized to create a transaction.",
            },
            status=403,
        )

    # =====================================================
    # CLIENT
    # =====================================================

    try:
        client = ClientDetails.objects.get(pk=client_id)

    except ClientDetails.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Client not found."}, status=404
        )

    # =====================================================
    # PAYLOAD
    # =====================================================

    payload, error = _parse_json(request)

    if error:
        return error

    transaction_type = payload.get("transaction_type")

    if not transaction_type:
        return JsonResponse(
            {"success": False, "error": "Please select a transaction type."}, status=400
        )

    # =====================================================
    # SERVICE
    # =====================================================

    service_id = payload.get("service")

    service = None

    if service_id:

        service = ServicesDetails.objects.filter(
            id=service_id,
            division=profile.division,
            unit=profile.unit,
        ).first()

        if not service:
            return JsonResponse(
                {
                    "success": False,
                    "error": (
                        "This service is not available " "for your division/unit."
                    ),
                },
                status=403,
            )

    # =====================================================
    # RESOLVED
    # =====================================================

    resolved = payload.get("resolved")

    # =====================================================
    # CSM / CSS
    # =====================================================

    if resolved == "Yes":

        survey_form = "CSM" if service else "CSS"

    elif resolved == "No":

        survey_form = "CSS"

    else:

        survey_form = None

    # =====================================================
    # CREATE TRANSACTION
    # =====================================================

    transaction = TransactionLog.objects.create(
        client=client,
        action="Served",
        details=payload.get("description"),
        transaction_type=transaction_type,
        citizen_charter=payload.get("citizen_charter"),
        service=service,
        has_deficiency=payload.get("has_deficiency"),
        deficiency_details=payload.get("deficiency_details"),
        deficiency_status=payload.get("deficiency_status"),
        resolved=resolved,
        survey_form=survey_form,
        process_owner=request.user,
    )

    # =====================================================
    # CLIENT STATUS
    # =====================================================

    client.client_status = "Approved" if resolved == "Yes" else "Serving"

    client.save(update_fields=["client_status"])

    return JsonResponse(
        {
            "success": True,
            "message": "Transaction served successfully.",
            "transaction": {
                "id": transaction.id,
                "transaction_type": transaction.transaction_type,
                "service": (
                    transaction.service.service_name if transaction.service else None
                ),
                "survey_form": transaction.survey_form,
            },
        }
    )


@login_required
@require_http_methods(["POST"])
def serve_transaction(request, transaction_id):

    profile = request.user.account_profile

    # =====================================================
    # ONLY STAFF
    # =====================================================

    if profile.role.lower() != "staff":
        return JsonResponse(
            {"success": False, "error": "Only staff can serve forwarded transactions."},
            status=403,
        )

    # =====================================================
    # GET TRANSACTION
    # =====================================================

    try:

        transaction = TransactionLog.objects.select_related(
            "client",
            "service",
            "forwarded_division",
            "forwarded_unit",
        ).get(pk=transaction_id)

    except TransactionLog.DoesNotExist:

        return JsonResponse(
            {"success": False, "error": "Transaction not found."}, status=404
        )

    # =====================================================
    # CHECK STAFF ACCESS
    # =====================================================

    if (
        transaction.forwarded_division_id != profile.division_id
        or transaction.forwarded_unit_id != profile.unit_id
    ):

        return JsonResponse(
            {
                "success": False,
                "error": ("This transaction is not assigned " "to your division/unit."),
            },
            status=403,
        )

    # =====================================================
    # CHECK ALREADY SERVED
    # =====================================================

    if transaction.action == "Served":

        return JsonResponse(
            {"success": False, "error": ("This transaction has already been served.")},
            status=400,
        )

    # =====================================================
    # PAYLOAD
    # =====================================================

    payload, error = _parse_json(request)

    if error:
        return error

    # =====================================================
    # SERVICE
    # =====================================================

    service_id = payload.get("service")

    service = None

    if service_id:

        service = ServicesDetails.objects.filter(
            id=service_id,
            division=profile.division,
            unit=profile.unit,
        ).first()

        if not service:

            return JsonResponse(
                {
                    "success": False,
                    "error": (
                        "This service is not available " "for your division/unit."
                    ),
                },
                status=403,
            )

    # =====================================================
    # RESOLVED
    # =====================================================

    resolved = payload.get("resolved")

    # =====================================================
    # CSM / CSS
    # =====================================================

    if resolved == "Yes":

        survey_form = "CSM" if service else "CSS"

    elif resolved == "No":

        survey_form = "CSS"

    else:

        survey_form = None

    # =====================================================
    # UPDATE EXISTING TRANSACTION
    # =====================================================

    transaction.action = "Served"

    transaction.details = payload.get("description")

    # IMPORTANT:
    # transaction_type is NOT changed.
    #
    # It remains the value assigned by Sub-admin.

    transaction.citizen_charter = payload.get("citizen_charter")

    transaction.service = service

    transaction.has_deficiency = payload.get("has_deficiency")

    transaction.deficiency_details = payload.get("deficiency_details")

    transaction.deficiency_status = payload.get("deficiency_status")

    transaction.resolved = resolved

    transaction.survey_form = survey_form

    transaction.process_owner = request.user

    transaction.save()

    # =====================================================
    # CLIENT STATUS
    # =====================================================

    client = transaction.client

    client.client_status = "Approved" if resolved == "Yes" else "Serving"

    client.save(update_fields=["client_status"])

    # =====================================================
    # RESPONSE
    # =====================================================

    return JsonResponse(
        {
            "success": True,
            "message": "Transaction updated and served.",
            "transaction": {
                "id": transaction.id,
                "transaction_type": transaction.transaction_type,
                "service": (
                    transaction.service.service_name if transaction.service else None
                ),
                "survey_form": transaction.survey_form,
            },
        }
    )


# ============================================================
# FORWARD  -> writes to TransactionLog ----- Fixed
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
        details=details,
        transaction_type=type,
        forwarded_division_id=division_id,
        forwarded_unit_id=unit_id,
        # process_owner=request.user,
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
        process_owner=request.user,
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


@login_required
def available_services_api(request):
    profile = request.user.account_profile
    print(profile)
    services = ServicesDetails.objects.filter(
        division=profile.division,
        unit=profile.unit,
    ).order_by("service_name")

    data = [
        {
            "id": service.id,
            "name": service.service_name,
        }
        for service in services
    ]

    return JsonResponse(
        {
            "success": True,
            "services": data,
        }
    )
