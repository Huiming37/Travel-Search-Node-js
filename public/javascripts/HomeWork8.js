
function initAuto()
{
    autocomplete1 = new google.maps.places.Autocomplete((document.getElementById('startLoc')),{types: ['geocode']});
    autocomplete2 = new google.maps.places.Autocomplete((document.getElementById('map_tap_start')),{types: ['geocode']});
}

var app = angular.module("myApp",['ngAnimate']);

function Controller($scope,$http){


    // $scope.backendUrl = "https://enigmatic-mountain-79394.herokuapp.com";
    $scope.backendUrl = "http://localhost:3000/detail";

    $scope.keyword="";
    $scope.type="default";
    $scope.distance="10";

    $scope.isOpen ="";
    $scope.twitterText ="";

    $scope.pageNext ="";
    $scope.pagePrev ="";
    $scope.info_rating_with = 0;



    $scope.localLat="";
    $scope.localLng="";
    $scope.startLat="";
    $scope.startLng="";
    $scope.endLat="";
    $scope.endLng="";




    $scope.locations=[];

    $scope.openTime =[];
    $scope.openDay =[];
    $scope.firstPageLocations = [];

    $scope.nextTimes = 0;
    $scope.nextTokens = [];
    $scope.hasNextTokens = false;

    $scope.hideLocationsFlag = true;
    $scope.hideDetailsFlag = true;


    $scope.travelModel ="DRIVING";
    $scope.locationDetail;
    $scope.locationPriceLevel;

    $scope.reviews=[];
    $scope.reviewsKind = 'Google Reviews';
    $scope.reviewsSortShow ='Default Order';
    $scope.yelpReviews=[];
    $scope.yelpReviewsResponse;
    $scope.reviewSortMode="default";
    $scope.googleReviewFlag = false;


    $scope.form_startLocation = 'curLoc';
    $scope.getCurLoc= false;



    $scope.doesClickDetail = false;
    $scope.seletedLocationIndex;
    $scope.lastTimePlaceId;
    $scope.lastTimelat;
    $scope.lastTimelng;


    $scope.favourites = {};
    $scope.getLocations= false;

    $scope.curFavPage = 1;
    $scope.maxFavPage = 1;
    $scope.favs=[];
    $scope.showFavPage =[];

    $scope.searchTimes = 0;
    $scope.otherLocation;


    $scope.initFav = function(){
        $http({

            method:"GET",
            url: $scope.backendUrl + "/getFavourites",
            params:{}

        }).then(function successCallback(response){
            $scope.favourites = response.data;
            Object.keys($scope.favourites).forEach(function(key){
                $scope.favs.push(JSON.parse($scope.favourites[key]));
                $scope.maxFavPage = Math.ceil($scope.favs.length/20);
                angular.copy($scope.favs.slice(($scope.curFavPage - 1) * 20 , ($scope.curFavPage - 1) * 20 + 20), $scope.showFavPage);

            });
        });

    };

    $scope.initFav();


    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        }
    }

    function showPosition(position) {
        $scope.getCurLoc = true;
        $scope.localLat = position.coords.latitude;
        $scope.localLng = position.coords.longitude;
        console.log($scope.localLat);
        console.log($scope.localLng);
    }

    getLocation();


    $scope.search = function(){

        console.log($scope.getCurLoc);
        if($scope.getCurLoc != true){
            alert("please allow to know your current location, refresh the page and change the setting");
            return;
        }

        $scope.hideLocationsFlag = false;
        $scope.hideDetailsFlag = true;
        $scope.searchTimes = $scope.searchTimes + 1;

        $scope.nextTimes = 0;
        $scope.nextTokens = [];
        $scope.hasNextTokens = false;

        $scope.otherLocation = $("#startLoc").val();

        if($scope.form_startLocation == 'curLoc'){
            $scope.params = {keyword:$scope.keyword,type:$scope.type,lat:$scope.localLat,lng:$scope.localLng,distance:$scope.distance};
        }else{
            $scope.params = {keyword:$scope.keyword,type:$scope.type,location:$scope.otherLocation,distance:$scope.distance};
        }

        $http({
            method:"GET",
            url: $scope.backendUrl + '/getPlaces',
            params:$scope.params
        }).then(function successCallback(response){



            console.log(response);

            if(response.data.next_page_token != undefined){
                $scope.nextTokens.push(response.data.next_page_token);
                $scope.hasNextTokens = true;
            }else{
                $scope.hasNextTokens = false;
            }

            $scope.locations = response.data.results;


            console.log(response.data);

            angular.copy($scope.locations, $scope.firstPageLocations);

            $scope.getLocations= true;

        })

    };


    $scope.searchDetail = function(place_id,lat,lng) {

        $scope.doesClickDetail = true;
        $scope.lastTimePlaceId = place_id;
        $scope.lastTimelat = lat;
        $scope.lastTimelng = lng;

        $scope.hideLocationsFlag = true;
        $scope.endLat = lat;
        $scope.endLng = lng;


        if($scope.form_startLocation == 'curLoc'){
            $scope.startPoint = "Your location";
        }else{
            $scope.startPoint = $scope.otherLocation;
        }

        var directionsDisplay = new google.maps.DirectionsRenderer;
        var directionsService = new google.maps.DirectionsService;

        var destinationLocation = {lat: parseFloat($scope.endLat) , lng: parseFloat($scope.endLng) };


        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: destinationLocation
        });

        var marker = new google.maps.Marker({
            position: destinationLocation,
            map: map
        });

        var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('map'), {
                position: destinationLocation,
                pov: {
                    heading: 34,
                    pitch: 10
                }
            });

        map.setStreetView(panorama);
        panorama.setVisible(false);

        $("#changeView").click(function(){

            var toggle = panorama.getVisible();
            if (toggle == false) {
                $("#img_changView").attr('src','/images/Pegman.png');
                panorama.setVisible(true);
            } else {
                $("#img_changView").attr('src','/images/Map.png');
                panorama.setVisible(false);
            }
        });

        directionsDisplay.setMap(map);


        $("#getDirections").click(function(){

            $scope.startPoint = $("#map_tap_start").val();
            console.log($scope.startPoint);
            if($scope.startPoint == "Your location"){
                var startLocation = {lat: parseFloat($scope.localLat) , lng: parseFloat($scope.localLng) };
                directionsService.route({
                    origin: startLocation,
                    destination: destinationLocation,
                    travelMode: $scope.travelModel,
                    provideRouteAlternatives: true
                }, function(response, status) {
                    if (status == 'OK') {
                        console.log(response);
                        directionsDisplay.setDirections(response);
                        directionsDisplay.setPanel(document.getElementById('routesInfo'));
                    } else {
                        window.alert('Directions request failed due to ' + status);
                    }
                });
                marker.setVisible(false);

            }else{
                console.log($scope.startPoint);

                $http({
                    method:"GET",
                    url: $scope.backendUrl,
                    params:{location:$scope.startPoint}

                }).then(function successCallback(response){

                    console.log(response);
                    var startLocation = {lat: parseFloat(response.data.results[0].geometry.location.lat), lng: parseFloat(response.data.results[0].geometry.location.lng)};
                    console.log(startLocation);

                    directionsService.route({
                        origin: startLocation,
                        destination: destinationLocation,
                        travelMode: $scope.travelModel,
                        provideRouteAlternatives: true
                    }, function(response, status) {
                        if (status == 'OK') {
                            console.log(response);
                            directionsDisplay.setDirections(response);
                            directionsDisplay.setPanel(document.getElementById('routesInfo'));
                        } else {
                            window.alert('Directions request failed due to ' + status);
                        }
                    });
                    marker.setVisible(false);
                })
            }
        });

        var infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);

        service.getDetails({
            placeId: place_id
        }, function(place, status) {

            if (status === google.maps.places.PlacesServiceStatus.OK) {

                $scope.locationDetail = place;

                $scope.endPoint = $scope.locationDetail.name + ", " + $scope.locationDetail.formatted_address;

                $scope.twitterHref = encodeURI("https://twitter.com/intent/tweet?text=Check out " + $scope.locationDetail.name +
                    " located at ") + encodeURIComponent($scope.locationDetail.formatted_address) +
                    encodeURI(". Website: " +  $scope.locationDetail.website + " #TravelAndEntertainmentSearch");


                $scope.initReviews();
                $scope.photos = place.photos;

                if($scope.photos != undefined){
                    for(var i =0; i < $scope.photos.length; i++){
                        $scope.photos[i] = $scope.photos[i].getUrl({'maxWidth': 500, 'maxHeight':500 });
                    }
                }

                $scope.locationPriceLevel = $scope.locationDetail.price_level;




                var PriceLevel = "";
                for(var i = 0; i < parseInt($scope.locationPriceLevel); i++){
                    PriceLevel += "$";
                }

                $scope.locationPriceLevel = PriceLevel;

                $scope.locationRate = $scope.locationDetail.rating;

                if($scope.locationDetail.opening_hours != undefined){
                    $scope.dealWithOpenHours();
                }

                $scope.hideDetailsFlag = false;

                $scope.$apply();

            }
        });
    }


    $scope.goToResults = function(){
        $scope.hideLocationsFlag = false;
        $scope.hideDetailsFlag = true;
    }


    $scope.dealWithOpenHours= function(){

        $scope.day = moment().utcOffset($scope.locationDetail.utc_offset).format('dddd');
        $scope.openHourWeek = $scope.locationDetail.opening_hours.weekday_text;

        if(typeof $scope.openHourWeek === "undefined"){
            return;
        }

        var whichDay;
        for(var i = 0; i < $scope.openHourWeek.length; i++){
            if($scope.openHourWeek[i].indexOf($scope.day) != -1){
                whichDay = i;
                break;
            }
        }

        for(var i = 0; i < 7; i++){
            var breakPoint;
            for(var j = 0; j < $scope.openHourWeek[i].length ; j++){
                if($scope.openHourWeek[i].charAt(j) ===":"){
                    breakPoint = j;
                    break;
                }
            }

            $scope.openDay[i] = $scope.openHourWeek[i].substring(0, breakPoint);
            $scope.openTime[i] = $scope.openHourWeek[i].substring(breakPoint + 1);

        }

        $scope.currentOpenDay = $scope.openDay[whichDay];
        $scope.currentOpenTime = $scope.openTime[whichDay];

        if($scope.locationDetail.opening_hours.open_now == true){
            $scope.isOpen ="Open now: ";
            $scope.displayOpenTime = $scope.currentOpenTime
        }else{
            $scope.isOpen ="Closed ";
            $scope.displayOpenTime ="";
        }

        $scope.openDay.splice(whichDay,1);
        $scope.openTime.splice(whichDay,1);

    }



    $scope.searchNext= function(){

        $http({

            method:"GET",
            url: $scope.backendUrl + 'getPage',
            params:{pagetoken:$scope.nextTokens[$scope.nextTimes]}

        }).then(function successCallback(response){

            $scope.nextTimes ++;

            if(response.data.next_page_token != undefined){
                $scope.nextTokens.push(response.data.next_page_token);
                $scope.hasNextTokens = true;
            }else{
                $scope.hasNextTokens = false;
            }

            $scope.locations = response.data.results;
            console.log(response);
            console.log($scope.locations);
        })

    };




    $scope.searchPrev= function(){

        if($scope.nextTimes == 1){
            angular.copy($scope.firstPageLocations, $scope.locations);
            $scope.nextTimes --;
            $scope.hasNextTokens = true;
        }else{

            $http({

                method:"GET",
                url: $scope.backendUrl + 'getPage',
                params:{pagetoken:$scope.nextTokens[$scope.nextTimes - 2]}

            }).then(function successCallback(response){
                $scope.nextTimes --;
                if(response.data.next_page_token != undefined){
                    $scope.hasNextTokens = true;
                }else{
                    $scope.hasNextTokens = false;
                }
                $scope.locations = response.data.results;
                console.log(response);
                console.log($scope.locations);
            })
        }
    }

    $scope.searchFavPrev = function(){
        $scope.curFavPage --;
        angular.copy($scope.favs.slice(($scope.curFavPage - 1) * 20 , ($scope.curFavPage - 1) * 20 + 20), $scope.showFavPage);
    };

    $scope.searchFavNext = function(){
        $scope.curFavPage ++;
        angular.copy($scope.favs.slice(($scope.curFavPage - 1) * 20 , ($scope.curFavPage - 1) * 20 + 20), $scope.showFavPage);
        console.log($scope.showFavPage);
    }



    $scope.initReviews= function(){

        if($scope.locationDetail.reviews!= undefined){
            for(var i = 0; i < $scope.locationDetail.reviews.length; i++){
                var temp = $scope.locationDetail.reviews[i].rating;
                var tempArray = [];
                for (var j = 0; j < temp; j++ ){
                    tempArray[j] = j;
                }
                $scope.locationDetail.reviews[i].ratingArray = tempArray;

            }
        }

        angular.copy($scope.locationDetail.reviews, $scope.reviews);

        if($scope.locationDetail.reviews != undefined){
            for(var i = 0; i < $scope.reviews.length; i++){
                $scope.reviews[i].time = moment("1970-01-01T00:00:00").add($scope.reviews[i].time, 's').subtract(28800, 's').format('YYYY-MM-DD HH:mm:ss');
            }
        }



        for(var i = 0; i < $scope.locationDetail.address_components.length; i++ ){

            if($scope.locationDetail.address_components[i].types[0]== "administrative_area_level_1"){
                $scope.address_components_state = $scope.locationDetail.address_components[i].short_name;
            }

            if($scope.locationDetail.address_components[i].types[0]== "locality"){
                $scope.address_components_city = $scope.locationDetail.address_components[i].short_name;
            }

        }

        console.log($scope.address_components_state);
        console.log($scope.address_components_city);
        console.log($scope.locationDetail.formatted_address);

        $http({
            method:"GET",
            url:$scope.backendUrl + '/getYelpReviews',
            params:{name:$scope.locationDetail.name,
                address1:$scope.locationDetail.formatted_address.split(',')[0],
                city:$scope.address_components_city,
                state:$scope.address_components_state,
                country:'US'
            }

        }).then(function successCallback(response){
            console.log(response);

            $scope.yelpReviewsOriginal = response.data.reviews;

            if($scope.yelpReviewsOriginal != undefined){
                for(var i = 0; i < $scope.yelpReviewsOriginal.length; i++){
                    var temp = $scope.yelpReviewsOriginal[i].rating;
                    var tempArray = [];
                    for (var j = 0; j < temp; j++ ){
                        tempArray[j] = j;
                    }
                    $scope.yelpReviewsOriginal[i].ratingArray = tempArray;

                }

            }

            angular.copy($scope.yelpReviewsOriginal, $scope.yelpReviews);

            $scope.info_rating_with = Math.max($(".info_rating:first").width(), $scope.info_rating_with);
            $(".info_rating:first").width($scope.info_rating_with/5* $scope.locationDetail.rating);

        },function errorCallback(response){

        })


    }

    $scope.displayGoogleReviews= function(){

        $scope.googleReviewFlag = false;

        $scope.sortReviews($scope.reviewSortMode);

        $scope.reviewsKind = 'Google Reviews';

    }

    $scope.displayYelpReviews= function(){

        $scope.googleReviewFlag = true;

        $scope.sortReviews($scope.reviewSortMode);

        $scope.reviewsKind = 'Yelp Reviews';

    }


    $scope.sortReviews = function(mode){

        $scope.reviewSortMode = mode;

        if($scope.googleReviewFlag == false){

            angular.copy($scope.locationDetail.reviews, $scope.reviews);

            if(mode == "highest"){
                $scope.reviews.sort(function(a, b){ return b.rating - a.rating; });
                $scope.reviewsSortShow = "Highest Rating";
            }else if(mode == "lowest"){
                $scope.reviews.sort(function(a, b){ return a.rating - b.rating; });
                $scope.reviewsSortShow = "Lowest Rating";
            }else if(mode == "most"){
                $scope.reviews.sort(function(a, b){ return b.time - a.time; });
                $scope.reviewsSortShow = "Most Recent";

            }else if(mode == "last"){
                $scope.reviews.sort(function(a, b){ return a.time - b.time; });
                $scope.reviewsSortShow = "Last Recent";
            }else if(mode == "default"){
                $scope.reviewsSortShow = "Default Order";
            }

            for(var i = 0; i < $scope.reviews.length; i++){
                $scope.reviews[i].time = moment("1970-01-01T00:00:00").add($scope.reviews[i].time, 's').subtract(28800, 's').format('YYYY-MM-DD HH:mm:ss');
            }

        }else{

            angular.copy($scope.yelpReviewsOriginal, $scope.yelpReviews);

            if(mode == "highest"){
                $scope.yelpReviews.sort(function(a, b){ return b.rating - a.rating; });
                $scope.reviewsSortShow = "Highest Rating";
            }else if(mode == "lowest"){
                $scope.yelpReviews.sort(function(a, b){ return a.rating - b.rating; });
                $scope.reviewsSortShow = "Lowest Rating";
            }else if(mode == "most"){
                $scope.yelpReviews.sort(function(a, b){ return b.time_created.localeCompare(a.time_created); });
                $scope.reviewsSortShow = "Most Recent";
            }else if(mode == "last"){
                $scope.yelpReviews.sort(function(a, b){ return a.time_created.localeCompare(b.time_created); });
                $scope.reviewsSortShow = "Last Recent";
            }else if(mode == "default"){
                $scope.reviewsSortShow = "Default Order";
            }

        }

    }


    $scope.addFav = function(place_id,index){

        if(!$scope.favourites.hasOwnProperty(place_id)){
            $scope.favourites[place_id] = JSON.stringify($scope.locations[index]);
            $http.post('/renewFavourites', $scope.favourites);
            $scope.favs.push($scope.locations[index]);
        }

        $scope.maxFavPage = Math.ceil($scope.favs.length/20);
        angular.copy($scope.favs.slice(($scope.curFavPage - 1) * 20 , ($scope.curFavPage - 1) * 20 + 20), $scope.showFavPage);

    };



    $scope.addFavFromDetailTable = function(place_id){

        if(!$scope.favourites.hasOwnProperty(place_id)){
            for(var i = 0; i < $scope.locations.length; i++){
                if($scope.locations[i].place_id = place_id){
                    $scope.favourites[place_id] = JSON.stringify($scope.locations[i]);
                    $http.post('/renewFavourites', $scope.favourites);
                    $scope.favs.push($scope.locations[i]);
                    break;
                }
            }
        }
        $scope.maxFavPage = Math.ceil($scope.favs.length/20);
        angular.copy($scope.favs.slice(($scope.curFavPage - 1) * 20 , ($scope.curFavPage - 1) * 20 + 20), $scope.showFavPage);

    };

    $scope.removeFav = function(place_id,index){

        delete $scope.favourites[place_id];
        $http.post('/renewFavourites', $scope.favourites);

        $scope.favs.splice(($scope.curFavPage - 1) * 20 + index, 1);

        $scope.maxFavPage = Math.ceil($scope.favs.length/20);
        if($scope.maxFavPage == 0){
            $scope.maxFavPage = 1;
        }
        if($scope.curFavPage > $scope.maxFavPage ){
            $scope.curFavPage --;
        }
        angular.copy($scope.favs.slice(($scope.curFavPage - 1) * 20 , ($scope.curFavPage - 1) * 20 + 20), $scope.showFavPage);

    };



    $scope.isFav = function(place_id){
        if($scope.favourites.hasOwnProperty(place_id)){
            return true;
        }else{
            return false;
        }

    };

    $scope.clear= function(){

        // $scope.keyword="starbuck";

        $scope.keyword="";
        $scope.type="default";
        $scope.distance="10";

        $scope.isOpen ="";
        $scope.twitterText ="";

        $scope.pageNext ="";
        $scope.pagePrev ="";


        $scope.startLat="";
        $scope.startLng="";
        $scope.endLat="";
        $scope.endLng="";

        $scope.locations=[];

        $scope.openTime =[];
        $scope.openDay =[];
        $scope.firstPageLocations = [];

        $scope.nextTimes = 0;
        $scope.nextTokens = [];
        $scope.hasNextTokens = false;

        $scope.hideLocationsFlag = true;
        $scope.hideDetailsFlag = true;


        $scope.travelModel ="DRIVING";


        $scope.reviews=[];
        $scope.reviewsKind = 'Google Reviews';
        $scope.reviewsSortShow ='Default Order';
        $scope.yelpReviews=[];
        $scope.reviewSortMode="default";
        $scope.googleReviewFlag = false;


        $scope.form_startLocation = 'curLoc';
        $scope.doesClickDetail = false;
        $scope.getLocations= false;
    }

}

app.controller("myCtrl",Controller);