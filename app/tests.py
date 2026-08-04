import json

from django.test import RequestFactory, TestCase

from .models import ClientDetails
from .views_.client_kiosk import register_client


class ClientKioskRegisterTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_register_client_saves_record_and_returns_queue_data(self):
        payload = {
            'first_name': 'Juan',
            'last_name': 'Dela Cruz',
            'contact_number': '09123456789',
            'address': 'Barangay 1, Antipolo City',
            'sex': 'male',
            'lane': 'priority',
        }

        request = self.factory.post('/client_kiosk/register/', data=payload)
        response = register_client(request)

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['lane_type'], 'Priority')
        self.assertEqual(data['data']['queue_no'], 1)
        self.assertEqual(data['data']['queue_code'], 'P-001')

        client = ClientDetails.objects.get(client_firstname='Juan')
        self.assertEqual(client.client_lastname, 'Dela Cruz')
        self.assertEqual(client.client_contact, '09123456789')
        self.assertEqual(client.client_gender, 'Male')
        self.assertEqual(client.client_lane_type, 'Priority')
