# Use an official Python runtime as a parent image
FROM --platform=$BUILDPLATFORM python:3.11-alpine AS builder

# Set environment variables
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /opt/myproject
WORKDIR /opt/myproject

COPY requirements.txt /opt/myproject

# Install system dependencies
RUN apk update && \
    apk add --no-cache git linux-headers musl-dev gcc python3-dev

RUN pip3 install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /opt/myproject

CMD ["python3", "manage.py", "migrate"]
