"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "provider" | "admin";
  isVerified: boolean;
  createdAt: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  provider: {
    name: string;
    email: string;
  };
  isActive: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

interface Booking {
  id: string;
  date: string;
  status: string;
  totalPrice: number;
  service: {
    name: string;
  };
  user: {
    name: string;
    email: string;
  };
  provider: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "services" | "bookings">(
    "users"
  );
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        // Note: This would need a new admin API endpoint to get all users
        // For now, we'll show a placeholder
        setUsers([]);
      } else if (activeTab === "services") {
        const response = await fetch("/api/services", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setServices(data.services || []);
      } else if (activeTab === "bookings") {
        const response = await fetch("/api/bookings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (
    serviceId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (response.ok) {
        setServices(
          services.map((service) =>
            service.id === serviceId
              ? { ...service, isActive: !currentStatus }
              : service
          )
        );
      }
    } catch (error) {
      console.error("Error updating service:", error);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Access denied. Admin privileges required.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: "users", name: "Users", count: users.length },
    { id: "services", name: "Services", count: services.length },
    { id: "bookings", name: "Bookings", count: bookings.length },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage users, services, and bookings across the platform
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-6 py-4">
                  <p className="text-gray-500">
                    User management features coming soon...
                  </p>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {services.map((service) => (
                    <li key={service.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {service.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {service.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                ${service.price}
                              </div>
                              <div className="text-sm text-gray-500">
                                {service.category}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <span>👤 {service.provider.name}</span>
                            <span>
                              ⭐ {service.rating.toFixed(1)} (
                              {service.reviewCount})
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                service.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {service.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() =>
                            toggleServiceStatus(service.id, service.isActive)
                          }
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white ${
                            service.isActive
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {service.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <li key={booking.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {booking.service.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Customer: {booking.user.name} (
                                {booking.user.email})
                              </p>
                              <p className="text-sm text-gray-600">
                                Provider: {booking.provider.name} (
                                {booking.provider.email})
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                ${booking.totalPrice}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(booking.date).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : booking.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : booking.status === "in_progress"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {booking.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
