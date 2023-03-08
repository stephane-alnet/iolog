An asynchronous, realtime network logger for the browser (and Node.js).

# Server

Start the server. It will be available locally on port 3000 and will accept
connections over port 3000.

```
node dist/server.js
```

# Client

```
<script src="https://raw.githubusercontent.com/stephane-alnet/iolog/main/client-dist/client.js"></script>
```

# Example usage

nginx.conf

```
server {
    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
    }
    # Other `location` statements here.
}
```
