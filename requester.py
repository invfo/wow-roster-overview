# coding: utf8
import requests

KEY = raw_input('Enter API key: ');

server = 'Hyjal'
player = 'Maéror'

url = 'https://eu.api.battle.net/wow/character/%s/%s' \
        '?fields=items&locale=en_GB&apikey=%s' \
        % (server, player, KEY)

r = requests.get(url)
print r.status_code, r.json()
