An asynchronous, realtime network logger for the browser (and Node.js).

# Server

Start the server. It will be available locally on port 3000.
Logs coming from the client will output on the console.

```
node dist/server.js
```

Note: there is no need to `npm install`, you only need a working, recent Node.js.

# Client

Copy `client-dist/client.js` in an appropriate location so that it can be served
and included in your HTML page:

```
<script src="client.js"></script>
```

It will automatically capture `console` and send it over the network to the
server-side.

# Example usage

You can integrate the server with your `nginx.conf` as follows:

```
server {
    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
    }
    # Other `location` statements here.
}
```
