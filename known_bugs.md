**server**
- token refresh returns 403 forbidden

**client**
- token refresh returns 403 forbidden
- (possibly fixed) 'cannot have two html5 backends at the same time' after game start 
- players get logged in as guests after server reset (should simply get logged out)
- lobby: cleaner 404 handling
- lobby: client app renders unusable after failed request
- lobby:feature let player move back to specs by clicking on current role - now: move AI
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

**game**
- promotions not working
- ai checkmate
- ai starting 
