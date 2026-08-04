import json

from django.contrib.auth.models import User
from django.test import RequestFactory, TestCase
from django.urls import reverse

from .models import AccountDetails, ClientDetails, Unit
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


class TransactionNotificationBellTests(TestCase):
    def test_transaction_page_renders_notification_badge(self):
        user = User.objects.create_user(username='admin', password='secret123')
        unit = Unit.objects.create(name='PACD')
        AccountDetails.objects.create(user=user, unit=unit, status='Active')

        session = self.client.session
        session['username'] = user.username
        session.save()

        response = self.client.get(reverse('transactions'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="notify"')
        self.assertContains(response, 'notification-container')


class ClientTransactionApiTests(TestCase):
    def test_list_clients_returns_real_clientdetails_records(self):
        ClientDetails.objects.create(
            client_firstname='Maria',
            client_lastname='Santos',
            client_contact='09171234567',
            client_address='Purok 3',
            client_gender='Female',
            client_lane_type='Priority',
            client_status='Waiting',
        )

        response = self.client.get('/account/api/clients/')

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload['success'])
        self.assertEqual(len(payload['clients']), 1)
        self.assertEqual(payload['clients'][0]['full_name'], 'Maria Santos')
        self.assertEqual(payload['clients'][0]['status'], 'Waiting')
