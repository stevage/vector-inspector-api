const express = require("express");
const app = express();

const request = require("request");
const VectorTile = require("@mapbox/vector-tile").VectorTile;
const Pbf = require("pbf");
const zlib = require("zlib");

function getTile(url, res) {
  request({ url, encoding: null }, (err, response, body) => {
    if (err) {
      res.status(400).send({
        message: "Could not fetch tile",
        error: {
          reason: err.reason
        }
      });
      return;
    }
    try {
      body = zlib.gunzipSync(body);
    } catch (e) {
      // probably not a zip file
      // console.error(e);
    }
    const tile = new VectorTile(new Pbf(body));
    console.log(tile);
    console.log("Vector source layers found: ");

    Object.keys(tile.layers).forEach(l => {
      delete tile.layers[l]._pbf;
      delete tile.layers[l]._features;
    });

    res.send({
      layers: tile.layers
    });
  });
  // TODO - something with tileJSON?
}

app.get(/\/tile\/.*$/, function(request, response) {
  const url = request.path.replace("/tile/", "");
  if (url.match(/\.(pbf|mvt)/)) {
    getTile(url, response);
  } else {
    response.status(400).send({
      message: "Usage: /tile/https://example.com/tiles/5/3/1.pbf"
    });
  }
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
