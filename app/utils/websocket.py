from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def send_queue_update(client):
    channel_layer = get_channel_layer()

    if channel_layer is None:
        return

    async_to_sync(channel_layer.group_send)(
        "queue",
        {
            "type": "queue_update",
            "data": {
                "id": client.id,
                "name": f"{client.client_firstname} {client.client_lastname}",
                "queue_no": client.client_queue_no,
                "lane": client.client_lane_type,
                "contact": client.client_contact,
                "status": client.client_status,
                "date_created": client.date_created.isoformat() if client.date_created else None,
            }
        }
    )