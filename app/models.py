from django.db import models
from django.db.models.signals import pre_save, post_save, post_delete
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.utils import timezone

class PacdUser(models.Model):
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    created_date = models.DateField()

    def __str__(self):
        return self.username
    
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
        
class HislotyLog(models.Model):
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
    HislotyLog.objects.create(
        client=instance,
        action=action,
        timestamp=timezone.now()
    )
    print(HislotyLog.objects.all())

@receiver(post_delete, sender=ClientDetails)
def log_client_delete(sender, instance, **kwargs):
    HislotyLog.objects.create(
        client=instance,
        action='deleted',
        date=timezone.now()
    )

