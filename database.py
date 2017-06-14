import os
import json
import psycopg2


DB_HOST     = os.environ['DB_HOST']
DB_NAME     = os.environ['DB_NAME']
DB_USER     = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']


class Database:

    def __init__(self, host=None, name=None, user=None, password=None):
        if host != None and name != None and user != None and password != None:
            self.host = host
            self.name = name
            self.user = user
            self.password = password
        else:
            self.host = DB_HOST
            self.name = DB_NAME
            self.user = DB_USER
            self.password = DB_PASSWORD

        self.conn = None
        self.cur = None

    def connect(self):
        if self.conn == None and self.cur == None:
            self.conn = psycopg2.connect("host=%s dbname=%s user=%s password=%s" \
                % (self.host, self.name, self.user, self.password))
            self.cur = self.conn.cursor()

    def disconnect(self):
        if self.conn != None and self.cur != None:
            self.cur.close()
            self.conn.close()
            self.cur, self.conn = None, None

    def add_player(self, player):
        if self.conn != None and self.cur != None:
            cmd =   'INSERT INTO "roster_list" (player, class, spec, roster) '\
                    'VALUES (%s, %s, %s, %s)'
            self.cur.execute(cmd, (player.name, player.class_name, player.spec,
                              player.roster_type))
            self.conn.commit()

    # use Player class
    def get_player_id(self, name, server, spec):
        cmd = "SELECT id "\
              "FROM roster "\
              "WHERE player = %s AND server = %s AND spec = %s"
        self.cur.execute(cmd, (name, server, spec))
        return self.cur.fetchone()

    # use Player class
    def get_player_info(self, name, server, spec):
        cmd = "SELECT info "\
              "FROM roster "\
              "WHERE server = %s AND player = %s and spec = %s"
        self.cur.execute(cmd, (server, name, spec))
        return self.cur.fetchone()

    # use Player class
    def update_player(self, id, data):
        cmd = "UPDATE roster SET info = %s WHERE id = %s"
        self.cur.execute(cmd, (json.dumps(data), id))
        self.conn.commit()

    # use Player class
    def add_player_with_info(self, server, name, spec, data):
        cmd = "INSERT INTO roster (server, player, spec, info) "\
              "VALUES (%s, %s, %s, %s)"
        self.cur.execute(cmd, (server, name, spec, json.dumps(data)))
        self.conn.commit()

    def delete_player(self, player):
        if self.conn != 'None' and self.cur != None:
            cmd =   'DELETE FROM roster_list WHERE player=%s AND '\
                    'spec=%s AND roster=%s'
            self.cur.execute(cmd, (player.name, player.spec, player.roster_type))
            self.conn.commit()
            print "deleted"

    def get_roster(self, roster_type):
        cmd = "SELECT player, spec, class "\
              "FROM roster_list "\
              "WHERE roster = %s"
        self.cur.execute(cmd, (roster_type,))
        return self.cur.fetchall()
