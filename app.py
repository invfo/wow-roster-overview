from pyramid.config import Configurator
from pyramid.response import Response

from pyramid.view import view_config

import requests
import psycopg2
import json
import os


KEY         = os.environ['BLIZZARD_KEY']
DB_HOST     = os.environ['DB_HOST']
DB_NAME     = os.environ['DB_NAME']
DB_USER     = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']


def get_active_spec(server, player, key):
    url = 'https://eu.api.battle.net/wow/character/' \
            '%s/%s?fields=talents&locale=en_GB&apikey=%s' \
            % (server, player, key)
    r = requests.get(url)
    talent_info = r.json()['talents']
    for e in talent_info:
        if 'spec' in e:
            if e.get('selected', None):
                return e['spec']['name']


# cur.execute('CREATE TABLE roster(id SERIAL PRIMARY KEY NOT NULL, player VARCHAR(30), server VARCHAR(30), spec VARCHAR(20), info VARCHAR(30000))')

def update_player_entry(server, player, spec, data):
    conn = psycopg2.connect("host=%s dbname=%s user=%s password=%s" \
        % (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD))
    cur = conn.cursor()
    cmd = "SELECT id FROM roster WHERE player = %s AND server = %s AND spec = %s"
    cur.execute(cmd, (player, server, spec))
    id = cur.fetchone()
    if id is not None:
        cmd = "UPDATE roster SET info = %s WHERE id = %s"
        cur.execute(cmd, (json.dumps(data), id))
    else:
        cmd = "INSERT INTO roster (server, player, spec, info) VALUES (%s, %s, %s, %s)"
        cur.execute(cmd, (server, player, spec, json.dumps(data)))
    conn.commit()
    cur.close()
    conn.close()

def get_player_entry(server, player, spec):
    conn = psycopg2.connect("host=%s dbname=%s user=%s password=%s" \
        % (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD))
    cur = conn.cursor()

    cmd = "SELECT info FROM roster WHERE server = %s AND player = %s and spec = %s"
    cur.execute(cmd, (server, player, spec))
    player_info = cur.fetchone()
    if player_info is not None:
        player_info = player_info[0]
    cur.close()
    conn.close()
    return player_info


def manage_player(request):
    server = request.matchdict['server']
    player = request.matchdict['player']
    required_spec = request.matchdict['spec']

    # send request to Blizzard server
    url = 'https://eu.api.battle.net/wow/character/%s/%s' \
            '?fields=items&locale=en_GB&apikey=%s' \
            % (server, player, KEY)

    r = requests.get(url)
    data = r.json()

    active_spec = get_active_spec(server, player, KEY)
    update_player_entry(server, player, active_spec, data)
    required_spec_active = required_spec == active_spec

    if required_spec_active:
        resp = data
        resp['requiredSpecActive'] = required_spec_active
        resp['activeSpec'] = active_spec
        resp['readFromDB'] = False
    else:
        resp = get_player_entry(server, player, required_spec)
        if resp != None:
            resp = json.loads(resp)
            resp['requiredSpecActive'] = required_spec_active
            resp['activeSpec'] = active_spec
            resp['readFromDB'] = True
        else:
            resp = data
            resp['requiredSpecActive'] = required_spec_active
            resp['activeSpec'] = active_spec
            resp['readFromDB'] = False
    return resp

def make_app():
    config = Configurator()

    config.add_route('player', '/player/{server}/{player}/{spec}')
    config.add_view(manage_player, route_name='player', renderer='json')

    config.add_static_view(name='/', path='./static')

    app = config.make_wsgi_app()
    return app
