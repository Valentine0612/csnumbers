import decimal
import json
import datetime
import hashlib
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import reverse, redirect, get_object_or_404
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_text
from django.conf import settings
from rest_framework import permissions, status, viewsets
from rest_framework import response
from rest_framework_jwt.views import ObtainJSONWebToken
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from .serializers import *
from .tokens import account_activation_token
from .models import CustomUser, Transaction, Item, Tag, Output
from .utils import Util, request_steam_account_summary, gen_password, CheckItemCoinflip, CheckItemDigit
from .steamsignin import SteamSignIn
from .permissions import IsBanned, IsConfirmed


class CurrentUser(APIView):
    """
    Get info about current user
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request':request})
        return Response(serializer.data)


class FreeKassaRedirectView(APIView):

    permission_classes = [permissions.IsAuthenticated, IsBanned, IsConfirmed]
    _url = 'https://www.free-kassa.ru/merchant/cash.php?'

    def get(self, request):
        amount = request.GET.get('amount')
        user = request.user
        id = round(datetime.datetime.now().timestamp()) + user.pk
        url = self.generate_url(amount, id, user)
        return HttpResponse(url)

    def generate_url(self, amount, id, user):
        string = settings.MERCHANT_ID+':'+str(amount)+':'+settings.SECRET_KEY+':'+str(id)
        sign = hashlib.md5(string.encode()).hexdigest()
        url = self._url + 'm=' + settings.MERCHANT_ID + \
            '&oa=' + str(amount) + '&o=' + str(id)+ '&s='+sign+'&us_user='+str(user.pk)
        return url


class TopUpView(APIView):
    """
    View for top up a balance for User
    """
    permission_classes = [permissions.IsAuthenticated, IsConfirmed, IsBanned]
    
    def post(self, request):
        amount = request.data['AMOUNT']
        user = get_object_or_404(CustomUser.objects.all(), pk=request.data['us_user'])
        trans = Transaction()
        trans.user = user
        trans.amount = amount
        trans.info = 'Пополнение счета +' + str(trans.amount)
        trans.save()
        serializer = UserSerializer(user)
        try:
            ref_user = user.referal.get(referal=user).from_user
        except:
            ref_user = None
        if ref_user:
            ref_trans = Transaction()
            ref_trans.user = ref_user
            ref_trans.amount = float(amount)*0.025
            ref_trans.info = f'Реферал {user} пополнил баланс'
            ref_trans.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserBalanceView(viewsets.ViewSet):
    """
    View for get list of all transactions for User
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        queryset = Transaction.objects.filter(user=user).exclude(info='')
        if queryset.exists():
            data = BalanceSerializer(queryset, many=True)
            return Response(data.data, status=status.HTTP_200_OK)
        return Response({"Transaction":"You don't have any transactions"}, status=status.HTTP_204_NO_CONTENT)


