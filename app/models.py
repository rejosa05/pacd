from django.db import models
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth.hashers import make_password

class AccountDetails(models.Model):
    user = models.CharField(max_length=100, null=True, unique=True)
    password = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    divisions = models.CharField(max_length=100)
    unit = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} ({self.first_name} {self.last_name})"
    
    def set_password(self,raw_password):
        self.password = make_password(raw_password)

    def save(self, *args, **kwargs):
        # Ensure the password is hashed when creating a new user or updating the password
        if not self.pk or AccountDetails.objects.filter(pk=self.pk).exists() and \
                AccountDetails.objects.get(pk=self.pk).password != self.password:
            self.password = make_password(self.password)
        super(AccountDetails, self).save(*args, **kwargs)

        self.create_django_user()
    
    def create_django_user(self):
    # Create or get a Django User based on the 'user' field
        user, created = AccountDetails.objects.get_or_create(user=self.user)
        if created:
            # Set the password for the Django User using the hashed password
            user.set_password(self.password)
            user.first_name = self.first_name
            user.last_name = self.last_name
            user.save()
class ClientDetails(models.Model):
    client_fullname = models.CharField(max_length=100)
    client_queue_no = models.PositiveIntegerField(default=1)
    client_lane_type = models.CharField(max_length=100)
    client_transaction_type = models.CharField(max_length=100)
    client_status = models.CharField(max_length=100, default='Pending')
    client_created_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.client_fullname
    
    def save(self, *args, **kwargs):
        if self.client_fullname:
            self.client_fullname = self.client_fullname.capitalize()
        super(ClientDetails, self).save(*args, **kwargs)
    
    @staticmethod
    def get_queue_no():
        today = timezone.now().date()
        start_queue = 1
        last_queue = ClientDetails.objects.filter(client_created_date__date=today).order_by('client_queue_no').last()
        if last_queue:
            print(last_queue)
            return last_queue.client_queue_no + start_queue
        return start_queue

@receiver(pre_save, sender=ClientDetails)
def set_queue_no(sender, instance, **kwargs):
    if not instance.client_queue_no or instance.client_queue_no == 1:
        instance.client_queue_no = ClientDetails.get_queue_no()
        
class HisloryLog(models.Model):
    action = models.CharField(max_length=100)
    client = models.ForeignKey(ClientDetails, on_delete=models.CASCADE, related_name='history_logs')
    timestamp = models.DateTimeField(auto_now_add=True)
    ClientDetails = models.TextField()

    def __str__(self):
        return f"{self.client.client_fullname} - {self.action} at {self.timestamp}"
    

@receiver(post_save, sender=ClientDetails)
def log_client_save(sender, instance, created, **kwargs):
    if created:
        action = 'created'
    else:
        action = 'updated'
    HisloryLog.objects.create(
        client=instance,
        action=action,
        timestamp=timezone.now()
    )

@receiver(post_delete, sender=ClientDetails)
def log_client_delete(sender, instance, **kwargs):
    HisloryLog.objects.create(
        client=instance,
        action='deleted',
        date=timezone.now()
    )
