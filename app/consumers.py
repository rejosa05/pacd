import json
from channels.generic.websocket import AsyncWebsocketConsumer


class UserManagementConsumer(AsyncWebsocketConsumer):
    """
    Naga-broadcast sa real-time updates (add/edit/delete/status-toggle)
    sa tanan naka-open nga User Management page. Kung naay pagbag-o sa
    usa ka user (bisan kinsa ang nag-himo), ma-notify ang tanan connected
    clients para mag-refresh sa ilang table — walay page reload.
    """

    GROUP_NAME = "user_management"

    async def connect(self):
        user = self.scope.get("user")

        if user is None or not user.is_authenticated:
            await self.close()
            return

        await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.GROUP_NAME, self.channel_name)

    async def user_list_changed(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "action": event.get("action", "changed"),
                    "actor": event.get("actor", ""),
                    "profile_id": event.get("profile_id"),
                }
            )
        )

class QueueConsumer(AsyncWebsocketConsumer):

    GROUP_NAME = "queue_display"

    async def connect(self):

        # Join the common queue group
        await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)

        await self.accept()

        print("✅ WebSocket connected:", self.channel_name)

    async def disconnect(self, close_code):

        # Leave the common queue group
        await self.channel_layer.group_discard(self.GROUP_NAME, self.channel_name)

        print("❌ WebSocket disconnected:", self.channel_name)

    async def queue_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "event": event.get("event"),
                }
            )
        )

        await self.send(
            text_data=json.dumps(
                {
                    "event": event.get("event"),
                    "queue_number": event.get("queue_number"),
                    "lane": event.get("lane"),
                    "status": event.get("status"),
                    "client": event.get("client"),
                }
            )
        )
