var proxy = require('express-http-proxy');
var fetch = require('isomorphic-fetch');
var spdy = require("spdy");

var fs = require('fs');
var path = require('path');

const express = require('express');
let cors = require('cors');
const { start } = require('repl');
const RequestIp = require('@supercharge/request-ip');
const bodyParser = require("body-parser");

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

// app.use(cors());


var logger = (req, res, next) => {

  console.log(
    "\n\nreq (Headers) before START => ",
    req.headers,
    "\nreq(rawHeaders) before START => ", req['rawHeaders'].join("=======")
  );

  req.headers = Object.assign({}, req.headers, {
    "referer": "https://uidai-proxy.herokuapp.com",
    "host": "uidai-proxy.herokuapp.com",
    "connection": "keep-alive"
  });
  delete req.headers.via;
  delete req.headers['connect-time'];
  delete req.headers['x-forwarded-for'];
  delete req.headers['x-forwarded-proto'];
  delete req.headers['x-forwarded-port'];
  delete req.headers['x-request-start'];
  delete req.headers['x-request-id'];
  delete req.headers['total-route-time'];

  req.rawHeaders = "Host=======uidai-proxy.herokuapp.com=======Connection=======close=======Upgrade-Insecure-Requests=======1=======User-Agent=======Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36=======Accept=======text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9=======Sec-Fetch-Site=======same-origin=======Sec-Fetch-Mode=======navigate=======Sec-Fetch-Dest=======iframe=======Referer=======https://uidai-proxy.herokuapp.com=======Accept-Encoding=======gzip, deflate, br=======Accept-Language=======en-GB,en-US;q=0.9,en;q=0.8".split("=======");

  next();
};

app.post('/download-aadhar', logger, function(req, res) {
  console.log("INSIDE download-aadhar");
  const file = fs.createWriteStream("aadhar.zip");
  req.pipe(file);
  res.send("downloaded!").status(200);
});

app.get("/abc", logger,function(req, res) {
  res.send("hi!").status(200);
})

//send APP
// app.get('/send-ping', logger, proxy('https://uidai-proxy.herokuapp.com', {
//     proxyReqPathResolver(req) {
//       console.log("\n\nREQ IP(send-ping) => ", req.connection.remoteAddress);
//       console.log("\n\nREQ IP(RequestIp)(send-ping) => ", RequestIp.getClientIp(req));
//       console.log("\nHEADERS inside REQ(send-ping) => ", req.headers);
//       return `/receive-ping`;
//     },
//     proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
//       proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
//         "referer": "https://uidai-proxy.herokuapp.com",
//         "host": "uidai-proxy.herokuapp.com"
//       });
//       console.log("\nHEADERS inside REQ proxyReqOptDecorator(send-ping) => ", proxyReqOpts.headers);
//       return proxyReqOpts;
//     },
//     userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
//       console.log("\n\nREQ IP inside RES(send-ping) => ", userReq.connection.remoteAddress);
//       console.log("\n\nREQ IP inside RES(RequestIp)(send-ping) => ", RequestIp.getClientIp(userReq));
//       console.log("\nHEADERS inside RES(send-ping) => ", proxyRes.headers);
//       return proxyResData;
//     }
//   })
// );

// //receive APP
// app.get('/receive-ping', logger, function(req, res) {
//   console.log("\n\nREQ IP(receive-ping) => ", req.connection.remoteAddress);
//   console.log("\n\nREQ IP(RequestIp)(receive-ping) => ", RequestIp.getClientIp(req));
//   console.log("\nHEADERS inside REQ(receive-ping) => ", req.headers);
//   res.send("pinged!").status(200);
// });


// app.get('/request-bin/*', logger, proxy('http://requestbin.net', {
//     proxyReqPathResolver(req) {
//       return `/r/1hahg8g1`;
//     },
//     proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
//       proxyReqOpts.headers = Object.assign({}, proxyReqOpts.headers, {
//         "referer": "http://requestbin.net",
//         "host": "requestbin.net"
//       });
//       return proxyReqOpts;
//     },
//     userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
//       console.log("\n\nREQ IP inside RES(request-bin) => ", userReq.connection.remoteAddress);
//       return proxyResData;
//     }
//   })
// );

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   next();
// });

app.get(
  "/uidai-proxy/*", logger,
  proxy("https://uidai-proxy.herokuapp.com", {
    proxyReqPathResolver(req) {
      // req.headers = Object.assign({}, req.headers, {
      //   "referer": "https://resident.uidai.gov.in",
      //   "host": "resident.uidai.gov.in",
      //   "x-forwarded-for": "",
      //   "x-forwarded-port": "",
      //   "x-request-id": "",
      //   "x-forwarded-proto": "",
      //   "via": "",
      //   "connect-time": "",
      //   "x-request-start": "",
      //   "total-route-time": ""
      // });
      if (req.url.includes("offline-kyc")) {
        console.log(
          "\n\nproxyReqPathResolver(remoteAddress) => ",
          req.connection.remoteAddress,
          "\nproxyReqPathResolver(RequestIp) => ",
          RequestIp.getClientIp(req),
          "\nproxyReqPathResolver(Method) => ",
          req.method,
          "\nproxyReqPathResolver(Headers) => ",
          req.headers,
          "\nproxyReqOptDecorator(rawHeaders) => ", req['rawHeaders'].join("=======")
        );
      }
      return `/abc`;
    },
    // proxyReqOptDecorator: function(req, srcReq) {
    //   let modifiedReq = req;
    //   modifiedReq.headers = Object.assign({}, req.headers, {
    //     "referer": "https://resident.uidai.gov.in",
    //     "host": "resident.uidai.gov.in",
    //     "x-forwarded-for": "",
    //     "x-forwarded-port": "",
    //     "x-request-id": "",
    //     "x-forwarded-proto": "",
    //     "via": "",
    //     "connect-time": "",
    //     "x-request-start": "",
    //     "total-route-time": ""
    //   });
    //   return req;
    // },
    proxyErrorHandler: function(err, res, next) {
      console.log("\n\nOKYC RESPONSE ERROR => ", err);
      next(err);
    },
    // userResDecorator: function(proxyRes, proxyResData, req, res) {
    //   if (req.url.includes("offline-kyc")) {
    //     console.log(
    //       "\n\nREQ IP inside userResDecorator(remoteAddress) => ",
    //       req.connection.remoteAddress,
    //       "\nREQ IP inside userResDecorator(RequestIp) => ",
    //       RequestIp.getClientIp(req),
    //       "\nREQ METHOD inside userResDecorator => ",
    //       req.method,
    //       "\nREQ HEADERS inside userResDecorator => ",
    //       req.headers
    //     );
    //   }
    //   return proxyResData;
    // }
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


app.use('/public/*', logger, express.static(path.join(__dirname, 'public')))

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

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