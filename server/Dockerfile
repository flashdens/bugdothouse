FROM python:3.11-alpine

ENV PYTHONUNBUFFERED=1

RUN mkdir -p /opt/bugdothouse
WORKDIR /opt/bugdothouse

COPY requirements.txt /opt/bugdothouse

RUN apk update && \
    apk add --no-cache git linux-headers musl-dev gcc python3-dev openssh-client dcron

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . /opt/bugdothouse

RUN echo "*/5 * * * * /usr/local/bin/python /opt/bugdothouse/manage.py clear_empty_games >> /var/log/cron.log 2>&1" > /etc/crontabs/root

RUN touch /var/log/cron.log

CMD crond && tail -f /var/log/cron.log
