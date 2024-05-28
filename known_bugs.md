**server**
- token refresh returns 403 forbidden

**client**
- token refresh returns 403 forbidden
- (possibly fixed) 'cannot have two html5 backends at the same time' after game start 
- players get logged in as guests after server reset (should simply get logged out)
- lobby: client app renders unusable after failed request
- lobby: sometimes websocket connection does not work on enter
- game: after some time game ws stops working (caused by premoves)?

**stockfish container**
- no clue how to communicate
- sometimes exits with 137?

**wsgi**
- hot reload not working (requests don't reach the server)

**asgi**
- hot reload not working (not configured)

**solved:**
- lobby: ws events not working, work only after refresh?


