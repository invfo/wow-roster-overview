# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.template import loader

from database import Database
import os
import requests

KEY = os.environ['BLIZZARD_KEY']

def index(request):
    template = loader.get_template('wow_roster_overview/index.html')
    return HttpResponse(template.render({}, request))

def manage_player(request, server, player, required_spec):
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
    return JsonResponse(resp)

def admin(request):
    if request.method == 'GET':
        template = loader.get_template('wow_roster_overview/admin.html')
        return HttpResponse(template.render({}, request))
    elif request.method == 'POST':
        name = request.POST['player']
        class_name = request.POST['class']
        spec = request.POST['spec']
        roster_type = request.POST['roster-type']

        player = Player(name, class_name, spec, roster_type)
        print "adding", name.encode("utf-8")
        add_to_roster(player)
        print 'redirecting'
        template = loader.get_template('wow_roster_overview/admin.html')
        return HttpResponseRedirect('/admin')

def get_roster(request, roster_type):
    roster = retrieve_roster_players(roster_type)
    resp = {'players': []}
    for p in roster.players:
        resp['players'].append(({
                                'name': p.name,
                                'class': p.class_name,
                                'spec': p.spec
                                }))
    return JsonResponse(resp)

def delete_player(request, roster, name, spec):
    player = Player(name, None, spec, roster)
    db = Database()
    db.connect()
    db.delete_player(player)
    db.disconnect()
    template = loader.get_template('wow_roster_overview/admin.html')
    return HttpResponse(template.render({}, request))




# -------
# helpers
# -------

class Player:

    def __init__(self, name, class_name, spec, roster_type):
        self.name = name
        self.class_name = class_name
        self.spec = spec
        self.roster_type = roster_type


class Roster:

    def __init__(self, roster_type):
        self.type = roster_type
        self.players = []

    def add_player(self, player):
        self.players.append(player)


def retrieve_roster_players(roster_type):
    db = Database()
    db.connect()
    players = db.get_roster(roster_type)
    db.disconnect()

    roster = Roster(roster_type)
    for p in players:
        player = Player(name=p[0], class_name=p[2], spec=p[1],
                        roster_type=roster_type)
        roster.add_player(player)
    return roster

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

def add_to_roster(player):
    db = Database()
    db.connect()
    db.add_player(player)
    db.disconnect()
    print "added %s" % player.name.encode("utf-8")
