#!/bin/bash
RUN python3 manage.py makemigrations
RUN python3 manage.py migrate
RUN python3 manage.py loaddata authorization/ai_user_fixtures.json
