"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  location: string;
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  tags: string[];
  rating: number;
  reviewCount: number;
  provider: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
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

export default function ServiceDetailPage() {
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchServiceDetails();
    }
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      const response = await fetch(`/api/services/${id}`);
      const data = await response.json();
      if (response.ok) {
        setService(data.service);
        setReviews(data.reviews);
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
      setError("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setBookingLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          serviceId: id,
          date: bookingDate,
          notes: bookingNotes,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Booking created successfully!");
        router.push("/dashboard/bookings");
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setError("Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || "Service not found"}</p>
        <Link
          href="/"
          className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block"
        >
          Back to services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Service Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            <p className="text-lg text-gray-600 mt-2">{service.description}</p>
            <div className="flex items-center mt-4 space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {service.category}
              </span>
              <div className="flex items-center">
                <span className="text-yellow-400">⭐</span>
                <span className="ml-1 text-sm text-gray-600">
                  {service.rating.toFixed(1)} ({service.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              ${service.price}
            </div>
            <div className="text-sm text-gray-500">
              {service.duration} minutes
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Provider Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Service Provider
            </h2>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {service.provider.name}
              </p>
              <p>
                <strong>Email:</strong> {service.provider.email}
              </p>
              <p>
                <strong>Phone:</strong> {service.provider.phone}
              </p>
              <p>
                <strong>Address:</strong> {service.provider.address}
              </p>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Availability
            </h2>
            <div className="space-y-2">
              <p>
                <strong>Days:</strong> {service.availability.days.join(", ")}
              </p>
              <p>
                <strong>Hours:</strong> {service.availability.startTime} -{" "}
                {service.availability.endTime}
              </p>
              <p>
                <strong>Location:</strong> {service.location}
              </p>
            </div>
          </div>

          {/* Tags */}
          {service.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="ml-1 font-medium">
                          {review.rating}/5
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          by {review.user.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Book This Service
            </h2>
            {user ? (
              <form onSubmit={handleBooking} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Select Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="date"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Any special instructions..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {bookingLoading ? "Booking..." : "Book Now"}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Please sign in to book this service
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign In to Book
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
