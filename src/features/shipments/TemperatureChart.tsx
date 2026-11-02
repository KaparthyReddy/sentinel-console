import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TemperatureReading } from '@/api/types';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime, formatTemperature } from '@/utils/format';
import { isOutOfRange } from '@/utils/temperature';
import styles from './TemperatureChart.module.css';

interface TemperatureChartProps {
  readings: ReadonlyArray<TemperatureReading>;
  minC: number;
  maxC: number;
}

const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

const tableColumns = (minC: number, maxC: number): Column<TemperatureReading>[] => [
  {
    key: 'time',
    header: 'Time',
    rowHeader: true,
    render: (reading) => formatDateTime(reading.timestamp),
  },
  {
    key: 'temperature',
    header: 'Temperature',
    align: 'right',
    render: (reading) => formatTemperature(reading.temperatureC),
  },
  {
    key: 'state',
    header: 'Within range',
    render: (reading) => (isOutOfRange(reading.temperatureC, minC, maxC) ? 'No' : 'Yes'),
  },
];

export function TemperatureChart({ readings, minC, maxC }: TemperatureChartProps) {
  if (readings.length === 0) {
    return <EmptyState title="No readings yet" description="Readings will appear once the sensor reports." />;
  }

  const data = readings.map((reading) => ({
    ts: new Date(reading.timestamp).getTime(),
    temperatureC: reading.temperatureC,
  }));

  const temps = readings.map((reading) => reading.temperatureC);
  const lowest = Math.min(...temps);
  const highest = Math.max(...temps);
  const latest = temps[temps.length - 1];
  const domainLow = Math.floor(Math.min(minC, lowest)) - 1;
  const domainHigh = Math.ceil(Math.max(maxC, highest)) + 1;

  const summary =
    `Line chart of ${readings.length} temperature readings. ` +
    `Latest ${formatTemperature(latest)}, lowest ${formatTemperature(lowest)}, ` +
    `highest ${formatTemperature(highest)}. Allowed range ${minC} to ${maxC} degrees Celsius.`;

  const recent = readings.slice(-12).reverse();

  return (
    <div className="stack">
      {/* The chart is one image to assistive tech; the table below holds the data */}
      <div role="img" aria-label={summary} className={styles.chart}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
            <XAxis
              dataKey="ts"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value: number) => clock.format(value)}
              tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
              stroke="var(--chart-axis)"
            />
            <YAxis
              domain={[domainLow, domainHigh]}
              width={48}
              tickFormatter={(value: number) => `${value}\u00b0`}
              tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
              stroke="var(--chart-axis)"
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
              labelFormatter={(label) => formatDateTime(new Date(Number(label)).toISOString())}
              formatter={(value) => formatTemperature(Number(value))}
            />
            <ReferenceLine
              y={maxC}
              stroke="var(--chart-threshold)"
              strokeDasharray="6 4"
              label={{ value: `Max ${maxC} \u00b0C`, position: 'insideTopRight', fill: 'var(--chart-threshold)', fontSize: 12 }}
            />
            <ReferenceLine
              y={minC}
              stroke="var(--chart-threshold)"
              strokeDasharray="6 4"
              label={{ value: `Min ${minC} \u00b0C`, position: 'insideBottomRight', fill: 'var(--chart-threshold)', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="temperatureC"
              name="Temperature"
              stroke="var(--chart-line)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className={styles.details}>
        <summary>View the latest readings as a table</summary>
        <DataTable
          caption="Temperature readings, most recent first"
          columns={tableColumns(minC, maxC)}
          rows={recent}
          getRowKey={(reading) => reading.timestamp}
        />
      </details>
    </div>
  );
}
