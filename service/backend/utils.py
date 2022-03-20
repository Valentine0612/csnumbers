from django.core.mail import EmailMessage
import requests
import hashlib
from .serializers import CoinFlipSerializer, DigitSerializer


class Util():
    @staticmethod
    def send_mail(data):
        email = EmailMessage(
            subject=data['subject'], body=data['email_body'], to=[data['to_email']])
        email.send()


def request_steam_account_summary(api_key, steam_id):
    api_base = "https://api.steampowered.com/"
    method = "ISteamUser/GetPlayerSummaries/v0002/"
    params = {"key": api_key, "steamids": steam_id}

    resp = requests.get(api_base + method, params)
    resp.raise_for_status()
    data = resp.json()

    playerlist = data.get("response", {}).get("players", [])
    return playerlist[0] if playerlist else {"steamid": steam_id}


def gen_password(name, time):
    code = str(name) + str(time)
    return hashlib.md5(code.encode()).hexdigest()


class CheckItem:
    serializer = None
    related_name = None

    def check_item(self, user, pk):
        if self.related_name == 'player_1':
            queryset = user.player_1.filter(is_active=True)
        elif self.related_name == 'pl_1':
            queryset = user.pl_1.filter(is_active=True)
        data = self.serializer(queryset, many=True)
        for item in data.data:
            for digit in item.items():
                if 'item_1' == digit[0] and digit[1]==pk:
                    return True
        return False    


class CheckItemCoinflip(CheckItem):
    serializer = CoinFlipSerializer
    related_name = 'player_1'


class CheckItemDigit(CheckItem):
    serializer = DigitSerializer
    related_name = 'pl_1'
