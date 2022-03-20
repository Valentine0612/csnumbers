import random
from rest_framework import serializers
from rest_framework_jwt.settings import api_settings
from .models import CustomUser, Transaction, Item, Tag, CoinFlip, Digit, Output, Referal

TYPE_OF_BANK = [
        ('QMONEY', 'QMoney'),
        ('RUB', 'На карту (RUB)'),
        ('UAH', 'На карту (Гривны)'),
        ('QIWI', 'Qiwi-кошелек'),
        ('FK', ' FK-wallet'),
    ]

class UserSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()

    def get_balance(self, obj):
        balance = 0
        queryset = obj.transactions.all()
        if queryset.exists():
            for item in queryset:
                balance += item.amount
        return balance

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'avatar_url', 'avatar', 'email',
                  'code', 'steam_uid', 'steam_link', 'is_staff', 'balance', 'coinflips', 'digits')


class UserRetrieveSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'avatar_url', 'avatar')


class AdminUserSerializer(UserSerializer):

    class Meta(UserSerializer.Meta):
        model = CustomUser
        fields = UserSerializer.Meta.fields + ('is_banned', 'is_winner')


class ReferalSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        referal = validated_data.get('referal')
        from_user = validated_data.get('from_user')
        code = validated_data.get('code')
        if referal == from_user:
            raise serializers.ValidationError(
                {'Error':"You can't activate code from this user!"}
            )
        try: 
            ref_user = Referal.objects.get(referal=from_user)
        except:
            ref_user = None
        if ref_user:
            if ref_user.from_user == referal:
                raise serializers.ValidationError(
                    {'Error':"You can't activate code from this user!"}
                )
        tranz = Transaction()
        tranz.user = referal
        tranz.amount = 10
        tranz.info = f'Активация промокода - {code}'
        tranz.save()
        instance = self.Meta.model(**validated_data)
        instance.save()
        return instance

    class Meta:
        model = Referal
        fields = ['id', 'referal', 'from_user', 'code']


class OutputSerializer(serializers.ModelSerializer):
    
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=50.0)
    method = serializers.ChoiceField(choices=TYPE_OF_BANK)
    account = serializers.CharField(max_length=100)

    def update(self, instance, validated_data):
        trans = Transaction()
        trans.amount = -instance.amount
        trans.user = instance.user
        trans.info = 'Вывод средств'
        trans.save()
        instance.is_active = False
        instance.save()
        return instance

    def create(self, validated_data):
        print(validated_data)
        user = self.context['request'].user
        instance = self.Meta.model(**validated_data)
        instance.user = user
        instance.is_active = True
        instance.save()
        return instance

    class Meta:
        model = Output
        fields = ('id', 'amount', 'account','method', 'created_at', 'is_active')
        

class SteamUserSerializer(UserSerializer):
    token = serializers.SerializerMethodField()
    steam_uid = serializers.IntegerField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('token', 'username', 'steam_uid')

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token


class UserSerializerWithToken(serializers.ModelSerializer):

    token = serializers.SerializerMethodField()
    password = serializers.CharField(min_length=8, write_only=True)
    avatar_url = serializers.URLField(required=False)
    avatar = serializers.ImageField(required=False)

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance

    class Meta:
        model = CustomUser
        fields = ('token', 'email', 'username', 'password',
                  'steam_uid', 'avatar_url', 'avatar')


class UpdateUserSerializer(serializers.ModelSerializer):
    token = serializers.SerializerMethodField()
    password = serializers.CharField(
        min_length=8, write_only=True, required=False)
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = CustomUser
        fields = ('token', 'email', 'username',
                  'steam_link', 'password', 'avatar')

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def validate_username(self, value):
        user = self.context['request'].user
        if CustomUser.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError(
                {"username": "This username is already in use."})
        return value

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if user.pk != instance.pk:
            raise serializers.ValidationError(
                {"authorize": "You dont have permission for this user."})
        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        instance.steam_link = validated_data.get(
            'steam_link', instance.steam_link)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        password = validated_data.pop('password', None)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class TransactionSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(required=True, max_digits=10, decimal_places=2, min_value=0.0)

    class Meta:
        model = Transaction
        fields = ('amount',)


class BalanceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Transaction
        fields = ('created_at', 'amount', 'info')


class ItemSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()
    title = serializers.CharField(max_length=100)
    price = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=0.0)
    is_steam_item = serializers.BooleanField(required=True)

    class Meta:
        model = Item
        fields = ('pk', 'title', 'price', 'image', 'tag', 'is_steam_item')


class TagSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tag
        fields = ('title',)


class CoinFlipSerializer(serializers.ModelSerializer):

    item_1 = serializers.IntegerField()
    item_2 = serializers.IntegerField(required=False)
    bet_1 = serializers.IntegerField(min_value=0, max_value=1)
    bet_2 = serializers.IntegerField(required=False, min_value=0, max_value=1)
    winner = serializers.IntegerField(required=False)

    class Meta:
        model = CoinFlip
        fields = ('pk', 'player_1', 'player_2', 'is_active',
                  'winner', 'item_1', 'item_2', 'bet_1', 'bet_2')
        read_only_fields = ('player_1', 'item_1')

    def create(self, validated_data):
        user = self.context.get('scope').get('user')
        if user.is_banned or not user.is_email_confirmed:
            raise serializers.ValidationError(
                {"Error": "You have invalid account settings"})
        validated_data.pop('player_2', None)
        validated_data.pop('is_active', None)
        validated_data.pop('winner', None)
        validated_data.pop('item_2', None)
        validated_data.pop('bet_2', None)
        queryset = user.items.get(pk=validated_data.get('item_1'))
        if queryset is None:
            raise serializers.ValidationError(
                {"Error": "You don't have this item"})
        user.items.remove(queryset)
        validated_data['player_1'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        player_1 = instance.player_1
        player_2 = self.context.get('scope').get('user')
        if player_2.is_banned or not player_2.is_email_confirmed:
            raise serializers.ValidationError(
                {"Error": "You have invalid account settings"})
        validated_data['player_2'] = player_2

        validated_data.pop('item_1', None)
        validated_data.pop('bet_1', None)
        validated_data.pop('bet_2', None)

        if instance.player_1 == validated_data['player_2']:
            raise serializers.ValidationError(
                {"Error": "You can't play with this player"})

        if not instance.is_active:
            raise serializers.ValidationError(
                {"Error": "Coin Flip not active"})

        item_2 = player_2.items.get(pk=validated_data.get('item_2'))
        item_1 = Item.objects.get(pk=instance.item_1)

        if item_2 is None:
            raise serializers.ValidationError(
                {"Error": "You don't have this item"})

        if not round(float(item_1.price)*0.95) <= item_2.price <= round(float(item_1.price)*1.05):
            raise serializers.ValidationError(
                {"Error": "Price is lower than price of item_1"})

        if instance.bet_1 == 0:
            instance.bet_2 = 1
        else:
            instance.bet_2 = 0

        if player_1.is_winner:
            instance.winner = instance.bet_1 if random.random() < 0.8 else instance.bet_2
        elif player_2.is_winner:
            instance.winner = instance.bet_2 if random.random() < 0.8 else instance.bet_1
        else:
            instance.winner = random.randint(0, 1)

        trans = Transaction()
        if instance.winner == instance.bet_1:
            item = Item.objects.get(pk=instance.item_1)
            player_1.items.add(item)
            trans.user = player_1
            trash = player_2.items.get(pk=item_2.pk)
            player_2.items.remove(trash)
        else:
            item = player_2.items.get(pk=item_2.pk)
            trans.user = player_2
        trans.amount = round(float(item.price)*0.9)
        trans.info = f'Выигрыш в игре Коинфлип №{instance.pk}'
        trans.save()

        player_1.coinflips += 1
        player_1.save()
        player_2.coinflips += 1
        player_2.save()

        instance.is_active = False
        return super().update(instance, validated_data)


class DigitSerializer(serializers.ModelSerializer):

    item_1 = serializers.IntegerField()
    item_2 = serializers.IntegerField(required=False)
    bet_1 = serializers.IntegerField(required=False, min_value=0, max_value=9)
    bet_2 = serializers.IntegerField(required=False, min_value=0, max_value=9)
    winner = serializers.IntegerField(required=False)

    class Meta:
        model = Digit
        fields = ('pk', 'player_1', 'player_2', 'is_active',
                  'winner', 'item_1', 'item_2', 'bet_1', 'bet_2', 'select_1', 'select_2','seq_1','seq_2')
        read_only_fields = ('player_1', 'item_1')

    def create(self, validated_data):
        user = self.context.get('scope').get('user')
        if user.is_banned or not user.is_email_confirmed:
            raise serializers.ValidationError(
                {"Error": "You have invalid account settings"})
        validated_data.pop('player_2', None)
        validated_data.pop('is_active', None)
        validated_data.pop('winner', None)
        validated_data.pop('item_2', None)
        validated_data.pop('bet_2', None)
        validated_data.pop('bet_1', None)
        queryset = user.items.get(pk=validated_data.get('item_1'))
        if queryset is None:
            raise serializers.ValidationError(
                {"Error": "You don't have this item"})
        user.items.remove(queryset)
        validated_data['player_1'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):

        if 'select_1' in validated_data and instance.select_1 is None:
            seq_1 = random.sample(range(1,10),9)
            seq_1.remove(instance.bet_1)
            seq_1.insert(validated_data['select_1']-1,instance.bet_1)
            instance.seq_1 = ('').join(map(str,seq_1))
            return super().update(instance, validated_data)
        
        if 'select_2' in validated_data and instance.select_2 is None:
            seq_2 = random.sample(range(1,10),9)
            seq_2.remove(instance.bet_2)
            seq_2.insert(validated_data['select_2']-1,instance.bet_2)
            instance.seq_2 = ('').join(map(str,seq_2))
            return super().update(instance, validated_data)

        player_1 = instance.player_1
        player_2 = self.context.get('scope').get('user')
        if player_2.is_banned or not player_2.is_email_confirmed:
            raise serializers.ValidationError(
                {"Error": "You have invalid account settings"})
        validated_data['player_2'] = player_2

        validated_data.pop('item_1', None)
        validated_data.pop('bet_1', None)
        validated_data.pop('bet_2', None)

        if instance.player_1 == validated_data['player_2']:
            raise serializers.ValidationError(
                {"Error": "You can't play with this player"})

        if not instance.is_active:
            raise serializers.ValidationError(
                {"Error": "Coin Flip not active"})

        item_2 = player_2.items.get(pk=validated_data.get('item_2'))
        item_1 = Item.objects.get(pk=instance.item_1)

        if item_2 is None:
            raise serializers.ValidationError(
                {"Error": "You don't have this item"})

        if not round(float(item_1.price)*0.95) <= item_2.price <= round(float(item_1.price)*1.05):
            raise serializers.ValidationError(
                {"Error": "Price is lower than price of item_1"})

        if player_1.is_winner:
            instance.bet_2 = random.randint(2, 8)
            if random.random() < 0.8:
                instance.bet_1 = instance.bet_2 + random.randint(1, 9-instance.bet_2)
            else:
                instance.bet_1 = instance.bet_2 - random.randint(1, instance.bet_2-1)
        elif player_2.is_winner:
            instance.bet_1 = random.randint(2, 8)
            if random.random() < 0.8:
                instance.bet_2 = instance.bet_1 + random.randint(1, 9-instance.bet_1)
            else:
                instance.bet_2 = instance.bet_1 - random.randint(1, instance.bet_1-1)
        else:
            data = random.sample(range(1,10),2)         
            instance.bet_1 = data[0]
            instance.bet_2 = data[1]

        instance.winner = instance.bet_1 if instance.bet_1 > instance.bet_2 else instance.bet_2

        trans = Transaction()
        if instance.winner == instance.bet_1:
            item = Item.objects.get(pk=instance.item_1)
            player_1.items.add(item)
            trans.user = player_1
            trash = player_2.items.get(pk=item_2.pk)
            player_2.items.remove(trash)
        else:
            item = player_2.items.get(pk=item_2.pk)
            trans.user = player_2
        trans.amount = round(float(item.price)*0.9)
        trans.info = f'Выигрыш в игре Числа №{instance.pk}'
        trans.save()

        player_1.digits += 1
        player_1.save()
        player_2.digits += 1
        player_2.save()

        instance.is_active = False
        return super().update(instance, validated_data)
