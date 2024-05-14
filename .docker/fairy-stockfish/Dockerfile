# based on https://github.com/tchorwat/stockfish/blob/master/Dockerfile.14
# the dockerfile includes a ssh server to allow communication with python-chess

FROM alpine:latest AS builder

# Install dependencies
RUN apk add --no-cache git g++ make openssh-server

RUN git clone --depth 1 --branch master https://github.com/fairy-stockfish/Fairy-Stockfish.git
RUN ls -al /

WORKDIR /Fairy-Stockfish/src
RUN echo "arch:$( uname -m )" \
&& case $( uname -m ) in \
  x86_64) \
    make build ARCH=x86-64-modern \
  ;; \
  aarch64) \
    make build ARCH=armv8 \
  ;; \
  armv7l) \
    make build ARCH=armv7 \
  ;; \
  ppc64le) \
    make build ARCH=ppc-64 \
  ;; \
  *) \
    exit 1 \
  ;; \
esac

FROM alpine:latest
COPY ./entrypoint.sh /

RUN chmod +x /entrypoint.sh \
 && apk add --no-cache openssh-server iproute2 libstdc++ ucspi-tcp6   \
 && addgroup -g 1000 stockfish \
 && adduser -u 1000 -G stockfish -HD stockfish \
 && mkdir "/var/run/sshd" \
  #todo replace password
 && echo 'root:password' | chpasswd \
 && sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
 && ssh-keygen -A

WORKDIR /stockfish/
USER stockfish:stockfish

COPY --chown=stockfish:stockfish --from=builder /Fairy-Stockfish/src/stockfish /stockfish/
COPY --chown=stockfish:stockfish --from=builder /Fairy-Stockfish/Copying.txt /stockfish/
COPY --chown=stockfish:stockfish source.txt /stockfish/
COPY --chown=stockfish:stockfish --from=builder /Fairy-Stockfish/src/*.nnue /stockfish/

RUN #sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
USER root
RUN sed 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config > /etc/ssh/sshd_config.tmp && mv /etc/ssh/sshd_config.tmp /etc/ssh/sshd_config

EXPOSE 22
EXPOSE 23249
ENTRYPOINT ["/entrypoint.sh"]