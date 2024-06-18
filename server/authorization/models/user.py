from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.db.models import Q
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    Menadżer użytkowników dla modelu User.
    """

    def create_user(self, email, username, password=None, **extra_fields):
        """
        Tworzy i zwraca użytkownika.
        """
        if not email:
            raise ValueError('The Email field must be set')
        if User.objects.filter(email=email).exists():
            raise ValueError('A user with this email already exists')
        elif User.objects.filter(username=username).exists():
            raise ValueError('A user with this username already exists')
        email = self.normalize_email(email)
        user = User(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """
        Tworzy i zwraca konto administartora
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if self.model.objects.filter(email=email).exists():
            raise ValueError('A user with this email already exists')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Reprezentuje użytkownika serwisu.

    Atrybuty:
        email (str): unikalny adres email użytkownika.
        username (str): unikalna nazwa użytkownika.
        is_active (bool): wskazuje, czy konto użytkownika jest aktywne.
        is_staff (bool): wskazuje, czy użytkownik ma uprawnienia administracyjne.
        date_joined (datetime): data dołączenia użytkownika do serwisu.
        elo (int): ranking ELO użytkownika, domyślnie 1200. (pole niewykorzystane)
    """

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    elo = models.IntegerField(default=1200)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    objects = UserManager()

    def __str__(self):
        return self.username

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['email'],
                name='unique_email_non_null',
                condition=~Q(email=None),
            ),
        ]
