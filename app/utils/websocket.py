from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_queue_update(client):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        "queue",
        {
            "type": "queue_update",
            "data": {
                "name": f"{client.client_firstname} {client.client_lastname}",
                "queue_no": client.client_queue_no,
                "lane": client.cliencht_lane_type,
            }
        }
    )