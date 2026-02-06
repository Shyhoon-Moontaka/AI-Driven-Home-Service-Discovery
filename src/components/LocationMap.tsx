"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

// Dynamically import Leaflet components (SSR safe)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false },
);

// Leaflet instance (client only)
let L: any = null;
if (typeof window !== "undefined") {
  L = require("leaflet");
}

interface LocationMapProps {
  showLocationMap: boolean;
  targetId: any;
  onClose: () => void;
  selectedBookingForMap: any;
}

export default function LocationMap({
  showLocationMap,
  targetId,
  onClose,
  selectedBookingForMap,
}: LocationMapProps) {
  const { user, token } = useAuth();

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [targetLocation, setTargetLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get current user location
  const getCurrentLocation = async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.log("Geolocation error:", error);
            resolve(null);
          },
          { enableHighAccuracy: true },
        );
      } else {
        resolve(null);
      }
    });
  };

  // Update current user's location in Redis
  const updateUserLocation = async (
    token: string,
    latitude: number,
    longitude: number,
  ) => {
    try {
      await fetch("/api/location", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });
      setUserLocation({ lat: latitude, lng: longitude });
    } catch (error) {
      console.error("Failed to update user location:", error);
    }
  };

  // Fetch target user's location from API
  const fetchTargetLocation = async (targetId: string) => {
    try {
      const res = await fetch(`/api/location?targetId=${targetId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch target location");

      const data = await res.json();
      setTargetLocation({ lat: data.latitude, lng: data.longitude });
    } catch (error) {
      console.error("Error fetching target location:", error);
      setTargetLocation(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const location = await getCurrentLocation();
      if (location) {
        await updateUserLocation(
          token as string,
          location.latitude,
          location.longitude,
        );
      }

      if (targetId) {
        await fetchTargetLocation(targetId);
      }
    };

    init();

    const interval = setInterval(init, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="w-screen h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.role === "admin"
              ? "Find Your User/Provider"
              : user?.role === "provider"
                ? "Customer Location"
                : "Provider Location"}
          </h3>

          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 w-screen h-screen">
          {userLocation && targetLocation ? (
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={15}
              className="w-screen h-screen"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {/* Target Marker */}
              {targetLocation && L && (
                <Marker
                  position={[targetLocation.lat, targetLocation.lng]}
                  icon={
                    new L.Icon({
                      iconUrl:
                        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                      shadowUrl:
                        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                    })
                  }
                >
                  <Popup>
                    <h1>
                      {selectedBookingForMap?.user?.name ||
                        selectedBookingForMap?.provider?.name ||
                        ""}
                    </h1>
                    <p>
                      {selectedBookingForMap?.user?.phone ||
                        selectedBookingForMap?.provider?.phone ||
                        ""}
                    </p>
                  </Popup>
                </Marker>
              )}

              {/* Polyline between user and target */}
              {userLocation && targetLocation && (
                <Polyline
                  positions={[
                    [userLocation.lat, userLocation.lng],
                    [targetLocation.lat, targetLocation.lng],
                  ]}
                  pathOptions={{
                    color: "black",
                    weight: 3,
                    dashArray: "8,8",
                  }}
                />
              )}
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading map...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
