const express = require('express');
const router = express.Router();
const url = require('url');
const request = require('request');

const googleApiKey = '&key=AIzaSyCNaOJj0OTnVeLBVjPMfGeb-KgBPsT13HA';


router.get('/getYelpReviews', function (req, res) {

    let bestPlace_id;
    let params = url.parse(req.url, true).query;

    let path = 'https://api.yelp.com' + '/v3/businesses/matches/best?name=' + encodeURI(params.name)
        + '&city=' + encodeURI(params.city)+'&state=' + params.state + '&country=' + params.country +'&address1='+encodeURI(params.address1);

    console.log(path);

    let options= {
        url: path,
        headers: {
            'Authorization': 'Bearer 0j75M9nlvMHDUVp3kMC85QKPkqA2M9ht-M054kc2eT9m1Ov1DGNS6yCMlUjeYKlrm510nDuPsNRhnpJsKz6h47LxUdo6rAJj2lMVxC-mJgpmNbb4P3xEQrZKHXfEWnYx'
        }
    };

    request(options, (err,response,data) => {
        if (err) {
            console.log(err);
        } else {

            let locationsRes = JSON.parse(data);

            console.log(locationsRes);

            if(locationsRes.businesses.length== 0){
                res.end(JSON.stringify(locationsRes));
            }else{

                bestPlace_id = locationsRes.businesses[0].id;

                let options= {
                    url: 'https://api.yelp.com' + '/v3/businesses/' + bestPlace_id + '/reviews',
                    headers: {
                        'Authorization': 'Bearer 0j75M9nlvMHDUVp3kMC85QKPkqA2M9ht-M054kc2eT9m1Ov1DGNS6yCMlUjeYKlrm510nDuPsNRhnpJsKz6h47LxUdo6rAJj2lMVxC-mJgpmNbb4P3xEQrZKHXfEWnYx'
                    }
                };

                request(options, (err,response,data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.json(JSON.parse(data));
                    }
                });
            }

        }
    });
});



router.get('/getPage', function (req, res) {

    let params = url.parse(req.url, true).query;
    let path = 'https://maps.googleapis.com' + '/maps/api/place/nearbysearch/json?pagetoken=' + params.pagetoken + googleApiKey;

    request(path, (err,response,data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(JSON.parse(data));
        }
    });
});

router.get('/getPlaces', function (req, res) {

    let params = url.parse(req.url, true).query;

    let keyword = params.keyword;
    let type = params.type;
    let distance = params.distance * 1609;

    if( typeof params.location === 'undefined' ){

        let lat = params.lat;
        let lng = params.lng;

        let path = 'https://maps.googleapis.com' + '/maps/api/place/nearbysearch/json?location=' + lat + "," + lng + "&radius=" + distance + '&type=' +  encodeURI(type) + '&keyword=' + encodeURI(keyword) + googleApiKey;

        request(path, (err,response,data) => {
            if (err) {
                console.log(err);
            } else {
                res.json(JSON.parse(data));
            }
        });
    }else{

        let params = url.parse(req.url, true).query;

        let path = 'https://maps.googleapis.com' + '/maps/api/geocode/json?address=' + encodeURI(params.location) + googleApiKey;

        request(path, (err,response,data) => {
            if (err) {
                console.log(err);
            } else {

                let theLocation = JSON.parse(data);

                let lat = theLocation.results[0].geometry.location.lat;
                let lng = theLocation.results[0].geometry.location.lng;

                let path = 'https://maps.googleapis.com' + '/maps/api/place/nearbysearch/json?location=' + lat + "," + lng + "&radius=" + distance + '&type=' +  encodeURI(type) + '&keyword=' + encodeURI(keyword) + googleApiKey;

                request(path, (err,response,data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.json(JSON.parse(data));
                    }
                });
            }
        });
    }

});


router.get('/getLatLng', function (req, res) {

    let params = url.parse(req.url, true).query;

    let path = 'https://maps.googleapis.com' + '/maps/api/geocode/json?address=' + encodeURI(params.location) + googleApiKey;

    request(path, (err,response,data) => {
        if (err) {
            console.log(err);
        } else {
            res.json(JSON.parse(data));
        }
    });
});


router.post("/renewFavourites", function (req, res) {
    User.findById(req.user._id, (err, user) => {
        if (err) {
            console.log(err);
        }
        else {
            user.favourites = req.body;
            user.save();
        }
    });
});


router.get("/getFavourites", function (req, res) {

    var favourites = JSON.stringify(req.user.favourites);
    console.log(favourites);
    res.end(favourites);

});

module.exports = router;
