"use client";

import { useState, useEffect } from "react";

interface Payment {
  id: string;
  date: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  provider: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service: {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
  };
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  statusDistribution: Array<{
    paymentStatus: string;
    count: number;
    totalRevenue: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
}

interface PaymentManagementProps {
  onDataChange?: () => void;
}

export default function PaymentManagement({
  onDataChange,
}: PaymentManagementProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState<{ statuses: string[] }>({
    statuses: [],
  });
  const [refundingPayment, setRefundingPayment] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/payments?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPayments(data.payments);
        setPagination(data.pagination);
        setStats(data.stats);
        setFilters(data.filters);
      } else {
        setError(data.error || "Failed to fetch payments");
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm, statusFilter]);

  const handlePaymentAction = async (
    bookingId: string,
    action: string,
    amount?: number
  ) => {
    try {
      setRefundingPayment(bookingId);
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ action, bookingId, amount }),
      });

      const data = await response.json();

      if (response.ok) {
        fetchPayments();
        onDataChange?.();
        alert(data.message || "Action completed successfully");
      } else {
        setError(data.error || `Failed to ${action} payment`);
      }
    } catch (error) {
      setError("Network error occurred");
    } finally {
      setRefundingPayment(null);
    }
  };

  const handleRefund = async (bookingId: string, totalPrice: number) => {
    const refundAmount = prompt(
      `Enter refund amount (max: $${totalPrice})`,
      totalPrice.toString()
    );
    if (refundAmount === null) return;

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > totalPrice) {
      alert("Invalid refund amount");
      return;
    }

    await handlePaymentAction(bookingId, "refund", amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Payment Management
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Monitor transactions, process refunds, and view payment analytics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Status</option>
            {filters.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats.totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">#</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Transactions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalTransactions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">%</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Paid Transactions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.statusDistribution.find(
                      (s) => s.paymentStatus === "paid"
                    )?.count || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">↺</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Refunded
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.statusDistribution.find(
                      (s) => s.paymentStatus === "refunded"
                    )?.count || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {payments.map((payment) => (
            <li key={payment.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {payment.service.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {payment.user.name} ({payment.user.email})
                      </p>
                      <p className="text-sm text-gray-600">
                        Provider: {payment.provider.name} (
                        {payment.provider.email})
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Category: {payment.service.category}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-gray-900">
                        ${payment.totalPrice}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        payment.paymentStatus
                      )}`}
                    >
                      {payment.paymentStatus}
                    </span>
                    <span className="text-sm text-gray-500">
                      Service Price: ${payment.service.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                {payment.paymentStatus === "paid" && (
                  <>
                    <button
                      onClick={() =>
                        handleRefund(payment.id, payment.totalPrice)
                      }
                      disabled={refundingPayment === payment.id}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-red-300 hover:bg-purple-200 disabled:opacity-50"
                    >
                      {refundingPayment === payment.id
                        ? "Processing..."
                        : "Refund"}
                    </button>
                  </>
                )}
                {payment.paymentStatus === "pending" && (
                  <button
                    onClick={() => handlePaymentAction(payment.id, "mark_paid")}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {payments.length === 0 && !loading && (
          <div className="px-6 py-8 text-center text-gray-500">
            No payments found
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm">
              Page {currentPage} of {pagination.pages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Monthly Revenue Chart (if data available) */}
      {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Revenue (Last 12 Months)
          </h4>
          <div className="space-y-2">
            {stats.monthlyRevenue.slice(0, 6).map((month, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
              >
                <span className="text-sm text-gray-600">
                  {new Date(month.month).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    ${Number(month.revenue).toFixed(2)}
                  </span>
                  <span className="text-gray-500 ml-2">
                    ({month.count} transactions)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
