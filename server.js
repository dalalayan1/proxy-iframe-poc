var proxy = require('express-http-proxy');
var fetch = require('isomorphic-fetch');
var spdy = require("spdy");

var fs = require('fs');
var path = require('path');

const express = require('express');
let cors = require('cors');
const { start } = require('repl');
const RequestIp = require('@supercharge/request-ip')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

// app.use(cors());


var logger = (req, res, next) => {
  // console.log("\n\n=======================\nREQ IP => ", req.connection.remoteAddress, "\nREQ URL => ", req.url, "\nREQ METHOD => ", req.method, "\nREQ HEADERS => ", req.headers);
  next();
};

app.use('/public/*', logger, express.static(path.join(__dirname, 'public')))

app.post('/download-aadhar', logger, function(req, res) {
  console.log("INSIDE download-aadhar");
  const file = fs.createWriteStream("aadhar.zip");
  req.pipe(file);
  res.send("downloaded!").status(200);
});

//send APP
app.get('/send-ping', logger, proxy('https://uidai-proxy.herokuapp.com', {
    proxyReqPathResolver(req) {
      console.log("\n\nREQ IP(send-ping) => ", req.connection.remoteAddress);
      console.log("\n\nREQ IP(RequestIp)(send-ping) => ", RequestIp.getClientIp(req));
      console.log("\nHEADERS inside REQ(send-ping) => ", req.headers);
      return `/receive-ping`;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
        "referer": "https://uidai-proxy.herokuapp.com",
        "host": "uidai-proxy.herokuapp.com"
      });
      console.log("\nHEADERS inside REQ proxyReqOptDecorator(send-ping) => ", proxyReqOpts.headers);
      return proxyReqOpts;
    },
    userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
      console.log("\n\nREQ IP inside RES(send-ping) => ", userReq.connection.remoteAddress);
      console.log("\n\nREQ IP inside RES(RequestIp)(send-ping) => ", RequestIp.getClientIp(userReq));
      console.log("\nHEADERS inside RES(send-ping) => ", proxyRes.headers);
      return proxyResData;
    }
  })
);

//receive APP
app.get('/receive-ping', logger, function(req, res) {
  console.log("\n\nREQ IP(receive-ping) => ", req.connection.remoteAddress);
  console.log("\n\nREQ IP(RequestIp)(receive-ping) => ", RequestIp.getClientIp(req));
  console.log("\nHEADERS inside REQ(receive-ping) => ", req.headers);
  res.send("pinged!").status(200);
});


app.get('/request-bin/*', logger, proxy('http://requestbin.net', {
    proxyReqPathResolver(req) {
      return `/r/1hahg8g1`;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
        "referer": "http://requestbin.net",
        "host": "requestbin.net"
      });
      return proxyReqOpts;
    },
    userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
      console.log("\n\nREQ IP inside RES(request-bin) => ", userReq.connection.remoteAddress);
      return proxyResData;
    }
  })
);

app.get('/uidai-proxy/*', logger, proxy('https://resident.uidai.gov.in', {
    proxyReqPathResolver(req) {
      return `${req.url.split("/uidai-proxy")[1]}`;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
        "referer": "https://resident.uidai.gov.in",
        "host": "resident.uidai.gov.in"
      });
      return proxyReqOpts;
    },
    userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
      console.log("\n\nREQ IP inside RES => ", userReq.connection.remoteAddress);
      return proxyResData;
    }
  })
);

app.post('/uidai-proxy/*', logger, proxy('https://resident.uidai.gov.in', {
    proxyReqPathResolver(req) {
      return `${req.url.split("/uidai-proxy")[1]}`;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
        "referer": "https://resident.uidai.gov.in",
        "host": "resident.uidai.gov.in"
      });
      return proxyReqOpts;
    },
    userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
      //check HEADER to detect content as attachment
      if(headers['content-disposition']) {
        // modify HEADERS to stop file download
        headers['content-disposition'] = 'inline';
        headers['content-type'] = 'text/plain';
      }
      return headers;
    },
    userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
      //check HEADER to detect content as attachment
      if(proxyRes.headers['content-disposition']) {
        return new Promise(function (resolve, reject) {
          //send attachment
          fetch('https://127.0.0.1:8000/download-aadhar', {
            method: "POST",
            headers: {
              'Content-Type': 'application/zip'
            },
            body: proxyResData
          })
            .then(function(res) {
              console.log("AADHAR ZIP DOWNLOADED :)");
              resolve("AADHAR ZIP DOWNLOADED :)");
            })
            .catch(function(err) {
              console.log("AADHAR ZIP DOWNLOAD FAILED :(");
              reject("AADHAR ZIP DOWNLOAD FAILED :(");
            });
        });
      }
      return proxyResData;
    }
  })
);

const port = process.env.PORT || 8000;

var options = {
  key: fs.readFileSync(__dirname + "/server.key"),
  cert: fs.readFileSync(__dirname + "/server.crt")
};

// spdy.createServer(options, app).listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

