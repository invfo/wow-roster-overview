# -*- coding: utf-8 -*-
from pyramid.config import Configurator
from pyramid.response import Response, FileResponse
from pyramid.view import view_config

from admin import admin, get_roster, delete_player
from database import Database

import requests
import psycopg2
import json
import os


KEY = os.environ['BLIZZARD_KEY']


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
# cur.execute('CREATE TABLE roster_list(id SERIAL PRIMARY KEY NOT NULL, player VARCHAR(30), server VARCHAR(30), spec VARCHAR(20), roster VARCHAR(10), class VARCHAR(20))')

def update_player_entry(server, player, spec, data):
    db = Database()
    db.connect()
    id = db.get_player_id(player, server, spec) # use Player class

    if id is not None:
        db.update_player(id, data)
    else:
        db.add_player_with_info(server, player, spec, data)
    db.disconnect()

def get_player_entry(server, player, spec):
    db = Database()
    db.connect()
    player_info = db.get_player_info(player, server, spec)
    db.disconnect()
    if player_info is not None:
        player_info = player_info[0]
    return player_info


# -----
# views
# -----

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
            print 'Retrieved from database: ', player.encode('utf-8'), required_spec
            resp = json.loads(resp)
            resp['requiredSpecActive'] = required_spec_active
            resp['activeSpec'] = active_spec
            resp['readFromDB'] = True
        else:
            print 'Unable to find in database: ', player.encode('utf-8'), required_spec
            resp = data
            resp['requiredSpecActive'] = required_spec_active
            resp['activeSpec'] = active_spec
            resp['readFromDB'] = False
    return resp


def make_app():
    config = Configurator()

    config.add_route('admin', '/admin')
    config.add_view(admin, route_name='admin')

    config.add_route('get_roster', '/admin/{roster_type}')
    config.add_view(get_roster, route_name='get_roster', renderer='json')

    config.add_route('delete_player', '/admin/delete/{roster}/{player}/{spec}')
    config.add_view(delete_player, route_name='delete_player')

    config.add_route('player', '/player/{server}/{player}/{spec}')
    config.add_view(manage_player, route_name='player', renderer='json')

    config.add_static_view(name='/', path='./static')

    app = config.make_wsgi_app()
    return app
