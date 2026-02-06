"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AdminRoute from "@/components/AdminRoute";
import UserManagement from "@/components/admin/UserManagement";
import ServiceManagement from "@/components/admin/ServiceManagement";
import BookingManagement from "@/components/admin/BookingManagement";
import PaymentManagement from "@/components/admin/PaymentManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "users" | "services" | "bookings" | "payments"
  >("users");
  const { user } = useAuth();

  const tabs = [
    {
      id: "users",
      name: "Users",
      icon: "👥",
      description: "Manage user accounts and roles",
    },
    {
      id: "services",
      name: "Services",
      icon: "🛠️",
      description: "Manage service listings",
    },
    {
      id: "bookings",
      name: "Bookings",
      icon: "📅",
      description: "Monitor service bookings",
    },
    {
      id: "payments",
      name: "Payments",
      icon: "💳",
      description: "Track transactions and revenue",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "services":
        return <ServiceManagement />;
      case "bookings":
        return <BookingManagement />;
      case "payments":
        return <PaymentManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <AdminRoute>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Description */}
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            {tabs.find((tab) => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="mt-8">{renderTabContent()}</div>
      </div>
    </AdminRoute>
  );
}
