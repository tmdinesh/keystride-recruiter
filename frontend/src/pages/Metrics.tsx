import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { apiService } from '../services/api';
import type { Metrics } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export const Metrics = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiService.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading || !metrics) {
    return <div className="space-y-6">Loading metrics...</div>;
  }

  const confusionMatrixData = [
    { label: 'Strong', values: metrics.confusionMatrix[0] },
    { label: 'Medium', values: metrics.confusionMatrix[1] },
    { label: 'Weak', values: metrics.confusionMatrix[2] },
    { label: 'Reject', values: metrics.confusionMatrix[3] },
  ];

  const performanceData = [
    { metric: 'Precision', value: metrics.precision * 100 },
    { metric: 'Recall', value: metrics.recall * 100 },
    { metric: 'Top 5 Accuracy', value: metrics.top5Accuracy * 100 },
  ];

  const getColor = (value: number) => {
    if (value >= 0.9) return '#10b981';
    if (value >= 0.8) return '#3b82f6';
    if (value >= 0.7) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Evaluation Metrics</h1>
        <p className="text-gray-500 mt-1">AI model performance and fairness metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Precision</CardTitle>
            <CardDescription>Strong-fit detection accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: getColor(metrics.precision) }}>
              {(metrics.precision * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recall</CardTitle>
            <CardDescription>True positive rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: getColor(metrics.recall) }}>
              {(metrics.recall * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top 5 Accuracy</CardTitle>
            <CardDescription>Accuracy in top 5 predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: getColor(metrics.top5Accuracy) }}>
              {(metrics.top5Accuracy * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Model accuracy across different metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.value / 100)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Confusion Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Confusion Matrix</CardTitle>
          <CardDescription>Prediction vs actual classification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700">
                    Actual \ Predicted
                  </th>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700">
                    Strong
                  </th>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700">
                    Medium
                  </th>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700">
                    Weak
                  </th>
                  <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700">
                    Reject
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.confusionMatrix.map((row, rowIdx) => {
                  const labels = ['Strong', 'Medium', 'Weak', 'Reject'];
                  const maxValue = Math.max(...row);
                  return (
                    <tr key={rowIdx}>
                      <td className="border border-gray-300 px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700">
                        {labels[rowIdx]}
                      </td>
                      {row.map((value, colIdx) => {
                        const intensity = value / maxValue;
                        const bgColor = `rgba(59, 130, 246, ${0.2 + intensity * 0.6})`;
                        return (
                          <td
                            key={colIdx}
                            className="border border-gray-300 px-4 py-2 text-center font-semibold"
                            style={{ backgroundColor: bgColor }}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Fairness Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fairness Score</CardTitle>
            <CardDescription>Bias evaluation score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: getColor(metrics.fairnessScore) }}>
              {(metrics.fairnessScore * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Score difference before/after masking PII: {metrics.scoreDifference.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bias Check</CardTitle>
            <CardDescription>PII masking impact analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Score Difference</span>
                  <span className="font-medium">{metrics.scoreDifference.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${Math.min(metrics.scoreDifference * 5, 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Lower difference indicates better fairness. A difference of less than 5% is considered good.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
