import React, { useState, useEffect, useRef } from "react";
import GoogleMapReact from "google-map-react";
import useSupercluster from "use-supercluster";
import axios from "axios";
import useTranslation from "../../hooks/useTranslation/useTranslation";
import {
  PageContent,
  LocationContainer,
  ClusterContainer,
  LocationCard,
  CardImg,
  CardText,
  LocationName,
  LocationP,
  // CardBtnContainer,
  // LeftCardBtnContainer,
  // RightCardBtnContainer,
  MapMenu,
  LeftMenu,
  RightMenu,
  DestinationButton,
  DestinationSelectedH3,
  DestinationUlHidden,
  DestinationLIHidden,
  DestinationVisible,
  Arrow,
  RangeLabel,
  RangeInput,
} from "./MapElements";
import MobileTopContainer from "./Components/MobileTopContainer/MobileTopContainer";
// import InternetIcon from "../../assets/svg/Internet.svg";

// import HeartIcon from "../../assets/svg/Heart.svg";
// import SaveIcon from "../../assets/svg/Save.svg";
import { motion } from "framer-motion";
import { ReactComponent as MapMenuIcone } from "./MapMenuIcone.svg";
import { MdLocationOn } from "react-icons/md";
import { PageContentGlobal } from "../../GlobalStyles";
import getLocationInformation from "../../assets/utilities/getLocationInformation";
import getWilayaInformation from "../../assets/utilities/getWilayaInformation";
import useWindowSize from "../../hooks/useWindowSize";
import MobileBottomContainer from "./Components/MobileBottomContainer/MobileBottomContainer";
import { generalAPILink } from "../../assets/Variables/Links";
import { useLocation } from "react-router-dom";
const Map = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const mapRef = useRef();
  const [bounds, setBounds] = useState(null);
  const [zoom, setZoom] = useState(location.state ? 17 : 7);
  const [lat, setLat] = useState(
    location?.state ? parseFloat(location.state.lat) : 36.7597373
  );
  const [lng, setLng] = useState(
    location?.state ? parseFloat(location.state.lng) : 2.5762507
  );
  const [showWilayas, setShowWilayas] = useState(false);
  const [locationsToDisplay, setLocationsToDisplay] = useState([]);
  const [selectedOption, setSelectedOption] = useState({
    name: t("MapPage.Destination"),
    id: null,
  });
  const options = {
    minZoom: 3,
    maxZoom: 18,
  };
  const [wilayas, setWilayas] = useState([]);
  const isDesktop = useWindowSize();
  useEffect(() => {
    axios
      .get(`${generalAPILink}/wilaya`)
      .then((response) => {
        getWilayaInformation(response.data.data, setWilayas, true);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(() => {
    axios
      .get(`${generalAPILink}/location`)
      .then((response) => {
        getLocationInformation(response.data.data, setLocationsToDisplay, true);
        getLocationInformation(response.data.data, setLocations, true);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const points = locationsToDisplay.map((location) => ({
    type: "Feature",
    properties: {
      cluster: false,
      locationId: location.id_location,
      category: location.id_type_location,
    },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(location.longitude),
        parseFloat(location.latitude),
      ],
    },
    informations: location,
  }));

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 20 },
  });
  const wilayaFilter = (wilaya) => {
    if (wilaya !== null) {
      setLat(parseFloat(wilaya.latitude));
      setLng(parseFloat(wilaya.longitude));
      setZoom(10);
      let filtredLocations = locations.filter((location) => {
        if (location.id_wilaya === wilaya.id_wilaya) {
          return location;
        } else return null;
      });
      setLocationsToDisplay(filtredLocations);
      setSelectedOption({
        name: wilaya.translatedName,
        id: wilaya.id_wilaya,
      });
      setShowWilayas(false);
    } else {
      setLocationsToDisplay(locations);
      setShowWilayas(false);
      setSelectedOption({
        name: t("MapPage.Destination"),
        id: null,
      });
    }
  };
  return (
    <PageContentGlobal fixed={true} isMobileMap={!isDesktop}>
      <PageContent>
        {!isDesktop && (
          <MobileTopContainer wilayas={wilayas} wilayaFilter={wilayaFilter} />
        )}
        <GoogleMapReact
          bootstrapURLKeys={{
            key: "AIzaSyBxr1HboDoiuuX8XAZOLXi_aVWxW3CcGd4",
          }}
          options={options}
          defaultCenter={{ lat: lat, lng: lng }}
          center={{ lat: lat, lng: lng }}
          defaultZoom={zoom}
          zoom={zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map }) => {
            mapRef.current = map;
          }}
          onChange={({ zoom, bounds }) => {
            setZoom(zoom);
            setBounds([
              bounds.nw.lng,
              bounds.se.lat,
              bounds.se.lng,
              bounds.nw.lat,
            ]);
          }}
        >
          {clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const { cluster: isCluster, point_count: pointCount } =
              cluster.properties;
            const loca = cluster.informations;
            if (isCluster) {
              return (
                <ClusterContainer
                  key={`cluster-${cluster.id}`}
                  lat={latitude}
                  lng={longitude}
                  style={{
                    width: `${10 + (pointCount / points.length) * 100}px`,
                    height: `${10 + (pointCount / points.length) * 100}px`,
                  }}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20
                    );
                    mapRef.current.setZoom(expansionZoom);
                    mapRef.current.panTo({ lat: latitude, lng: longitude });
                  }}
                >
                  {pointCount}
                </ClusterContainer>
              );
            }

            return (
              <LocationContainer
                to={{
                  pathname: `/location/${loca.id_location}`,
                  state: { destination: loca },
                }}
                key={`location-${loca.id_location}`}
                lat={latitude}
                lng={longitude}
                onMouseOver={() => {
                  setCurrentLocation(loca.id_location);
                }}
                onMouseOut={() => {
                  setCurrentLocation(null);
                }}
              >
                <MdLocationOn
                  size={isDesktop ? "72" : "56"}
                  color="#4BCB02"
                  style={{ transform: "translate(-50%, -50%)" }}
                />

                {isDesktop && currentLocation === loca.id_location && (
                  <LocationCard>
                    <CardImg src={loca.cover_pic} />
                    <CardText>
                      <LocationName>{loca.name}</LocationName>
                      <LocationP>{loca.description}</LocationP>
                    </CardText>
                    {/* <CardBtnContainer>
                      <LeftCardBtnContainer>
                        <img src={HeartIcon} />
                      </LeftCardBtnContainer>
                      <RightCardBtnContainer>
                        <img src={SaveIcon} />
                      </RightCardBtnContainer>
                    </CardBtnContainer> */}
                  </LocationCard>
                )}
              </LocationContainer>
            );
          })}
        </GoogleMapReact>
        {isDesktop ? (
          <MapMenu
            onMouseLeave={() => {
              setShowWilayas(false);
            }}
          >
            <LeftMenu>
              <MapMenuIcone />
              <DestinationButton>
                <DestinationVisible
                  onMouseEnter={() => {
                    setShowWilayas(true);
                  }}
                >
                  <DestinationSelectedH3>
                    {selectedOption.name}
                  </DestinationSelectedH3>
                  <Arrow />
                </DestinationVisible>
                <DestinationUlHidden as={motion.div} showWilayas={showWilayas}>
                  <DestinationLIHidden
                    onClick={() => {
                      wilayaFilter(null);
                    }}
                  >
                    --------
                  </DestinationLIHidden>
                  {wilayas.map((wilaya) => {
                    return (
                      <DestinationLIHidden
                        onClick={() => {
                          wilayaFilter(wilaya);
                        }}
                      >
                        {wilaya.translatedName}
                      </DestinationLIHidden>
                    );
                  })}
                </DestinationUlHidden>
              </DestinationButton>
            </LeftMenu>
            <RightMenu>
              <RangeLabel for="volume">{t("MapPage.Perimeter")}</RangeLabel>
              <RangeInput
                type="range"
                id="volume"
                name="volume"
                className="input"
                defaultValue={zoom}
                min="3"
                max="18"
                onChange={(e) => {
                  mapRef.current.setZoom(parseInt(e.target.value));
                }}
              />
            </RightMenu>
          </MapMenu>
        ) : (
          <MobileBottomContainer
            zoom={zoom}
            mapRef={mapRef}
            locationsToDisplay={locationsToDisplay}
            setZoom={setZoom}
            setLng={setLng}
            setLat={setLat}
          />
        )}
      </PageContent>
    </PageContentGlobal>
  );
};

export default Map;