class UserCreate(APIView):
    """
    View for create User
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            user_data = serializer.data

            user = CustomUser.objects.get(email=user_data['email'])
            token = account_activation_token.make_token(user)
            current_site = get_current_site(request).domain
            relative_link = reverse('activate')
            user_email = urlsafe_base64_encode(force_bytes(user.email))

            abs_url = 'http://'+current_site+relative_link + \
                '?user='+user_email+'&token='+token
            email_body = 'Hi, ' + user.username + \
                '\nUse link bellow to activate your email \n' + abs_url
            data = {
                'email_body': email_body,
                'subject': 'Verify your email',
                'to_email': user.email,
            }
            Util.send_mail(data)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserUpdateView(generics.UpdateAPIView):
    """
    Update info about User
    """
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UpdateUserSerializer


class UserListView(viewsets.ViewSet):
    """
    View for Admin include list of all User
    """
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        queryset = CustomUser.objects.all()
        serializer = AdminUserSerializer(queryset, many=True, context={'request':request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        queryset = CustomUser.objects.all()
        user = get_object_or_404(queryset, pk=pk)
        serializer = AdminUserSerializer(user)
        return Response(serializer.data)
    
    def update(self, request, pk=None):
        queryset = CustomUser.objects.all()
        user = get_object_or_404(queryset, pk=pk)    
        user.is_banned = request.data['ban']        
        user.is_winner = request.data['winner'] 
        user.save()
        serializer = AdminUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BanListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    queryset = CustomUser.objects.filter(is_banned=True)
    serializer_class = AdminUserSerializer


class ActivateEmail(generics.GenericAPIView):
    """
    View for activation email
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user_email = request.GET.get('user')
        token = request.GET.get('token')
        try:
            email = force_text(urlsafe_base64_decode(user_email))
            user = CustomUser.objects.get(email=email)
        except(TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            user = None
        if user is not None and account_activation_token.check_token(user, token):
            user.is_email_confirmed = True
            user.save()
            return Response({'Email': 'Ok!'}, status=status.HTTP_200_OK)
        else:
            return Response({'Email': 'Activation link is invalid!'}, status=status.HTTP_400_BAD_REQUEST)


class Login(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        current_site = get_current_site(request).domain
        relative_link = reverse('callback')
        url = 'http://'+current_site+relative_link
        steamLogin = SteamSignIn()
        return steamLogin.RedirectUser(steamLogin.ConstructURL(url))


class SteamUserLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        returnData = request.GET
        response = redirect("/")
        steamLogin = SteamSignIn()
        steamID = steamLogin.ValidateResults(returnData)
        if steamID:
            steam_account = request_steam_account_summary(api_key=settings.STEAM_API_KEY, steam_id=steamID)
            steam_data = {
                'username': steam_account['personaname'],
                'password': gen_password(name=steam_account['steamid'], time=steam_account['timecreated']),
                'steam_uid': str(steamID),
                'avatar_url':steam_account['avatarmedium'],
            }
            try:
                user = CustomUser.objects.get(steam_uid=steam_data['steam_uid'])
            except CustomUser.DoesNotExist:
                user = None
            if user is None:
                serializer = UserSerializerWithToken(data=steam_data)
                if serializer.is_valid():
                    serializer.save()
                else:
                    response.set_cookie('Error','This username is already in use.')
                    return response
                try:
                    steam = CustomUser.objects.get(steam_uid=steam_data['steam_uid'])
                except CustomUser.DoesNotExist:
                    steam = None
                if steam is not None:
                    steam.is_email_confirmed = True
                    steam.save()
                    response.set_cookie("token", serializer.data['token'])
                    return response
                else:
                    return response
            else:
                user.username = steam_data['username']
                user.save()
                serializer = SteamUserSerializer(user)
                response.set_cookie("token", serializer.data['token'])
            return response
        else:
            return response



"""Admin's Views for Magazine"""
class CreateItem(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ItemSerializer
    queryset = Item.objects.all()


class DetailItem(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ItemSerializer
    queryset = Item.objects.all()

    def delete(self, request, pk):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"Info":"Item deleted successfully"},status=status.HTTP_204_NO_CONTENT)


class CreateTag(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = TagSerializer
    queryset = Tag.objects.all()


"""User's Views for Magazine"""

class ItemRetrieveView(generics.RetrieveAPIView):

    model = Item
    permission_classes = [permissions.AllowAny]
    serializer_class = ItemSerializer
    queryset = Item.objects.all()


class AllItemListView(generics.ListAPIView):

    model = Item
    permission_classes = [permissions.AllowAny]
    serializer_class = ItemSerializer
    queryset = Item.objects.all()

    def get_queryset(self):
        filter_val = self.request.GET.get('tag')
        beg = self.request.GET.get('from')
        end = self.request.GET.get('to')
        context = Item.objects.all()
        if filter_val:
            context = context.filter(tag=filter_val)
        if beg:
            context = context.filter(price__gte=beg)
        if end:
            context = Item.objects.filter(price__lte=end)
        return context


class AllTagListView(generics.ListAPIView):
    model = Tag
    permission_classes = [permissions.AllowAny]
    serializer_class = TagSerializer
    queryset = Tag.objects.all()


class BuyItem(APIView):

    permission_classes = [permissions.IsAuthenticated, IsConfirmed, IsBanned]
    
    def post(self, request, pk):
        user = request.user
        queryset = Item.objects.all()
        
        is_coinflip = CheckItemCoinflip()
        if is_coinflip.check_item(user, pk):
            return Response({"Item":"This item used by Coinflip"}, status=status.HTTP_204_NO_CONTENT)

        is_digit = CheckItemDigit()
        if is_digit.check_item(user, pk):
            return Response({"Item":"This item used by Digits"}, status=status.HTTP_204_NO_CONTENT)

        try:
            user_item = user.items.get(pk=pk)
        except:
            user_item = None
        if user_item is None:
            serializer = UserSerializer(user)
            trans = Transaction()
            item = get_object_or_404(queryset,pk=pk)
            if serializer.data['balance'] >= item.price:
                data = TransactionSerializer(data={'amount':item.price})
                if data.is_valid():
                    user.items.add(item)
                    trans.user = user
                    trans.amount = -item.price
                    trans.save()
                    return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
            return Response({"Balance":"You don't have enough money"}, status=status.HTTP_302_FOUND)
        else:
            return Response({"Item":"You already have this item"}, status=status.HTTP_204_NO_CONTENT)


class SellItem(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        user = request.user
        queryset = user.items.all()
        trans = Transaction()
        item = get_object_or_404(queryset, pk=pk)
        if item:
            data = TransactionSerializer(data={'amount':item.price})
            if data.is_valid():
                user.items.remove(item)
                trans.user = user
                trans.amount = item.price
                trans.save()
                return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_404_NOT_FOUND)


class ItemListView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        queryset = user.items.all()
        if queryset.exists():
            data = ItemSerializer(queryset, many=True, context={'request':request})
            return Response(data.data, status=status.HTTP_200_OK)
        else:
            return Response({"Empty":"You don't have any items"},status=status.HTTP_404_NOT_FOUND)

"""View for retrieve info about user"""

class UserInfoView(generics.RetrieveAPIView):

    permission_classes = [permissions.AllowAny]
    serializer_class = UserRetrieveSerializer
    queryset = CustomUser.objects.all()


"""Views for manage Output model"""
class OutputListCreateView(generics.ListCreateAPIView):

    permission_classes = [permissions.IsAuthenticated, IsBanned, IsConfirmed]
    serializer_class = OutputSerializer
    queryset = Output.objects.all()

    def get_queryset(self):
        user = self.request.user
        return Output.objects.filter(user=user).filter(is_active=True)
        
    def post(self, request):
        user = self.request.user
        serializer = UserSerializer(user)
        amount = float(request.data['amount'])
        queryset = self.get_queryset()
        if queryset.exists():
            return Response({"info":"You have active output"}, status=status.HTTP_208_ALREADY_REPORTED)
        else:
            if amount <= serializer.data['balance']:
                output = self.get_serializer(data=request.data, context={'request':request})
                if output.is_valid():
                    output.save()
                    return Response(output.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(output.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"info":"Output failed!"}, status=status.HTTP_400_BAD_REQUEST)
        

class OutputRetrieveDestroyView(generics.RetrieveDestroyAPIView):

    permission_classes = [permissions.IsAuthenticated, IsBanned, IsConfirmed]
    serializer_class = OutputSerializer
    queryset = Output.objects.all()

    def delete(self, request, pk):
        user = self.request.user
        instance = self.get_object()
        if user == instance.user:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        else: 
            return Response({"info":"You don't have permission"},status=status.HTTP_400_BAD_REQUEST)


"""Views for admin manage Output model"""
class AdminOutputListView(generics.ListAPIView):

    permission_classes = [permissions.IsAdminUser]
    serializer_class = OutputSerializer
    
    def get(self, request):
        queryset = CustomUser.objects.exclude(outputs=None)
        res = {}
        is_active = self.request.query_params.get('is_active')
        if queryset.exists() and is_active:
            for user in queryset:
                outputs_set = user.outputs.filter(is_active=is_active)
                serializer = self.serializer_class(outputs_set, many=True, context={'request':request})
                res.update({user.username : serializer.data})
            return Response(res, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)


class AdminOutputUpdateView(generics.RetrieveUpdateDestroyAPIView):

    permission_classes = [permissions.IsAdminUser]
    serializer_class = OutputSerializer
    queryset = Output.objects.all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)



"""Views for manage Steam output items"""
class SteamOutputItemView(APIView):

    permission_classes = [permissions.IsAuthenticated, IsBanned, IsConfirmed]
    
    def post(self, request, pk):
        user = request.user
        item_user = get_object_or_404(user.items.all(),pk=pk)
        if user.steam_link != '':
            if item_user.is_steam_item:
                if user.steam_item.filter(pk=pk).exists():
                    return Response({"Info":"Steam item already added"}, status=status.HTTP_208_ALREADY_REPORTED)
                else:
                    user.steam_item.add(item_user)
                    return Response({"Info":"Steam item output added!"}, status=status.HTTP_200_OK)
            return Response({"Info":"This item is not steam item"}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"Info":"Your steam link is empty"}, status=status.HTTP_206_PARTIAL_CONTENT)

    def delete(self, request, pk):
        user = request.user
        item_user = get_object_or_404(user.steam_item.all(),pk=pk)
        user.steam_item.remove(item_user)
        return Response({"Info":"Steam item was deleted"}, status=status.HTTP_204_NO_CONTENT)


class SteamItemListView(generics.ListAPIView):

    permission_classes = [permissions.IsAuthenticated, IsBanned, IsConfirmed]
    serializer_class = ItemSerializer
    
    def get_queryset(self):
        user = self.request.user
        return user.steam_item.all()


"""View for Admin manage Steam output item"""
class AdminSteamItemOutput(generics.ListAPIView):
    
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        queryset = CustomUser.objects.exclude(steam_item=None)
        res = {}
        if queryset.exists():
            for user in queryset:
                serializer = ItemSerializer(user.steam_item.all(), many=True, context={'request':request})
                res.update({user.username : serializer.data})
                res[user.username].append({'steam_link':user.steam_link})
            return Response(res, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)


class AdminSteamItemOutputDeleteView(generics.RetrieveDestroyAPIView):

    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, username, pk):
        user = CustomUser.objects.get(username=username)
        queryset = user.steam_item.all()
        try:
            is_delete = self.request.query_params.get('done')
        except:
            is_delete = None
        if queryset.exists():
            item = get_object_or_404(queryset, pk=pk)
            user.steam_item.remove(item)
            if is_delete is not None:
                user.items.remove(item)
            return Response({'info':'item was deleted'}, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReferalCreateView(generics.CreateAPIView):

    permission_classes = [permissions.IsAuthenticated, IsBanned, IsConfirmed]
    serializer_class = ReferalSerializer

    def post(self, request):
        user = request.user
        code = request.data['code']
        from_user = get_object_or_404(CustomUser.objects.all(), code=code)
        data = {
            'code':code,
            'referal':user.pk,
            'from_user':from_user.pk,
        }
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FeedbackView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        data = {
                'email_body': request.data.get('body')+ '\n' + 'Почта отправителя '+request.data.get('email'),
                'subject': 'Пользователь -' + user.username,
                'to_email': settings.EMAIL_HOST_ADMIN,
            }
        Util.send_mail(data)
        return Response(status=status.HTTP_201_CREATED)


class AdminChangeBalance(APIView):

    permissions = [permissions.IsAdminUser]

    def post(self, request, pk):
        amount = TransactionSerializer(data=self.request.data)
        user = get_object_or_404(CustomUser.objects.all(), pk=pk)
        serializer = UserSerializer(user)
        balance = serializer.data['balance']
        if amount.is_valid():
            current = float(amount.data['amount'])
            trans = Transaction()
            trans.amount = -float(balance)+current
            trans.user = user
            trans.save()
            serializer = UserSerializer(user)
        
        return Response(serializer.data ,status=status.HTTP_200_OK)

