# Use an official Python runtime as a parent image
FROM python:3.11-alpine

# Set environment variables
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /opt/bugdothouse
WORKDIR /opt/bugdothouse

COPY requirements.txt /opt/bugdothouse

# Install system dependencies
RUN apk update && \
    apk add --no-cache git linux-headers musl-dev gcc python3-dev

RUN pip3 install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /opt/bugdothouse

CMD ["python3", "manage.py", "migrate"]
