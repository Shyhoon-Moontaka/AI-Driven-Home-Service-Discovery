"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ReviewModal from "@/components/ReviewModal";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  location: string;
  rating: number;
  reviewCount: number;
  provider: {
    name: string;
  } | null;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  user: {
    name: string;
  };
  createdAt: string;
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchServices();
  }, [searchQuery, category, location]);

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (category) params.append("category", category);
      if (location) params.append("location", location);

      const response = await fetch(`/api/services?${params}`);
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReviews = (service: Service) => {
    setSelectedService(service);
  };

  const handleCloseReviews = () => {
    setSelectedService(null);
  };

  const categories = [
    "Cleaning",
    "Plumbing",
    "Electrical",
    "Gardening",
    "Tutoring",
    "Fitness",
    "Beauty",
    "Automotive",
    "Other",
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Find Local Services
        </h1>
        <p className="mt-3 text-xl text-gray-500 sm:mt-4">
          Book trusted professionals for all your service needs
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search Services
            </label>
            <input
              type="text"
              id="search"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., house cleaning, plumbing"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="City or area"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No services found. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {service.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {service.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {service.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      ${service.price}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      / {service.duration}min
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">
                      ⭐ {service.rating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      ({service.reviewCount})
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  📍 {service.location}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  👤 {service?.provider?.name}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/services/${service.id}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    View Details
                  </Link>
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => handleViewReviews(service)}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Reviews ({service.reviewCount})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action for Providers */}
      {user?.role === "provider" && (
        <div className="mt-12 bg-indigo-50 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to offer your services?
          </h2>
          <p className="text-gray-600 mb-6">
            Create and manage your service listings to reach more customers.
          </p>
          <Link
            href="/dashboard/provider"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Manage My Services
          </Link>
        </div>
      )}

      {/* Review Modal */}
      {selectedService && (
        <ReviewModal
          serviceId={selectedService.id}
          serviceName={selectedService.name}
          isOpen={!!selectedService}
          onClose={handleCloseReviews}
        />
      )}
    </div>
  );
}
