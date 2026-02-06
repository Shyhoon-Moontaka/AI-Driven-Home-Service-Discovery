"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ReviewModal from "@/components/ReviewModal";

interface Recommendation {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  location: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  provider: {
    name: string;
  };
  relevanceScore: number;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedService, setSelectedService] = useState<Recommendation | null>(
    null
  );
  const { user } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/recommendations?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setSearched(true);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReviews = (service: Recommendation) => {
    setSelectedService(service);
  };

  const handleCloseReviews = () => {
    setSelectedService(null);
  };

  const exampleQueries = [
    "house cleaning service",
    "plumbing repair",
    "personal trainer",
    "home tutoring",
    "car maintenance",
    "hair styling",
    "garden landscaping",
    "electrical work",
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          AI-Powered Recommendations
        </h1>
        <p className="mt-3 text-xl text-gray-500 sm:mt-4">
          Discover services tailored to your needs using intelligent matching
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you're looking for..."
            className="pl-3 flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find Services"}
          </button>
        </form>
      </div>

      {/* Example Queries */}
      {!searched && (
        <div className="max-w-4xl mx-auto mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Try these examples:
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="text-left p-3 border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <span className="text-sm text-gray-700">{example}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Finding the best matches...</p>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No recommendations found. Try different keywords.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Found {recommendations.length} recommendation
                  {recommendations.length !== 1 ? "s" : ""} for "{query}"
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {service.name}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {Math.round(service.relevanceScore * 100)}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {service.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>💰 ${service.price}</span>
                          <span>⏱️ {service.duration} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>
                            ⭐ {service.rating.toFixed(1)} (
                            {service.reviewCount})
                          </span>
                          <span>📍 {service.location}</span>
                        </div>
                        <div>👤 {service.provider.name}</div>
                      </div>

                      {service.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {service.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {service.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{service.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

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
            </>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="max-w-4xl mx-auto mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How AI Recommendations Work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold text-xl">1</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Describe Your Need
            </h3>
            <p className="text-gray-600">
              Tell us what service you're looking for in natural language
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold text-xl">2</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              AI Analysis
            </h3>
            <p className="text-gray-600">
              Our AI analyzes service descriptions, tags, and categories to find
              matches
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-indigo-600 font-bold text-xl">3</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Personalized Results
            </h3>
            <p className="text-gray-600">
              Get ranked recommendations with relevance scores to help you
              choose
            </p>
          </div>
        </div>
      </div>

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
