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


from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json


class QueueConsumer(AsyncWebsocketConsumer):

    GROUP_NAME = "queue_display"

    async def connect(self):

        self.user = self.scope["user"]

        await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)

        await self.accept()

        print("✅ WebSocket connected:", self.channel_name, self.user)

    async def disconnect(self, close_code):

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

        # ==========================================
        # GET USER PROFILE
        # ==========================================

        profile = await self.get_user_profile()

        if not profile:
            return

        role = (profile.role or "").lower()

        # ==========================================
        # EVENT CLIENT
        # ==========================================

        client = event.get("client")

        if not client:
            return

        # ==========================================
        # STAFF FILTER
        # ==========================================

        if role == "staff":

            forwarded_unit = event.get("forwarded_unit")
            forwarded_division = event.get("forwarded_division")

            staff_unit = profile.unit.name if profile.unit else None

            staff_division = profile.division.name if profile.division else None

            # Staff only receives matching transactions
            if forwarded_unit != staff_unit or forwarded_division != staff_division:
                print("🚫 WebSocket blocked for STAFF:", client.get("full_name"))

                return

        # ==========================================
        # SEND TO BROWSER
        # ==========================================

        await self.send(
            text_data=json.dumps(
                {
                    "event": event.get("event"),
                    "queue_number": event.get("queue_number"),
                    "lane": event.get("lane"),
                    "status": event.get("status"),
                    "client": client,
                    "forwarded_unit": event.get("forwarded_unit"),
                    "forwarded_division": event.get("forwarded_division"),
                }
            )
        )

    @database_sync_to_async
    def get_user_profile(self):

        try:
            return self.user.account_profile

        except Exception:
            return None


# class QueueConsumer(AsyncWebsocketConsumer):

#     GROUP_NAME = "queue_display"

#     async def connect(self):

#         # Join the common queue group
#         await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)

#         await self.accept()

#         print("✅ WebSocket connected:", self.channel_name)

#     async def disconnect(self, close_code):

#         # Leave the common queue group
#         await self.channel_layer.group_discard(self.GROUP_NAME, self.channel_name)

#         print("❌ WebSocket disconnected:", self.channel_name)

#     async def queue_update(self, event):
#         """
#         Receives events from channel_layer.group_send()
#         and sends them to the browser.
#         """

#         await self.send(
#             text_data=json.dumps(
#                 {
#                     "event": event.get("event"),
#                     "queue_number": event.get("queue_number"),
#                     "lane": event.get("lane"),
#                     "status": event.get("status"),
#                     "client": event.get("client"),
#                 }
#             )
#         )
