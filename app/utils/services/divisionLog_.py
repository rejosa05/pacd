from django.http import JsoResponse
from ...models import DivisionLog
from django.utils import timezone

def create_division_log():
    today = timezone.now()

    divisionLog = division_log = DivisionLog.objects.create(
                client_id_id = client_id,
                pacd_officer_id_id = account.id,
                process_owner_id_id = account.id,
                service_id_id = srvcA,
                transaction_no = f"TR-{account.divisions}-{account.unit}-{today.strftime('%Y')}{client_id}",
                action_type = action_type,
                transaction_type = type,
                division = account.divisions,
                unit = account.unit,
                transaction_details=transaction_details,
                remarks = remarks,
                form = resolutions,
                date_resolved = today,
                status = status,
                date=today,
                deficiencies = deficienciesValue,
                cc_cover = cc_cover,
                requirements_met =  requirements_met,
                request_catered = request_processed
            )

        return divisionLog