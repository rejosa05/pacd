from app.models import ActivityLog

def log_activity(
    user,
    action,
    module,
    description="",
    client=None,
    transaction=None,
    ip_address=None,
):
    return ActivityLog.objects.create(
        user=user,
        action=action,
        module=module,
        description=description,
        client=client,
        transaction=transaction,
        ip_address=ip_address,
    )
