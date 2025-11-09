import React, { useState, useMemo, Suspense } from 'react';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MetricCard from '../components/MetricCard';
import PieChartComponent from '../components/Charts/PieChartComponent';
import BarChartComponent from '../components/Charts/BarChartComponent';
import LineChartComponent from '../components/Charts/LineChartComponent';
import HeatmapTable from '../components/Charts/HeatmapTable';
import DataSourcePanel from '../components/DataSourcePanel';
import DataTable from '../components/DataTable';
import AnalysisSection from '../components/AnalysisSection';
import { useFilters } from '../hooks/useFilters';
import {
  calculateKPIs,
  getRequestTypeData,
  getAvgTimeByType,
  getTrendData,
  getHeatmapData,
  getDescriptiveStats,
} from '../utils/calculations';

const Dashboard = ({ user, data, onLogout }) => {
  const { filters, filteredRequests, updateFilter } = useFilters(data?.requests || [], user);

  // Calculate all metrics
  const kpis = useMemo(() => {
    return calculateKPIs(filteredRequests);
  }, [filteredRequests]);

  const chartData = useMemo(() => {
    return {
      pieData: getRequestTypeData(filteredRequests),
      barData: getAvgTimeByType(filteredRequests),
      trendData: getTrendData(filteredRequests),
      heatmapData: getHeatmapData(filteredRequests),
    };
  }, [filteredRequests]);

  const stats = useMemo(() => {
    return getDescriptiveStats(filteredRequests);
  }, [filteredRequests]);

  const handleSearch = (query) => {
    updateFilter('search', query);
  };

  const handleExport = (dataToExport) => {
    console.log('Exporting data:', dataToExport);
    // In a real application, this would download a CSV file
    alert(`Exporting ${dataToExport.length} requests to CSV...`);
  };

  // Calculate trend indicators (simplified - in real app, compare with previous period)
  const getTrend = (current, previous = current * 0.9) => {
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      value: Math.abs(change).toFixed(1),
    };
  };

  const metricCards = [
    {
      icon: FileText,
      label: 'Total Requests',
      value: kpis.totalRequests.toLocaleString(),
      trend: getTrend(kpis.totalRequests),
      trendLabel: 'vs last month',
      iconColor: 'bg-blue-500',
    },
    {
      icon: Clock,
      label: 'Total Hours Spent',
      value: kpis.totalHours.toLocaleString(),
      trend: getTrend(kpis.totalHours),
      trendLabel: 'vs last month',
      iconColor: 'bg-purple-500',
    },
    {
      icon: DollarSign,
      label: 'Total Cost',
      value: `$${kpis.totalCost.toLocaleString()}`,
      trend: getTrend(kpis.totalCost),
      trendLabel: 'vs last month',
      iconColor: 'bg-green-500',
    },
    {
      icon: TrendingUp,
      label: 'Avg Processing Time',
      value: `${kpis.avgProcessingTime} min`,
      trend: getTrend(kpis.avgProcessingTime, kpis.avgProcessingTime * 1.1),
      trendLabel: 'vs last month',
      iconColor: 'bg-orange-500',
    },
    {
      icon: CheckCircle,
      label: 'Approval Rate',
      value: `${kpis.approvalRate}%`,
      trend: getTrend(kpis.approvalRate, kpis.approvalRate * 0.95),
      trendLabel: 'vs last month',
      iconColor: 'bg-green-500',
    },
    {
      icon: XCircle,
      label: 'Rejection Rate',
      value: `${kpis.rejectionRate}%`,
      trend: getTrend(kpis.rejectionRate, kpis.rejectionRate * 0.9),
      trendLabel: 'vs last month',
      iconColor: 'bg-red-500',
    },
    {
      icon: AlertCircle,
      label: 'Pending Requests',
      value: kpis.pendingRequests.toLocaleString(),
      trend: getTrend(kpis.pendingRequests),
      trendLabel: 'vs last month',
      iconColor: 'bg-yellow-500',
    },
    {
      icon: AlertTriangle,
      label: 'Error Rate',
      value: `${kpis.errorRate}%`,
      trend: getTrend(kpis.errorRate, kpis.errorRate * 0.9),
      trendLabel: 'vs last month',
      iconColor: 'bg-red-500',
    },
  ];

  if (!data || !data.requests) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} onSearch={handleSearch} />
      <Sidebar user={user} filters={filters} onFilterChange={updateFilter} />
      
      <main className="ml-64 mt-20 p-4 md:p-6">
        {/* Small verification / status bar */}
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">Data source: <span className="font-medium">{data.source || 'unknown'}</span></div>
              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">Visible requests: <span className="font-medium">{filteredRequests.length}</span></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500">Showing data filtered for <span className="font-semibold">{user?.name}</span></div>
              {/* Data upload / diagnostics panel */}
              <div>
                <Suspense fallback={<div className="text-xs text-gray-500">Loading...</div>}>
                  <DataSourcePanel currentSource={data.source} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Section A: KPI Metric Cards */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricCards.map((card, index) => (
                <MetricCard
                  key={index}
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  trend={card.trend.direction}
                  trendValue={card.trend.value}
                  trendLabel={card.trendLabel}
                  iconColor={card.iconColor}
                />
              ))}
            </div>
          </section>

          {/* Section B: Charts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PieChartComponent data={chartData.pieData} title="Requests by Type" />
              <BarChartComponent 
                data={chartData.barData} 
                title="Avg Processing Time by Type"
                xKey="name"
                yKey="value"
              />
              <LineChartComponent 
                data={chartData.trendData} 
                title="Workload Trend (6 Months)"
                xKey="month"
                yKey="requests"
              />
            </div>
          </section>

          {/* Section C: Heatmap Table */}
          <section>
            <HeatmapTable data={chartData.heatmapData} />
          </section>

          {/* Section D: Statistical Analysis */}
          <section>
            <AnalysisSection stats={stats} requests={filteredRequests} />
          </section>

          {/* Section E: Data Table */}
          <section>
            <DataTable data={filteredRequests} onExport={handleExport} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
