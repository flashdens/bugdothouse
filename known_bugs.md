**server**

**client**
- lobby: cleaner 404 handling
- lobby: client app renders unusable after failed request
- lobby:feature let player move back to specs by clicking on current role - now: move AI
- game: after some time game ws stops working (caused by premoves)?
- game: board 2 gets replaced with board 1 after a capture 
- game: updateGameContext doesn't keep old values, needing a workaround

**stockfish container**
- no clue how to communicate
- sometimes exits with 137?

**wsgi**
- hot reload not working (requests don't reach the server)

**asgi**
- hot reload not working (not configured)

**game**
- handle game over!

**solved:**
- lobby: ws events not working, work only after refresh?
- (possibly fixed) 'cannot have two html5 backends at the same time' after game start 

