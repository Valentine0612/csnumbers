import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django_resized import ResizedImageField
from .managers import CustomUserManager

def user_directory_path(instance, filename): 
    return 'user_{0}/{1}'.format(instance.username, filename)

def item_directory_path(instance, filename):
    return 'item_{0}/{1}'.format(instance.title, filename)


class Tag(models.Model):
    title = models.CharField(max_length=100, unique=True, primary_key=True)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['title']


class Item(models.Model):
    title = models.CharField(max_length=100, blank=False)
    tag = models.ForeignKey(Tag, related_name='tags', on_delete=models.PROTECT)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = ResizedImageField(size=[300, 300], crop=['middle', 'center'], upload_to=item_directory_path, force_format='PNG')
    is_steam_item = models.BooleanField(default=False)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['title']


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True,blank=True, null=True)
    username = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=6, unique=True, editable=False,)
    steam_link = models.CharField(max_length=200, blank=True, default='')
    steam_uid = models.CharField(max_length=30,blank=True, null=True, unique=True)
    start_date = models.DateTimeField(default=timezone.now)
    avatar = ResizedImageField(
        size=[300, 300], 
        crop=['middle', 'center'], 
        upload_to=user_directory_path, 
        default='/default_user/user.png'
    )
    avatar_url = models.URLField(blank=True, null=True)
    items = models.ManyToManyField(Item, related_name='users', blank=True)
    steam_item = models.ManyToManyField(Item, related_name='user_steam', blank=True)
    is_staff = models.BooleanField(default=False)
    is_email_confirmed = models.BooleanField(default=False)
    is_banned = models.BooleanField(default=False)
    is_winner = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    coinflips = models.IntegerField(default=0)
    digits = models.IntegerField(default=0)

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    class Meta:
        ordering = ['username']

    def save(self, *args, **kwargs):
        code = self.code
        if not code:
            code = uuid.uuid4().hex[:6].upper()
        while CustomUser.objects.filter(code=code).exclude(pk=self.pk).exists():
            code = uuid.uuid4().hex[:6].upper()
        self.code = code
        super(CustomUser, self).save(*args, **kwargs)
    

class Referal(models.Model):
    referal = models.ForeignKey(CustomUser, related_name='referal', on_delete=models.CASCADE, unique=True)
    from_user = models.ForeignKey(CustomUser, related_name='from_user', on_delete=models.CASCADE)
    code = models.CharField(max_length=6)

    def __str__(self):
        return self.referal.username


class Transaction(models.Model):
    user = models.ForeignKey(CustomUser,related_name='transactions', on_delete=models.DO_NOTHING)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    info = models.CharField(max_length=200, default='', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class Output(models.Model):
    TYPE_OF_BANK = [
        ('QMONEY', 'QMoney'),
        ('RUB', 'На карту (RUB)'),
        ('UAH', 'На карту (Гривны)'),
        ('QIWI', 'Qiwi-кошелек'),
        ('FK', ' FK-wallet'),
    ]

    user = models.ForeignKey(CustomUser, related_name='outputs', on_delete=models.DO_NOTHING)
    account = models.CharField(max_length=100, default=0)
    method = models.CharField(choices=TYPE_OF_BANK, max_length=10)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.user.username


class CoinFlip(models.Model):
    player_1 = models.ForeignKey(CustomUser, related_name='player_1', on_delete=models.DO_NOTHING)
    player_2 = models.ForeignKey(CustomUser, related_name='player_2', on_delete=models.DO_NOTHING, null=True, blank=True)
    winner = models.IntegerField(null=True)
    item_1 = models.IntegerField()
    item_2 = models.IntegerField(null=True)
    bet_1 = models.IntegerField()
    bet_2 = models.IntegerField(null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.player_1.username


class Digit(models.Model):
    player_1 = models.ForeignKey(CustomUser, related_name='pl_1', on_delete=models.DO_NOTHING)
    player_2 = models.ForeignKey(CustomUser, related_name='pl_2', on_delete=models.DO_NOTHING, null=True, blank=True)
    winner = models.IntegerField(null=True)
    item_1 = models.IntegerField()
    item_2 = models.IntegerField(null=True)
    bet_1 = models.IntegerField(null=True)
    bet_2 = models.IntegerField(null=True)
    select_1 = models.IntegerField(null=True)
    select_2 = models.IntegerField(null=True)
    seq_1 = models.CharField(max_length=9, null=True, blank=True)
    seq_2 = models.CharField(max_length=9, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.player_1.username
    