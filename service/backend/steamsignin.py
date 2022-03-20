import re
import urllib.request
from django.shortcuts import redirect
from urllib.parse import urlencode


class SteamSignIn():

    _provider = 'https://steamcommunity.com/openid/login'

    def RedirectUser(self, strPostData):
        resp = redirect('{0}?{1}'.format(self._provider, strPostData), 303)
        return resp

    def ConstructURL(self, responseURL):

        # Ensure the protocol is at least http (spec requirement). You should use https but often test environments don't guarantee this...
        if responseURL[0:4] != 'http':
            errMessage = 'http was not found at the start of the string {0}.'.format(
                responseURL)
            raise ValueError(errMessage)

        authParameters = {
            'openid.ns': 'http://specs.openid.net/auth/2.0',
            'openid.mode': 'checkid_setup',
            'openid.return_to': responseURL,
            'openid.realm': responseURL,
            'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
        }

        return urlencode(authParameters)


    def ValidateResults(self, results):
        try:

            validationArgs = {
                'openid.assoc_handle': results['openid.assoc_handle'],
                'openid.signed': results['openid.signed'],
                'openid.sig': results['openid.sig'],
                'openid.ns': results['openid.ns']
            }

            signedArgs = results['openid.signed'].split(',')
            for item in signedArgs:
                itemArg = 'openid.{0}'.format(item)
                if results[itemArg] not in validationArgs:
                    validationArgs[itemArg] = results[itemArg]

            validationArgs['openid.mode'] = 'check_authentication'
            parsedArgs = urlencode(validationArgs).encode("utf-8")

            with urllib.request.urlopen(self._provider, parsedArgs) as requestData:
                responseData = requestData.read().decode('utf-8')

            if re.search('is_valid:true', responseData):
                matched64ID = re.search(
                    'https://steamcommunity.com/openid/id/(\d+)', results['openid.claimed_id'])
                if matched64ID != None or matched64ID.group(1) != None:
                    return matched64ID.group(1)
                else:
                    return False
            else:
                return False
        except:
            return False
