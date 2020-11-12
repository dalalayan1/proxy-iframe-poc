var proxy = require('express-http-proxy');
var fetch = require('isomorphic-fetch');
var spdy = require("spdy");

var fs = require('fs');
var path = require('path');

const express = require('express');
let cors = require('cors');
const { start } = require('repl');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

app.use(cors());


var logger = (req, res, next) => {
  console.log("\n\nURL => ", req.url);
  console.log("\nMETHOD => ", req.method);
  console.log("\nREQ HEADERS => ", req.headers);
  next();
};

app.use('/public/*', logger, express.static(path.join(__dirname, 'public')))

app.post('/download-aadhar', logger, function(req, res) {
  console.log("INSIDE download-aadhar");
  const file = fs.createWriteStream("aadhar.zip");
  req.pipe(file);
  res.send("downloaded!").status(200);
});

app.get('*', logger, proxy('https://resident.uidai.gov.in', {
  proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
    proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
      "referer": "https://resident.uidai.gov.in",
      "host": "resident.uidai.gov.in"
    });

    return proxyReqOpts;
  }
})
);

app.post('*', logger, proxy('https://resident.uidai.gov.in', {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
        "referer": "https://resident.uidai.gov.in",
        "host": "resident.uidai.gov.in"
      });

      return proxyReqOpts;
    },
    userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
      if(headers['content-disposition']) {
        // modify HEADERS to stop file download
        headers['content-disposition'] = 'inline';
        headers['content-type'] = 'text/plain';
      }
      return headers;
    },
    userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
      if(proxyRes.headers['content-disposition']) {
        return new Promise(function (resolve, reject) {
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

const port = 8000;

var options = {
  key: fs.readFileSync(__dirname + "/server.key"),
  cert: fs.readFileSync(__dirname + "/server.crt")
};

spdy.createServer(options, app).listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

/* app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
}) */

