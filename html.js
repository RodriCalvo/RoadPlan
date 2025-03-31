import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px"
};

const center = {
  lat: -34.6037,
  lng: -58.3816
};

const MapComponent = () => {
  return (
    <LoadScript googleMapsApiKey="AIzaSyCC3AO9wWo39j38UP4cAJ5ZF1Hyjf4clOo">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;