"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Booking {
  id: string;
  status: string;
  service: {
    id: string;
    name: string;
  };
  provider: {
    name: string;
  };
}

export default function ReviewPage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const params = useParams();
  const serviceId = params.id as string;
  const bookingId = params.bookingId as string;
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (bookingId && user) {
      fetchBookingDetails();
    }
  }, [bookingId, user]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setBooking(data.booking);
      } else {
        setError(data.error || "Booking not found");
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: bookingId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Review submitted successfully!");
        router.push("/dashboard/bookings");
      } else {
        setError(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Validate required parameters
  if (!serviceId || !bookingId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Invalid review URL. Missing required parameters.
        </p>
        <Link
          href="/dashboard/bookings"
          className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center h-[80vh] bg-gray-50 px-4">
        <div className="bg-green-300 shadow-lg rounded-lg p-8 max-w-md w-full text-center">
          <p className="text-yellow-500 text-lg font-semibold mb-4">
            {error || "Booking not found"}
          </p>
          <Link
            href="/dashboard/bookings"
            className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-500 transition-colors duration-200"
          >
            Back to bookings
          </Link>
        </div>
      </div>
    );
  }

  if (booking.status !== "completed") {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">You can only review completed bookings</p>
        <Link
          href="/dashboard/bookings"
          className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Leave a Review
        </h1>

        {/* Service Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {booking.service.name}
          </h2>
          <p className="text-gray-600">Provided by {booking.provider.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rating
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? "text-yellow-400" : "text-gray-300"
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Review (optional)
            </label>
            <textarea
              id="comment"
              rows={4}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Share your experience with this service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/bookings"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
